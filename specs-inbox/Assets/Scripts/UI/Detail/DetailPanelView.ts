// DetailPanelView owns the generated Gmail email-detail panel.
//
// Learning goal:
// InboxHudController coordinates top-level UI events and inbox rendering. This helper keeps
// detail-panel scene construction, text population, status display, and the
// detail open/close animation together in one focused place.

import { EmailData } from '../../Models/EmailData';
import { formatEmailBody, formatLabeledLine, formatSingleLine, hashString } from '../../Utils/EmailTextFormatter';
import * as HudLayoutConfig from '../HudLayoutConfig';
import { DetailPanelAnimator } from './DetailPanelAnimator';
import { HudSfxPlayer } from '../HudSfxPlayer';
import { UiElementFactory } from '../Elements/UiElementFactory';

type CreateSceneEvent = <K extends keyof EventNameMap>(eventName: K) => EventNameMap[K];

type DetailPanelOptions = {
  uiPanelParent: SceneObject;
  elementFactory: UiElementFactory;
  sfxPlayer: HudSfxPlayer;
  createEvent: CreateSceneEvent;
  getInboxRoot: () => SceneObject;
  onCloseRequested: () => void;
};

export class DetailPanelView {
  private detailRoot!: SceneObject;
  private detailSubjectText!: Text;
  private detailSubjectAccentText!: Text;
  private detailFromText!: Text;
  private detailDateText!: Text;
  private detailBodyText!: Text;
  private detailStatusRoot!: SceneObject;
  private detailStatusLabel!: Text;
  private detailStatusLoadingIcon!: SceneObject;
  private detailInitialized = false;
  private detailAnimator!: DetailPanelAnimator;

  constructor(private options: DetailPanelOptions) {
    this.createDetailAnimator();
  }

  // Creates the detail panel used when the user opens one message.
  buildDetailPanel(): void {
    const detailRoot = this.options.elementFactory.createObject(
      this.options.uiPanelParent,
      'DetailPanel',
      this.detailAnimator.getDetailOpenPosition()
    );
    this.detailRoot = detailRoot;

    this.options.elementFactory.addPanelFrame(detailRoot);

    detailRoot.enabled = false;

    this.options.createEvent('OnStartEvent').bind(() => {
      if (this.detailInitialized) return;
      this.detailInitialized = true;

      // Separate content root mirrors the inbox panel layout.
      const content = this.options.elementFactory.createObject(detailRoot, 'Content', new vec3(0, 0, HudLayoutConfig.CONTENT_Z));

      this.buildDetailHeader(content);
      this.buildDetailMetadata(content);
      this.buildDetailBody(content);
      this.buildDetailStatus(detailRoot);
    });
  }

  // Shows a status message owned by the detail panel so it remains visible while
  // the inbox panel is hidden.
  showDetailStatus(message: string): void {
    if (!this.detailStatusRoot || !this.detailStatusLabel) return;

    this.detailStatusLabel.text = message;
    if (this.detailStatusLoadingIcon) this.detailStatusLoadingIcon.enabled = true;
    this.detailStatusRoot.enabled = true;
  }

  // Hides the detail-panel status message once the full email has loaded or the
  // detail load has stopped.
  hideDetailStatus(): void {
    if (!this.detailStatusRoot) return;

    if (this.detailStatusLoadingIcon) this.detailStatusLoadingIcon.enabled = false;
    this.detailStatusRoot.enabled = false;
  }

  // Switches from inbox panel to detail panel and fills in selected email text.
  showDetail(email: EmailData): void {
    if (!this.detailRoot) return;

    this.syncDetailRotationToInbox();

    const shouldAnimateOpen = !this.detailRoot.enabled || this.detailAnimator.isClosing();
    const inboxRoot = this.options.getInboxRoot();

    if (inboxRoot) inboxRoot.enabled = false;
    this.populateDetailText(email);

    if (shouldAnimateOpen) {
      this.detailAnimator.start(true);
    } else {
      this.detailRoot.enabled = true;
    }
  }

  // Returns from detail view back to the inbox list.
  hideDetail(): void {
    this.hideDetailStatus();
    if (!this.detailRoot || !this.detailRoot.enabled) return;

    this.detailAnimator.start(false);
  }

