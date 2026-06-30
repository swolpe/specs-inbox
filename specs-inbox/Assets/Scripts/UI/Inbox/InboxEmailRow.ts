// InboxEmailRow owns the behavior for one reusable Gmail inbox row.
//
// Learning goal:
// InboxHudController still decides when rows are created and rendered, while this helper
// keeps row-specific construction, data binding, tap selection, and feedback in
// one focused place.

import { RoundedRectangle } from 'SpectaclesUIKit.lspkg/Scripts/Visuals/RoundedRectangle/RoundedRectangle';
import { Interactable } from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';
import { InteractorEvent } from 'SpectaclesInteractionKit.lspkg/Core/Interactor/InteractorEvent';
import { EmailData } from '../../Models/EmailData';
import { hashString, truncate } from '../../Utils/EmailTextFormatter';
import * as HudLayoutConfig from '../HudLayoutConfig';

type RowFeedbackState = 'default' | 'hover' | 'trigger';

export interface InboxEmailRowHelpers {
  createObject(parent: SceneObject, name: string, position?: vec3): SceneObject;
  addText(parent: SceneObject, value: string, size: number, position: vec3, color: vec4): Text;
  setTextBounds(text: Text, width: number, height: number,
    horizontalOverflow: HorizontalOverflow, verticalOverflow: VerticalOverflow,
    lineSpacing?: number): void;
  addHitArea(obj: SceneObject, width: number, height: number, onTap: () => void): Interactable;
}

export class InboxEmailRow {
  readonly root: SceneObject;

  private basePosition: vec3;
  private plate: RoundedRectangle;
  private basePlateColor: vec4;
  private accentColor: vec4;
  private isHovered = false;
  private fromText: Text;
  private subjectText: Text;
  private snippetText: Text;
  private accentText: Text;
  private dividerText: Text;
  private emailId = '';
  private feedbackState: RowFeedbackState = 'default';
  private transitionAlpha = 1;

  constructor(
    parent: SceneObject,
    index: number,
    private helpers: InboxEmailRowHelpers,
    private onSelected: (emailId: string) => void,
    private playHover: () => void,
    private playClick: () => void
  ) {
    const rowY = HudLayoutConfig.FIRST_ROW_Y - index * HudLayoutConfig.ROW_PITCH;
    this.basePosition = new vec3(0, rowY, 0);
    this.root = this.helpers.createObject(parent, 'Row' + index, this.basePosition);
    this.root.enabled = false;

    this.basePlateColor = (index % 2 === 0) ? HudLayoutConfig.COLOR_ROW_PLATE_A : HudLayoutConfig.COLOR_ROW_PLATE_B;
    this.accentColor = HudLayoutConfig.ROW_ACCENT_COLORS[index % HudLayoutConfig.ROW_ACCENT_COLORS.length];
    this.plate = this.addRowPlate(this.root, this.basePlateColor);

    // Invisible hit-area button covering the full row.
    const interactable = this.helpers.addHitArea(this.root, HudLayoutConfig.ROW_HIT_W, HudLayoutConfig.ROW_H, () => {
      if (this.emailId) {
        this.playClick();
        this.onSelected(this.emailId);
      }
    });

    // Three left-aligned text lines plus a small color accent for scanability.
    this.accentText = this.helpers.addText(this.root, '|', HudLayoutConfig.TS_HEADLINE,
      new vec3(HudLayoutConfig.ROW_ACCENT_X, 1.65, 0.05), this.accentColor);
    this.helpers.setTextBounds(this.accentText, 1.0, HudLayoutConfig.ROW_H, HorizontalOverflow.Overflow, VerticalOverflow.Truncate);

    this.fromText = this.helpers.addText(this.root, '', HudLayoutConfig.TS_CAPTION,
      new vec3(HudLayoutConfig.ROW_TEXT_X, 1.65, 0.05), HudLayoutConfig.COLOR_TEXT_PRIMARY);
    this.helpers.setTextBounds(this.fromText, HudLayoutConfig.ROW_TEXT_W, 1.25, HorizontalOverflow.Ellipsis, VerticalOverflow.Truncate);

    this.subjectText = this.helpers.addText(this.root, '', HudLayoutConfig.TS_CAPTION,
      new vec3(HudLayoutConfig.ROW_TEXT_X, 0.25, 0.05), HudLayoutConfig.COLOR_TEXT_SECONDARY);
    this.helpers.setTextBounds(this.subjectText, HudLayoutConfig.ROW_TEXT_W, 1.25, HorizontalOverflow.Ellipsis, VerticalOverflow.Truncate);

    this.snippetText = this.helpers.addText(this.root, '', HudLayoutConfig.TS_SMALL,
      new vec3(HudLayoutConfig.ROW_TEXT_X, -1.05, 0.05), HudLayoutConfig.COLOR_TEXT_SNIPPET);
    this.helpers.setTextBounds(this.snippetText, HudLayoutConfig.ROW_TEXT_W, 1.2, HorizontalOverflow.Ellipsis, VerticalOverflow.Truncate);

    this.dividerText = this.helpers.addText(this.root, '------------------------------------', HudLayoutConfig.TS_SMALL,
      new vec3(HudLayoutConfig.ROW_DIVIDER_X, -2.1, 0.05), HudLayoutConfig.COLOR_DIVIDER);
    this.helpers.setTextBounds(this.dividerText, HudLayoutConfig.ROW_DIVIDER_W, 0.8, HorizontalOverflow.Overflow, VerticalOverflow.Truncate);

    this.bindFeedback(interactable);
  }

