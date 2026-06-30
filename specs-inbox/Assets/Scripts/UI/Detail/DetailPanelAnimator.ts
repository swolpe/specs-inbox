// DetailPanelAnimator owns the open/close transition for the Gmail detail panel.
//
// Learning goal:
// Animation state is isolated from InboxHudController so the main UI script can focus on
// building panels and rendering text. This helper only moves/scales the existing
// detail panel during open and close transitions.

import * as HudLayoutConfig from '../HudLayoutConfig';

export class DetailPanelAnimator {
  private animationActive = false;
  private animationOpening = false;
  private animationElapsed = 0;
  private animationStartPosition = HudLayoutConfig.DETAIL_CLOSED_POSITION;
  private animationEndPosition = HudLayoutConfig.DETAIL_CLOSED_POSITION;
  private animationStartScale = HudLayoutConfig.DETAIL_OPEN_SCALE;
  private animationEndScale = HudLayoutConfig.DETAIL_OPEN_SCALE;

  constructor(
    private updateEvent: UpdateEvent,
    private getInboxRoot: () => SceneObject,
    private getDetailRoot: () => SceneObject,
    private onCloseComplete: () => void
  ) {
    this.updateEvent.enabled = false;
    this.updateEvent.bind((eventData: UpdateEvent) => {
      this.update(eventData.getDeltaTime());
    });
  }

  // Used by InboxHudController to decide whether a new detail selection should restart
  // the opening animation while a close animation is still in progress.
  isClosing(): boolean {
    return this.animationActive && !this.animationOpening;
  }

  // Initializes one open/close animation using the current panel transform as
  // the start state.
  start(opening: boolean): void {
    const detailRoot = this.getDetailRoot();
    const transform = detailRoot.getTransform();
    const inboxPosition = this.getInboxLocalPosition();
    const detailOpenPosition = this.getDetailOpenPosition();

    this.animationOpening = opening;
    this.animationActive = true;
    this.animationElapsed = 0;
    this.animationStartPosition = opening ? inboxPosition : transform.getLocalPosition();
    this.animationEndPosition = opening ? detailOpenPosition : inboxPosition;
    this.animationStartScale = opening ? HudLayoutConfig.DETAIL_CLOSED_SCALE : transform.getLocalScale();
    this.animationEndScale = opening ? HudLayoutConfig.DETAIL_OPEN_SCALE : HudLayoutConfig.DETAIL_CLOSED_SCALE;

    if (opening) {
      transform.setLocalPosition(inboxPosition);
      transform.setLocalScale(HudLayoutConfig.DETAIL_CLOSED_SCALE);
      detailRoot.enabled = true;
    }

    this.updateEvent.enabled = true;
  }

  // Advances the active detail animation and restores the inbox when closing completes.
  private update(deltaTime: number): void {
    if (!this.animationActive) {
      this.updateEvent.enabled = false;
      return;
    }

    this.animationElapsed += deltaTime;
    const rawT = Math.min(this.animationElapsed / HudLayoutConfig.DETAIL_ANIMATION_SECONDS, 1);
    const easedT = this.animationOpening ? this.easeOutBack(rawT) : this.easeInBack(rawT);

    const detailRoot = this.getDetailRoot();
    const transform = detailRoot.getTransform();
    transform.setLocalPosition(this.lerpVec3(this.animationStartPosition, this.animationEndPosition, easedT));
    transform.setLocalScale(this.lerpVec3(this.animationStartScale, this.animationEndScale, easedT));

    if (rawT < 1) return;

    this.animationActive = false;
    this.updateEvent.enabled = false;
    transform.setLocalPosition(this.animationEndPosition);
    transform.setLocalScale(this.animationEndScale);

    if (!this.animationOpening) {
      detailRoot.enabled = false;
      this.onCloseComplete();
    }
  }

  // Reads a copy of the inbox position so animation math does not mutate the transform value.
  private getInboxLocalPosition(): vec3 {
    const position = this.getInboxRoot().getTransform().getLocalPosition();
    return new vec3(position.x, position.y, position.z);
  }

  // Opens the detail panel slightly in front of the inbox panel.
  getDetailOpenPosition(): vec3 {
    const inboxPosition = this.getInboxLocalPosition();
    return new vec3(
      inboxPosition.x + HudLayoutConfig.DETAIL_OPEN_OFFSET_FROM_INBOX.x,
      inboxPosition.y + HudLayoutConfig.DETAIL_OPEN_OFFSET_FROM_INBOX.y,
      inboxPosition.z + HudLayoutConfig.DETAIL_OPEN_OFFSET_FROM_INBOX.z
    );
  }

  // Small overshoot easing used when the detail panel opens.
  private easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  // Matching easing used when the detail panel closes.
  private easeInBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  }

  // Linear interpolation helper for position and scale animation.
  private lerpVec3(start: vec3, end: vec3, t: number): vec3 {
    return new vec3(
      start.x + (end.x - start.x) * t,
      start.y + (end.y - start.y) * t,
      start.z + (end.z - start.z) * t
    );
  }
}
