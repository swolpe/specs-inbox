// InboxHudController is the presentation layer for the project.
//
// InboxHudController owns panel orchestration and rendering only. It emits
// simple events when the user interacts with the HUD, and AppController decides
// what data action should happen next. This keeps UI code separate from Gmail
// networking, parsing code, and repeated low-level element construction.

import Event, { PublicApi } from 'SpectaclesInteractionKit.lspkg/Utils/Event';
import { EmailData } from '../Models/EmailData';
import * as HudLayoutConfig from './HudLayoutConfig';
import { HudSfxPlayer } from './HudSfxPlayer';
import { InboxEmailRow, InboxEmailRowHelpers } from './Inbox/InboxEmailRow';
import { UiElementFactory } from './Elements/UiElementFactory';
import { DetailPanelView } from './Detail/DetailPanelView';
import { InboxRowTransitionController } from './Inbox/InboxRowTransitionController';

// AppController may call setEmails/showStatus before OnStartEvent finishes
// building UI objects. This records the latest pending UI update until the
// inbox panel is ready.
type PendingInboxState =
  | { kind: 'emails'; emails: EmailData[] }
  | { kind: 'status'; message: string; showLoadingIcon: boolean }
  | null;

@component
export class InboxHudController extends BaseScriptComponent {
  // Runtime root for all generated Gmail UI objects.
  private uiPanelParent!: SceneObject;

  // ---- Events (UI → main script) ----
  // These private Event instances are invoked by UI interactions.
  // The public getters expose read-only subscription APIs to AppController.
  private emailSelectedEvent = new Event<string>();
  private refreshEvent       = new Event<void>();
  private detailCloseEvent   = new Event<void>();
  private previousPageEvent  = new Event<void>();
  private nextPageEvent      = new Event<void>();

  get onEmailSelected(): PublicApi<string> { return this.emailSelectedEvent.publicApi(); }
  get onRefresh():       PublicApi<void>   { return this.refreshEvent.publicApi(); }
  get onDetailClose():   PublicApi<void>   { return this.detailCloseEvent.publicApi(); }
  get onPreviousPage():  PublicApi<void>   { return this.previousPageEvent.publicApi(); }
  get onNextPage():      PublicApi<void>   { return this.nextPageEvent.publicApi(); }

  // ---- Inbox state ----
  // Object/component references created during panel construction. They are
  // stored so later public API calls can update the already-built UI.
  private inboxRoot!: SceneObject;
  private emailRows: InboxEmailRow[] = [];
  private statusRoot!: SceneObject;
  private statusLabel!: Text;
  private statusLoadingIcon!: SceneObject;
  private previousPageRoot!: SceneObject;
  private nextPageRoot!: SceneObject;
  private inboxInitialized = false;
  private pendingInboxState: PendingInboxState = null;
  private pendingPaginationState: { hasPrevious: boolean; hasNext: boolean } | null = null;

  // ---- Inbox row transition state ----
  // Row transition timing/rendering lives in InboxRowTransitionController so
  // InboxHudController can stay focused on top-level panel orchestration.
  private rowTransitionController!: InboxRowTransitionController;

  // ---- Detail state ----
  // Detail panel construction/rendering lives in DetailPanelView so InboxHudController
  // can stay focused on top-level panel orchestration and inbox rendering.
  private detailPanel!: DetailPanelView;

  // ---- Row SFX state ----
  private sfxPlayer!: HudSfxPlayer;

  // Shared low-level UI element construction used by inbox, detail, and rows.
  private elementFactory!: UiElementFactory;

  // Adapter passed into InboxEmailRow so rows can build UI without knowing
  // about the full UiElementFactory class.
  private rowHelpers!: InboxEmailRowHelpers;

  // ========== Lifecycle ==========

  // Called by AppController after it creates this component.
  initialize(hoverSfx?: AudioTrackAsset, clickSfx?: AudioTrackAsset, buttonHoverSfx?: AudioTrackAsset, pageClickSfx?: AudioTrackAsset, closeClickSfx?: AudioTrackAsset, refreshSfx?: AudioTrackAsset, rowTransitionSfx?: AudioTrackAsset): void {
    this.uiPanelParent = global.scene.createSceneObject('InboxHudControllerPanelParent');
    this.uiPanelParent.createComponent('Component.Canvas');
    this.sfxPlayer = new HudSfxPlayer(this.uiPanelParent, hoverSfx, clickSfx, buttonHoverSfx, pageClickSfx, closeClickSfx, refreshSfx, rowTransitionSfx);
    this.elementFactory = new UiElementFactory();
    this.rowHelpers = this.createRowHelpers();
    this.rowTransitionController = new InboxRowTransitionController(
      this.createEvent('UpdateEvent') as UpdateEvent,
      () => this.emailRows,
      () => this.sfxPlayer.playRowTransition()
    );
    this.buildInboxPanel();
    this.detailPanel = new DetailPanelView({
      uiPanelParent: this.uiPanelParent,
      elementFactory: this.elementFactory,
      sfxPlayer: this.sfxPlayer,
      createEvent: this.createEvent.bind(this),
      getInboxRoot: () => this.inboxRoot,
      onCloseRequested: () => this.detailCloseEvent.invoke(),
    });
    this.detailPanel.buildDetailPanel();
  }

