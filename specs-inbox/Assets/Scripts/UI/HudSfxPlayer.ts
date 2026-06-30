// HudSfxPlayer owns creation and playback for Gmail UI sound effects.
//
// Audio setup is kept out of InboxHudController's rendering code. InboxHudController decides
// when an interaction happened; this helper only creates and plays the reusable AudioComponents.

export class HudSfxPlayer {
  private hoverSfxPlayer: AudioComponent | null = null;
  private clickSfxPlayer: AudioComponent | null = null;
  private buttonHoverSfxPlayer: AudioComponent | null = null;
  private refreshSfxPlayer: AudioComponent | null = null;
  private pageClickSfxPlayer: AudioComponent | null = null;
  private closeClickSfxPlayer: AudioComponent | null = null;
  private rowTransitionSfxPlayer: AudioComponent | null = null;

  constructor(parent: SceneObject, hoverSfx?: AudioTrackAsset, clickSfx?: AudioTrackAsset, buttonHoverSfx?: AudioTrackAsset, pageClickSfx?: AudioTrackAsset, closeClickSfx?: AudioTrackAsset, refreshSfx?: AudioTrackAsset, rowTransitionSfx?: AudioTrackAsset) {
    this.hoverSfxPlayer = this.createSfxPlayer(parent, 'HoverSfxPlayer', hoverSfx);
    this.clickSfxPlayer = this.createSfxPlayer(parent, 'ClickSfxPlayer', clickSfx);
    this.buttonHoverSfxPlayer = this.createSfxPlayer(parent, 'ButtonHoverSfxPlayer', buttonHoverSfx);
    this.pageClickSfxPlayer = this.createSfxPlayer(parent, 'PageClickSfxPlayer', pageClickSfx);
    this.closeClickSfxPlayer = this.createSfxPlayer(parent, 'CloseClickSfxPlayer', closeClickSfx);
    this.refreshSfxPlayer = this.createSfxPlayer(parent, 'RefreshSfxPlayer', refreshSfx);
    this.rowTransitionSfxPlayer = this.createSfxPlayer(parent, 'RowTransitionSfxPlayer', rowTransitionSfx);
  }

  // Plays the optional hover sound effect, if one was provided.
  playHover(): void {
    this.playSfx(this.hoverSfxPlayer);
  }

  // Plays the optional click sound effect, if one was provided.
  playClick(): void {
    this.playSfx(this.clickSfxPlayer);
  }

  // Plays the optional shared icon-button hover sound effect, if one was provided.
  playButtonHover(): void {
    this.playSfx(this.buttonHoverSfxPlayer);
  }

  // Plays the optional refresh sound effect, if one was provided.
  playRefresh(): void {
    this.playSfx(this.refreshSfxPlayer);
  }

  // Plays the optional pagination click sound effect, if one was provided.
  playPageClick(): void {
    this.playSfx(this.pageClickSfxPlayer);
  }

  // Plays the optional close click sound effect, if one was provided.
  playCloseClick(): void {
    this.playSfx(this.closeClickSfxPlayer);
  }

  // Plays the optional row transition sound effect, if one was provided.
  playRowTransition(): void {
    this.playSfx(this.rowTransitionSfxPlayer);
  }

  // Creates a low-latency audio component for optional UI sound effects.
  private createSfxPlayer(parent: SceneObject, name: string, audioTrack?: AudioTrackAsset): AudioComponent | null {
    if (!audioTrack) return null;

    const audioObj = global.scene.createSceneObject(name);
    audioObj.setParent(parent);

    const audioComponent = audioObj.createComponent('Component.AudioComponent') as AudioComponent;
    audioComponent.audioTrack = audioTrack;
    audioComponent.playbackMode = Audio.PlaybackMode.LowLatency;
    return audioComponent;
  }

  // Restarts a short UI sound effect so repeated taps/hover events are audible.
  private playSfx(audioComponent: AudioComponent | null): void {
    if (!audioComponent) return;

    audioComponent.stop(false);
    audioComponent.play(1);
  }
}