  // Fills a row with sender, subject, snippet, and the Gmail ID used on tap.
  populate(email: EmailData): void {
    this.fromText.text = truncate(email.from, HudLayoutConfig.FROM_PREVIEW_MAX_CHARS);
    this.subjectText.text = truncate(email.subject, HudLayoutConfig.SUBJECT_PREVIEW_MAX_CHARS);
    this.snippetText.text = truncate(email.snippet, HudLayoutConfig.SNIPPET_PREVIEW_MAX_CHARS);
    this.accentColor = HudLayoutConfig.ROW_ACCENT_COLORS[
      Math.abs(hashString(email.id || email.from)) % HudLayoutConfig.ROW_ACCENT_COLORS.length
    ];
    this.emailId = email.id;
    this.setFeedback('default');
    this.root.enabled = true;
  }

  // Applies row transition alpha and scale without changing the row content.
  setTransitionVisual(alpha: number, scale: vec3): void {
    this.transitionAlpha = Math.max(0, Math.min(alpha, 1));
    this.root.getTransform().setLocalScale(scale);
    this.setFeedback(this.feedbackState);
  }

  // Disables an unused pre-allocated row and clears its stale Gmail ID.
  clear(): void {
    this.emailId = '';
    this.isHovered = false;
    this.setFeedback('default');
    this.setTransitionVisual(1, HudLayoutConfig.ROW_DEFAULT_SCALE);
    this.root.enabled = false;
  }

  // Creates the soft background plate behind the email row.
  private addRowPlate(parent: SceneObject, color: vec4): RoundedRectangle {
    const plateObj = this.helpers.createObject(parent, 'RowPlate', new vec3(0, 0, -0.04));
    const plate = plateObj.createComponent(RoundedRectangle.getTypeName()) as RoundedRectangle;
    plate.size = new vec2(HudLayoutConfig.ROW_PLATE_W, HudLayoutConfig.ROW_PLATE_H);
    plate.cornerRadius = 0.45;
    plate.gradient = false;
    plate.backgroundColor = color;
    plate.initialize();
    return plate;
  }