  // ========== Public API used by AppController ==========

  // Public entry point used by AppController after inbox metadata is loaded.
  setEmails(emails: EmailData[]): void {
    if (!this.inboxInitialized) {
      this.pendingInboxState = { kind: 'emails', emails };
      return;
    }

    this.pendingInboxState = null;
    this.hideStatus();
    this.rowTransitionController.start(emails);
  }

  // Shows a temporary status message such as loading, empty inbox, or token errors.
  showStatus(message: string, showLoadingIcon: boolean = false): void {
    if (!this.inboxInitialized) {
      this.pendingInboxState = { kind: 'status', message, showLoadingIcon };
      return;
    }

    this.statusLabel.text = message;
    if (this.statusLoadingIcon) this.statusLoadingIcon.enabled = showLoadingIcon;
    this.statusRoot.enabled = true;
  }

  // Hides the status overlay once rows/detail content are ready.
  hideStatus(): void {
    if (!this.inboxInitialized) {
      if (this.pendingInboxState?.kind === 'status') this.pendingInboxState = null;
      return;
    }

    if (this.statusLoadingIcon) this.statusLoadingIcon.enabled = false;
    this.statusRoot.enabled = false;
  }

  // Shows or hides pagination controls based on the currently loaded page.
  setPaginationState(hasPrevious: boolean, hasNext: boolean): void {
    if (!this.inboxInitialized) {
      this.pendingPaginationState = { hasPrevious, hasNext };
      return;
    }

    if (this.previousPageRoot) this.previousPageRoot.enabled = hasPrevious;
    if (this.nextPageRoot) this.nextPageRoot.enabled = hasNext;
    this.pendingPaginationState = null;
  }

  // Shows a status message owned by the detail panel so it remains visible while
  // the inbox panel is hidden.
  showDetailStatus(message: string): void {
    this.detailPanel.showDetailStatus(message);
  }

  // Hides the detail-panel status message once the full email has loaded or the
  // detail load has stopped.
  hideDetailStatus(): void {
    this.detailPanel.hideDetailStatus();
  }

  // Switches from inbox panel to detail panel and fills in selected email text.
  showDetail(email: EmailData): void {
    this.detailPanel.showDetail(email);
  }

  // Returns from detail view back to the inbox list.
  hideDetail(): void {
    this.detailPanel.hideDetail();
  }

  // ========== Inbox panel construction ==========

  // Creates the inbox panel root and schedules the child UI to be built at start.
  // OnStartEvent is used so UIKit/SIK components are ready before interaction setup.
  private buildInboxPanel(): void {
    // Create the inbox panel under the runtime-generated UI parent at HUD distance.
    const panelRoot = this.elementFactory.createObject(this.uiPanelParent, 'InboxPanel', HudLayoutConfig.INBOX_PANEL_POSITION);
    this.inboxRoot = panelRoot;
    this.elementFactory.addPanelFrame(panelRoot);

    this.createEvent('OnStartEvent').bind(() => {
      if (this.inboxInitialized) return;

      // All visible content is parented under this object so it can sit forward
      // from the frame background as one group.
      const content = this.elementFactory.createObject(panelRoot, 'Content', new vec3(0, 0, HudLayoutConfig.CONTENT_Z));

      this.buildInboxHeader(content);
      this.buildInboxStatus(panelRoot);
      this.buildEmailRows(content);
      this.buildPaginationControls(content);

      this.inboxInitialized = true;
      this.applyPendingInboxState();
      this.applyPendingPaginationState();
    });
  }

  // Builds the inbox title and refresh button.
  private buildInboxHeader(content: SceneObject): void {
    const header = this.elementFactory.createObject(content, 'Header', new vec3(0, HudLayoutConfig.HEADER_Y, 0));
    this.elementFactory.addIcon(header, HudLayoutConfig.ICON_MAIL, 3.2, new vec3(HudLayoutConfig.HEADER_ICON_X, 0, 0));
    const titleText = this.elementFactory.addText(header, 'Inbox', HudLayoutConfig.TS_INBOX_HEADER, new vec3(0, 0, 0.05), HudLayoutConfig.COLOR_INBOX_HEADER_TEXT);
    titleText.worldSpaceRect = Rect.create(-HudLayoutConfig.INBOX_HEADER_TEXT_W / 2, HudLayoutConfig.INBOX_HEADER_TEXT_W / 2, -HudLayoutConfig.HEADER_H / 2, HudLayoutConfig.HEADER_H / 2);
    titleText.horizontalAlignment = HorizontalAlignment.Center;
    titleText.verticalAlignment = VerticalAlignment.Center;
    titleText.textFill.mode = TextFillMode.Solid;
    titleText.textFill.color = HudLayoutConfig.COLOR_INBOX_HEADER_TEXT;
    this.elementFactory.addTapButton(header, HudLayoutConfig.ICON_REFRESH, 3.0, new vec3(HudLayoutConfig.HEADER_REFRESH_BUTTON_X, 0, 0), 5, 5, () => {
      this.sfxPlayer.playRefresh();
      this.refreshEvent.invoke();
    }, () => this.sfxPlayer.playButtonHover());
  }