  // Builds the detail-panel subject header and close button.
  private buildDetailHeader(content: SceneObject): void {
    const header = this.options.elementFactory.createObject(content, 'Header', new vec3(0, HudLayoutConfig.HEADER_Y, 0));
    const closeDetail = () => {
      this.options.sfxPlayer.playCloseClick();
      this.options.onCloseRequested();
    };

    // this.options.elementFactory.addContentPlate(header, 'SubjectPlate',
    //   new vec2(HudLayoutConfig.DETAIL_SUBJECT_PLATE_W, HudLayoutConfig.DETAIL_SUBJECT_PLATE_H),
    //   new vec3(HudLayoutConfig.DETAIL_SUBJECT_PLATE_X, HudLayoutConfig.DETAIL_SUBJECT_PLATE_Y, HudLayoutConfig.DETAIL_CONTENT_PLATE_Z),
    //   HudLayoutConfig.COLOR_DETAIL_SUBJECT_PLATE, HudLayoutConfig.DETAIL_CONTENT_PLATE_CORNER_RADIUS);

    this.detailSubjectAccentText = this.options.elementFactory.addText(header, '|', HudLayoutConfig.TS_SUBHEAD,
      new vec3(HudLayoutConfig.DETAIL_SUBJECT_ACCENT_X, 0, 0.05), HudLayoutConfig.COLOR_HEADER_ACCENT);
    this.options.elementFactory.setTextBounds(this.detailSubjectAccentText, HudLayoutConfig.DETAIL_SUBJECT_ACCENT_W, HudLayoutConfig.HEADER_H,
      HorizontalOverflow.Overflow, VerticalOverflow.Truncate);

    this.detailSubjectText = this.options.elementFactory.addText(header, 'Subject', HudLayoutConfig.TS_SUBHEAD,
      new vec3(HudLayoutConfig.DETAIL_SUBJECT_TEXT_X, 0, 0.05), HudLayoutConfig.COLOR_TEXT_PRIMARY);
    this.options.elementFactory.setTextBounds(this.detailSubjectText, HudLayoutConfig.DETAIL_SUBJECT_TEXT_W, HudLayoutConfig.HEADER_H,
      HorizontalOverflow.Ellipsis, VerticalOverflow.Truncate);
    this.options.elementFactory.addTapButton(header, HudLayoutConfig.ICON_CLOSE, 2.8, new vec3(HudLayoutConfig.HEADER_CLOSE_BUTTON_X, 0, 0), 5, 5, closeDetail, () => this.options.sfxPlayer.playButtonHover());
  }

  // Builds sender/date fields in the detail panel.
  private buildDetailMetadata(content: SceneObject): void {
    this.options.elementFactory.addContentPlate(content, 'MetadataPlate',
      new vec2(HudLayoutConfig.DETAIL_METADATA_PLATE_W, HudLayoutConfig.DETAIL_METADATA_PLATE_H),
      new vec3(0, HudLayoutConfig.DETAIL_METADATA_PLATE_Y, HudLayoutConfig.DETAIL_CONTENT_PLATE_Z),
      HudLayoutConfig.COLOR_DETAIL_METADATA_PLATE, HudLayoutConfig.DETAIL_CONTENT_PLATE_CORNER_RADIUS);

    this.detailFromText = this.options.elementFactory.addText(content, '', HudLayoutConfig.TS_BODY,
      new vec3(HudLayoutConfig.DETAIL_TEXT_INSET_X, HudLayoutConfig.DETAIL_FROM_Y, 0.05), HudLayoutConfig.COLOR_TEXT_MUTED);
    this.options.elementFactory.setTextBounds(this.detailFromText, HudLayoutConfig.DETAIL_TEXT_INSET_W, 3.0,
      HorizontalOverflow.Ellipsis, VerticalOverflow.Truncate);

    this.detailDateText = this.options.elementFactory.addText(content, '', HudLayoutConfig.TS_SMALL,
      new vec3(HudLayoutConfig.DETAIL_TEXT_INSET_X, HudLayoutConfig.DETAIL_DATE_Y, 0.05), HudLayoutConfig.COLOR_TEXT_FAINT);
    this.options.elementFactory.setTextBounds(this.detailDateText, HudLayoutConfig.DETAIL_TEXT_INSET_W, 2.5,
      HorizontalOverflow.Ellipsis, VerticalOverflow.Truncate);
  }