  // Connects hover/trigger feedback from SIK to the reusable row visuals.
  private bindFeedback(interactable: Interactable): void {
    interactable.onHoverEnter.add((_e: InteractorEvent) => {
      this.isHovered = true;
      this.setFeedback('hover');
      this.playHover();
    });
    interactable.onHoverExit.add((_e: InteractorEvent) => {
      this.isHovered = false;
      this.setFeedback('default');
    });
    interactable.onTriggerStart.add((_e: InteractorEvent) => {
      this.setFeedback('trigger');
    });
    interactable.onTriggerEnd.add((_e: InteractorEvent) => {
      this.setFeedback(this.isHovered ? 'hover' : 'default');
    });
    interactable.onTriggerEndOutside.add((_e: InteractorEvent) => {
      this.setFeedback('default');
    });
    interactable.onTriggerCanceled.add((_e: InteractorEvent) => {
      this.setFeedback('default');
    });
  }

  // Updates row offset and colors for default, hover, and trigger interaction states.
  private setFeedback(state: RowFeedbackState): void {
    this.feedbackState = state;
    const offsetX = state === 'trigger' ? HudLayoutConfig.ROW_TRIGGER_X : (state === 'hover' ? HudLayoutConfig.ROW_HOVER_X : 0);
    const offsetZ = state === 'trigger' ? HudLayoutConfig.ROW_TRIGGER_Z : (state === 'hover' ? HudLayoutConfig.ROW_HOVER_Z : 0);
    this.root.getTransform().setLocalPosition(
      new vec3(this.basePosition.x + offsetX, this.basePosition.y, this.basePosition.z + offsetZ)
    );

    if (state === 'default') {
      this.plate.backgroundColor = this.withAlphaMultiplier(this.basePlateColor, this.transitionAlpha);
      this.accentText.textFill.color = this.withAlphaMultiplier(this.accentColor, this.transitionAlpha);
      this.fromText.textFill.color = this.withAlphaMultiplier(HudLayoutConfig.COLOR_TEXT_PRIMARY, this.transitionAlpha);
      this.subjectText.textFill.color = this.withAlphaMultiplier(HudLayoutConfig.COLOR_TEXT_SECONDARY, this.transitionAlpha);
      this.snippetText.textFill.color = this.withAlphaMultiplier(HudLayoutConfig.COLOR_TEXT_SNIPPET, this.transitionAlpha);
      this.dividerText.textFill.color = this.withAlphaMultiplier(HudLayoutConfig.COLOR_DIVIDER, this.transitionAlpha);
      return;
    }

    const feedbackAlpha = state === 'trigger' ? 0.26 : 0.16;
    this.plate.backgroundColor = this.withAlpha(this.accentColor, feedbackAlpha * this.transitionAlpha);
    this.accentText.textFill.color = this.withAlpha(this.accentColor, this.transitionAlpha);
    this.fromText.textFill.color = this.withAlphaMultiplier(HudLayoutConfig.COLOR_TEXT_PRIMARY, this.transitionAlpha);
    this.subjectText.textFill.color = state === 'trigger'
      ? this.withAlphaMultiplier(HudLayoutConfig.COLOR_STATUS, this.transitionAlpha)
      : this.withAlpha(this.accentColor, 0.95 * this.transitionAlpha);
    this.snippetText.textFill.color = this.withAlphaMultiplier(HudLayoutConfig.COLOR_TEXT_SECONDARY, this.transitionAlpha);
    this.dividerText.textFill.color = this.withAlpha(this.accentColor, 0.36 * this.transitionAlpha);
  }

  // Returns a copy of a color with a different alpha value.
  private withAlpha(color: vec4, alpha: number): vec4 {
    return new vec4(color.x, color.y, color.z, alpha);
  }

  // Returns a copy of a color with its current alpha multiplied by the transition alpha.
  private withAlphaMultiplier(color: vec4, multiplier: number): vec4 {
    return new vec4(color.x, color.y, color.z, color.w * multiplier);
  }
}