  // Builds the inbox-level status overlay used for loading and error messages.
  private buildInboxStatus(panelRoot: SceneObject): void {
    const statusObj = this.elementFactory.createObject(panelRoot, 'Status', new vec3(0, 0, HudLayoutConfig.STATUS_Z));
    this.elementFactory.addBackPlate(statusObj, new vec2(HudLayoutConfig.STATUS_PLATE_W, HudLayoutConfig.STATUS_PLATE_H));
    const loadingIcon = this.buildStatusLoadingIcon(statusObj);
    const statusText = this.elementFactory.addText(statusObj, '', HudLayoutConfig.TS_BODY, new vec3(0, 0, 0.1), HudLayoutConfig.COLOR_STATUS);
    this.statusRoot  = statusObj;
    this.statusLabel = statusText;
    this.statusLoadingIcon = loadingIcon;
    statusObj.enabled = false;
  }

  // Creates the loading material icon shown beside the inbox loading status.
  private buildStatusLoadingIcon(statusObj: SceneObject): SceneObject {
    const loadingIcon = this.elementFactory.createObject(statusObj, 'LoadingIcon', new vec3(HudLayoutConfig.STATUS_LOADING_ICON_X, 0, 0.12));
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

  // Creates the fixed row pool that the transition controller reuses for every inbox page.
  private buildEmailRows(content: SceneObject): void {
    for (let i = 0; i < HudLayoutConfig.MAX_EMAIL_ROWS; i++) {
      this.emailRows.push(this.createEmailRow(content, i));
    }
  }

  // Builds previous/next page buttons and wires them to public UI events.
  private buildPaginationControls(content: SceneObject): void {
    this.previousPageRoot = this.elementFactory.addTapButton(content, HudLayoutConfig.ICON_ARROW_BACK, HudLayoutConfig.PAGINATION_ICON_SIZE,
      new vec3(-HudLayoutConfig.PAGINATION_BUTTON_SPACING / 2, HudLayoutConfig.PAGINATION_Y, 0.2), 5, 5, () => {
      this.sfxPlayer.playPageClick();
      this.previousPageEvent.invoke();
    }, () => this.sfxPlayer.playButtonHover());

    this.nextPageRoot = this.elementFactory.addTapButton(content, HudLayoutConfig.ICON_ARROW_BACK, HudLayoutConfig.PAGINATION_ICON_SIZE,
      new vec3(HudLayoutConfig.PAGINATION_BUTTON_SPACING / 2, HudLayoutConfig.PAGINATION_Y, 0.2), 5, 5, () => {
      this.sfxPlayer.playPageClick();
      this.nextPageEvent.invoke();
    }, () => this.sfxPlayer.playButtonHover(), true);

    this.previousPageRoot.enabled = false;
    this.nextPageRoot.enabled = false;
  }

  // Creates the small helper surface a row needs from UiElementFactory.
  // Keeping this adapter in one place makes the InboxHudController ↔ InboxEmailRow
  // boundary easier to understand than passing an inline object per row.
  private createRowHelpers(): InboxEmailRowHelpers {
    return {
      createObject: (rowParent: SceneObject, name: string, position?: vec3) =>
        this.elementFactory.createObject(rowParent, name, position),
      addText: (textParent: SceneObject, value: string, size: number, position: vec3, color: vec4) =>
        this.elementFactory.addText(textParent, value, size, position, color),
      setTextBounds: (text: Text, width: number, height: number, horizontalOverflow: HorizontalOverflow,
          verticalOverflow: VerticalOverflow, lineSpacing?: number) =>
        this.elementFactory.setTextBounds(text, width, height, horizontalOverflow, verticalOverflow, lineSpacing),
      addHitArea: (obj: SceneObject, width: number, height: number, onTap: () => void) =>
        this.elementFactory.addHitArea(obj, width, height, onTap),
    };
  }

  // Creates one reusable inbox row at a fixed vertical slot.
  private createEmailRow(parent: SceneObject, index: number): InboxEmailRow {
    return new InboxEmailRow(
      parent,
      index,
      this.rowHelpers,
      (emailId: string) => this.emailSelectedEvent.invoke(emailId),
      () => this.sfxPlayer.playHover(),
      () => this.sfxPlayer.playClick()
    );
  }


  // Applies the latest setEmails/showStatus call that arrived before the inbox
  // panel finished building. Only the newest pending state is preserved.
  private applyPendingInboxState(): void {
    const pendingState = this.pendingInboxState;
    if (pendingState === null) return;

    this.pendingInboxState = null;
    if (pendingState.kind === 'emails') {
      this.setEmails(pendingState.emails);
    } else {
      this.showStatus(pendingState.message, pendingState.showLoadingIcon);
    }
  }

  // Applies pagination visibility that arrived before the inbox panel was ready.
  private applyPendingPaginationState(): void {
    const pendingState = this.pendingPaginationState;
    if (pendingState === null) return;

    this.setPaginationState(pendingState.hasPrevious, pendingState.hasNext);
  }

}