  // Builds the bounded email body text area in the detail panel.
  private buildDetailBody(content: SceneObject): void {
    this.options.elementFactory.addContentPlate(content, 'BodyPlate',
      new vec2(HudLayoutConfig.DETAIL_BODY_PLATE_W, HudLayoutConfig.DETAIL_BODY_PLATE_H),
      new vec3(0, HudLayoutConfig.DETAIL_BODY_PLATE_Y, HudLayoutConfig.DETAIL_CONTENT_PLATE_Z),
      HudLayoutConfig.COLOR_DETAIL_BODY_PLATE, HudLayoutConfig.DETAIL_CONTENT_PLATE_CORNER_RADIUS);

    this.detailBodyText = this.options.elementFactory.addText(content, '', HudLayoutConfig.TS_BODY,
      new vec3(HudLayoutConfig.DETAIL_TEXT_INSET_X, HudLayoutConfig.DETAIL_BODY_Y, 0.05), HudLayoutConfig.COLOR_TEXT_SECONDARY);
    this.options.elementFactory.setTextBounds(this.detailBodyText, HudLayoutConfig.DETAIL_TEXT_INSET_W, HudLayoutConfig.DETAIL_BODY_H,
      HorizontalOverflow.Wrap, VerticalOverflow.Truncate, 1.08);
  }

  // Builds the detail-level loading status shown while a full message loads.
  // It mirrors the inbox loading status placement and visual treatment so both
  // panels communicate loading the same way.
  private buildDetailStatus(detailRoot: SceneObject): void {
    const detailStatusObj = this.options.elementFactory.createObject(detailRoot, 'DetailStatus',
      new vec3(0, 0, HudLayoutConfig.STATUS_Z));
    this.options.elementFactory.addBackPlate(detailStatusObj, new vec2(HudLayoutConfig.STATUS_PLATE_W, HudLayoutConfig.STATUS_PLATE_H));
    const detailStatusLoadingIcon = this.buildDetailStatusLoadingIcon(detailStatusObj);
    const detailStatusText = this.options.elementFactory.addText(detailStatusObj, '', HudLayoutConfig.TS_BODY,
      new vec3(0, 0, 0.1), HudLayoutConfig.COLOR_STATUS);
    this.detailStatusRoot = detailStatusObj;
    this.detailStatusLabel = detailStatusText;
    this.detailStatusLoadingIcon = detailStatusLoadingIcon;
    detailStatusObj.enabled = false;
  }

  // Creates the loading material icon shown beside the detail loading status.
  private buildDetailStatusLoadingIcon(detailStatusObj: SceneObject): SceneObject {
    const loadingIcon = this.options.elementFactory.createObject(detailStatusObj, 'LoadingIcon', new vec3(HudLayoutConfig.STATUS_LOADING_ICON_X, 0, 0.12));
    const image = loadingIcon.createComponent('Component.Image') as Image;
    const material = HudLayoutConfig.LOADING_MAT.clone() as Material;
    material.mainPass.depthTest = true;
    material.mainPass.depthWrite = false;
    image.clearMaterials();
    image.addMaterial(material);
    loadingIcon.getTransform().setLocalScale(new vec3(HudLayoutConfig.STATUS_LOADING_ICON_SIZE, HudLayoutConfig.STATUS_LOADING_ICON_SIZE, 1));
    loadingIcon.enabled = false;
    return loadingIcon;
  }

  // Copies selected email content into the existing detail text components.
  private populateDetailText(email: EmailData): void {
    if (this.detailSubjectAccentText) this.detailSubjectAccentText.textFill.color = this.getEmailAccentColor(email);
    if (this.detailSubjectText) this.detailSubjectText.text = formatSingleLine(email.subject);
    if (this.detailFromText)    this.detailFromText.text    = formatLabeledLine('From', email.from);
    if (this.detailDateText)    this.detailDateText.text    = formatLabeledLine('Date', email.date);
    if (this.detailBodyText)    this.detailBodyText.text    = 'Message:\n' + formatEmailBody(email.body || email.snippet);
  }


  // Uses the same stable email-based accent selection as InboxEmailRow so the
  // detail subject carries the selected row's color cue forward.
  private getEmailAccentColor(email: EmailData): vec4 {
    return HudLayoutConfig.ROW_ACCENT_COLORS[
      Math.abs(hashString(email.id || email.from)) % HudLayoutConfig.ROW_ACCENT_COLORS.length
    ];
  }

  // Keeps the detail-panel animation disabled until an open/close transition starts.
  private createDetailAnimator(): void {
    const updateEvent = this.options.createEvent('UpdateEvent') as UpdateEvent;
    this.detailAnimator = new DetailPanelAnimator(
      updateEvent,
      this.options.getInboxRoot,
      () => this.detailRoot,
      () => {
        const inboxRoot = this.options.getInboxRoot();
        if (inboxRoot) inboxRoot.enabled = true;
      }
    );
  }

  // Matches the detail panel orientation to the inbox before showing it.
  private syncDetailRotationToInbox(): void {
    const inboxRoot = this.options.getInboxRoot();
    if (!inboxRoot || !this.detailRoot) return;

    this.detailRoot.getTransform().setLocalRotation(inboxRoot.getTransform().getLocalRotation());
  }
}
