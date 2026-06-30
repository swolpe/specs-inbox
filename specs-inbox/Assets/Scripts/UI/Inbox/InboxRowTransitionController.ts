// InboxRowTransitionController owns the sequential inbox row transition.
//
// Learning goal:
// InboxHudController decides when inbox data should render. This helper keeps the row
// transition state, timing, easing, and reusable-row population together in one
// focused place so InboxHudController can stay focused on panel orchestration.

import { EmailData } from '../../Models/EmailData';
import { InboxEmailRow } from './InboxEmailRow';
import * as HudLayoutConfig from '../HudLayoutConfig';

type RowTransitionMode = 'idle' | 'fadeOut' | 'fadeIn';

export class InboxRowTransitionController {
  private rowTransitionMode: RowTransitionMode = 'idle';
  private rowTransitionElapsed = 0;
  private rowTransitionRowCount = 0;
  private visibleEmailRowCount = 0;
  private transitionTargetEmails: EmailData[] = [];
  private queuedTransitionEmails: EmailData[] | null = null;

  constructor(
    private rowTransitionUpdateEvent: UpdateEvent,
    private getEmailRows: () => InboxEmailRow[],
    private playRowTransitionSfx: () => void
  ) {
    this.rowTransitionUpdateEvent.enabled = false;
    this.rowTransitionUpdateEvent.bind((eventData: UpdateEvent) => {
      this.updateEmailRowTransition(eventData.getDeltaTime());
    });
  }

  // Starts the render transition. Existing visible rows fade out first; then the
  // new inbox data is copied into the reusable row pool and faded in.
  start(emails: EmailData[]): void {
    const targetEmails = emails.slice(0, HudLayoutConfig.MAX_EMAIL_ROWS);

    if (this.rowTransitionMode === 'fadeOut') {
      this.transitionTargetEmails = targetEmails;
      return;
    }

    if (this.rowTransitionMode === 'fadeIn') {
      this.queuedTransitionEmails = targetEmails;
      return;
    }

    this.transitionTargetEmails = targetEmails;

    if (this.visibleEmailRowCount > 0) {
      this.startRowTransitionPhase('fadeOut', this.visibleEmailRowCount);
      return;
    }

    this.renderEmailRowsForTransition(targetEmails);
    if (this.visibleEmailRowCount > 0) {
      this.prepareRowsForFadeIn();
      this.startRowTransitionPhase('fadeIn', this.visibleEmailRowCount);
    }
  }

  // Copies email data into the pre-created row objects and hides unused rows.
  private renderEmailRowsForTransition(emails: EmailData[]): void {
    const rows = this.getEmailRows();
    const count = Math.min(emails.length, HudLayoutConfig.MAX_EMAIL_ROWS);
    for (let i = 0; i < HudLayoutConfig.MAX_EMAIL_ROWS; i++) {
      const row = rows[i];
      if (!row) continue;

      if (i < count) {
        row.populate(emails[i]);
        row.setTransitionVisual(1, HudLayoutConfig.ROW_DEFAULT_SCALE);
      } else {
        row.clear();
      }
    }

    this.visibleEmailRowCount = count;
  }

  // Sets newly populated rows to the configured hidden/starting scale before fade in.
  private prepareRowsForFadeIn(): void {
    const rows = this.getEmailRows();
    for (let i = 0; i < this.visibleEmailRowCount; i++) {
      const row = rows[i];
      if (row) row.setTransitionVisual(0, HudLayoutConfig.ROW_FADE_IN_START_SCALE);
    }
  }

  private startRowTransitionPhase(mode: RowTransitionMode, rowCount: number): void {
    this.rowTransitionMode = mode;
    this.rowTransitionElapsed = 0;
    this.rowTransitionRowCount = rowCount;
    this.rowTransitionUpdateEvent.enabled = rowCount > 0;
    if (rowCount > 0) this.playRowTransitionSfx();
  }

  // Advances the active sequential row transition.
  private updateEmailRowTransition(deltaTime: number): void {
    if (this.rowTransitionMode === 'idle') {
      this.rowTransitionUpdateEvent.enabled = false;
      return;
    }

    this.rowTransitionElapsed += deltaTime;
    const duration = this.getRowTransitionDuration();
    const totalDuration = duration + HudLayoutConfig.ROW_FADE_STAGGER_SECONDS * Math.max(this.rowTransitionRowCount - 1, 0);

    for (let i = 0; i < this.rowTransitionRowCount; i++) {
      this.updateTransitionRow(i, duration);
    }

    if (this.rowTransitionElapsed < totalDuration) return;

    this.completeRowTransitionPhase();
  }

  private updateTransitionRow(index: number, duration: number): void {
    const row = this.getEmailRows()[index];
    if (!row) return;

    const delayedTime = this.rowTransitionElapsed - HudLayoutConfig.ROW_FADE_STAGGER_SECONDS * index;
    const rawT = Math.max(0, Math.min(delayedTime / duration, 1));

    if (this.rowTransitionMode === 'fadeOut') {
      const easedT = this.easeInCubic(rawT);
      row.setTransitionVisual(1 - easedT, this.lerpVec3(HudLayoutConfig.ROW_DEFAULT_SCALE, HudLayoutConfig.ROW_FADE_OUT_END_SCALE, easedT));
      return;
    }

    const easedT = this.easeOutCubic(rawT);
    row.setTransitionVisual(easedT, this.lerpVec3(HudLayoutConfig.ROW_FADE_IN_START_SCALE, HudLayoutConfig.ROW_DEFAULT_SCALE, this.easeOutBack(rawT)));
  }

  private completeRowTransitionPhase(): void {
    const completedMode = this.rowTransitionMode;
    this.rowTransitionMode = 'idle';
    this.rowTransitionUpdateEvent.enabled = false;

    if (completedMode === 'fadeOut') {
      this.renderEmailRowsForTransition(this.transitionTargetEmails);
      if (this.visibleEmailRowCount > 0) {
        this.prepareRowsForFadeIn();
        this.startRowTransitionPhase('fadeIn', this.visibleEmailRowCount);
      } else {
        this.startQueuedTransitionIfNeeded();
      }
      return;
    }

    const rows = this.getEmailRows();
    for (let i = 0; i < this.visibleEmailRowCount; i++) {
      const row = rows[i];
      if (row) row.setTransitionVisual(1, HudLayoutConfig.ROW_DEFAULT_SCALE);
    }
    this.startQueuedTransitionIfNeeded();
  }

  private startQueuedTransitionIfNeeded(): void {
    if (this.queuedTransitionEmails === null) return;

    const queuedEmails = this.queuedTransitionEmails;
    this.queuedTransitionEmails = null;
    this.start(queuedEmails);
  }

  private getRowTransitionDuration(): number {
    return this.rowTransitionMode === 'fadeOut'
      ? HudLayoutConfig.ROW_FADE_OUT_SECONDS
      : HudLayoutConfig.ROW_FADE_IN_SECONDS;
  }

  private easeInCubic(t: number): number {
    return t * t * t;
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  private lerpVec3(start: vec3, end: vec3, t: number): vec3 {
    return new vec3(
      start.x + (end.x - start.x) * t,
      start.y + (end.y - start.y) * t,
      start.z + (end.z - start.z) * t
    );
  }
}
