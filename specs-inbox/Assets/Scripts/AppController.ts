// AppController is the data/controller layer for the project.
//
// Read this file first. It shows the complete app flow: create UI, listen for
// UI events, request Gmail data, cache pages, and send EmailData back to InboxHudController.
// It intentionally does not create scene objects or build Gmail URLs; those
// responsibilities live in focused helper scripts.

import { InboxHudController } from './UI/InboxHudController';
import { EmailData } from './Models/EmailData';
import { ReadOnlyMailRequest, MailMessageRef } from './Api/ReadOnlyMailRequest';
import { MailMessageParser } from './Api/MailMessageParser';
import { InboxPageCache } from './App/InboxPageCache';
import { StatusMessages, StatusText } from './App/StatusMessages';
import { PLACEHOLDER_EMAILS } from './App/PlaceholderEmails';

const ROW_HOVER_SFX = requireAsset('../Audio/hover-sfx.mp3') as AudioTrackAsset;
const ROW_CLICK_SFX = requireAsset('../Audio/click-sfx.mp3') as AudioTrackAsset;
const BUTTON_HOVER_SFX = requireAsset('../Audio/hover-sfx.mp3') as AudioTrackAsset;
const PAGE_CLICK_SFX = requireAsset('../Audio/confirm-sfx.mp3') as AudioTrackAsset;
const CLOSE_CLICK_SFX = requireAsset('../Audio/close-sfx.mp3') as AudioTrackAsset;
const REFRESH_SFX = requireAsset('../Audio/confirm-sfx.mp3') as AudioTrackAsset;
const ROW_TRANSITION_SFX = requireAsset('../Audio/whoosh-sfx.mp3') as AudioTrackAsset;
const PLACEHOLDER_PAGE_SIZE = 10;

@component
export class AppController extends BaseScriptComponent {
  // Set your Gmail OAuth 2.0 access token here in the Inspector.
  // Obtain one from https://developers.google.com/oauthplayground (scope: gmail.readonly)
  @input
  accessToken: string = '';

  // Use local sample emails instead of making Gmail API requests.
  @input
  usePlaceholderData: boolean = false;

  // Runtime-created UI controller. It owns the generated Gmail panel hierarchy.
  private uiHud!: InboxHudController;

  // Gmail request and parsing helpers are kept separate from UI/controller flow.
  private gmailRequest: ReadOnlyMailRequest = new ReadOnlyMailRequest();
  private gmailParser: MailMessageParser = new MailMessageParser();

  // Owns cached inbox rows, cached pages, and Gmail pagination tokens.
  private inboxCache: InboxPageCache = new InboxPageCache();

  // ========== Lifecycle ==========

  onAwake(): void {
    // Create the UI controller component and let it generate its own panel parent.
    this.uiHud = this.sceneObject.createComponent(InboxHudController.getTypeName()) as InboxHudController;
    this.uiHud.initialize(ROW_HOVER_SFX, ROW_CLICK_SFX, BUTTON_HOVER_SFX, PAGE_CLICK_SFX, CLOSE_CLICK_SFX, REFRESH_SFX, ROW_TRANSITION_SFX);

    // Defer data loading until the generated UI has finished its OnStart setup.
    this.createEvent('OnStartEvent').bind(() => {
      this.bindUiEvents();
      this.loadInitialInbox();
    });
  }

  // Connect UI button/tap events to the data actions in this script.
  private bindUiEvents(): void {
    this.uiHud.onRefresh.add(() => this.refreshInbox());
    this.uiHud.onEmailSelected.add((id: string) => this.openEmail(id));
    this.uiHud.onDetailClose.add(() => this.uiHud.hideDetail());
    this.uiHud.onPreviousPage.add(() => this.showPreviousPage());
    this.uiHud.onNextPage.add(() => this.showNextPage());
  }

  // Starts the first inbox load. Real Gmail data requires a valid access token;
  // placeholder data can load without Gmail authentication.
  private loadInitialInbox(): void {
    if (!this.usePlaceholderData && !this.hasAccessToken()) {
      this.uiHud.showStatus(StatusText.MISSING_ACCESS_TOKEN);
      return;
    }

    this.fetchInbox(0);
  }

  // A blank token cannot authenticate, so the app stops before making requests.
  private hasAccessToken(): boolean {
    return this.accessToken.trim() !== '';
  }

  // ========== Inbox fetch ==========

  // Main inbox loading pipeline:
  // 1. Use placeholder emails when usePlaceholderData is enabled.
  // 2. Otherwise, ask Gmail for message IDs in the inbox.
  // 3. Fetch lightweight metadata for each ID.
  // 4. Send EmailData rows to the UI.
  private async fetchInbox(pageIndex: number): Promise<void> {
    if (this.inboxCache.hasPage(pageIndex)) {
      this.showCachedPage(pageIndex);
      return;
    }

    if (this.usePlaceholderData) {
      this.fetchPlaceholderInbox(pageIndex);
      return;
    }

    const pageToken = this.inboxCache.getPageToken(pageIndex);
    if (pageIndex > 0 && pageToken === '') return;

    this.uiHud.showStatus(StatusText.LOADING_INBOX, true);

    try {
      const response = await this.gmailRequest.fetchInboxList(this.accessToken, pageToken);
      if (!this.handleInboxListStatus(response.status)) return;

      const inboxList = await this.gmailParser.readInboxList(response);
      if (!this.handleEmptyInbox(inboxList.messageRefs, pageIndex)) return;

      const emails = await this.fetchInboxMetadata(inboxList.messageRefs);
      this.inboxCache.setPage(pageIndex, emails, inboxList.nextPageToken);
      this.showInboxEmails(emails, pageIndex);
    } catch (err) {
      console.error('[AppController] fetchInbox error: ' + err);
      this.uiHud.showStatus(StatusText.NETWORK_ERROR);
    }
  }

  // Loads one local demo page through the same cache/UI path used by Gmail data.
  private fetchPlaceholderInbox(pageIndex: number): void {
    const startIndex = pageIndex * PLACEHOLDER_PAGE_SIZE;
    const emails = PLACEHOLDER_EMAILS.slice(startIndex, startIndex + PLACEHOLDER_PAGE_SIZE);
    if (emails.length === 0) return;

    const hasMorePlaceholderEmails = startIndex + PLACEHOLDER_PAGE_SIZE < PLACEHOLDER_EMAILS.length;
    const nextPageToken = hasMorePlaceholderEmails ? 'placeholder-page-' + (pageIndex + 1) : '';

    this.inboxCache.setPage(pageIndex, emails, nextPageToken);
    this.showInboxEmails(emails, pageIndex);
  }

  private refreshInbox(): void {
    this.inboxCache.reset();
    this.uiHud.setPaginationState(false, false);
    this.fetchInbox(0);
  }

  private showPreviousPage(): void {
    if (!this.inboxCache.canGoBack()) return;

    this.showCachedPage(this.inboxCache.getCurrentPageIndex() - 1);
  }

  private showNextPage(): void {
    const nextPageIndex = this.inboxCache.getCurrentPageIndex() + 1;
    if (this.inboxCache.hasPage(nextPageIndex)) {
      this.showCachedPage(nextPageIndex);
      return;
    }

    this.fetchInbox(nextPageIndex);
  }

  private showCachedPage(pageIndex: number): void {
    this.showInboxEmails(this.inboxCache.getPage(pageIndex), pageIndex);
  }

  // Converts Gmail HTTP status codes into user-facing status messages.
  // Returns false when the caller should stop the inbox load.
  private handleInboxListStatus(status: number): boolean {
    const errorMessage = StatusMessages.getInboxListErrorMessage(status);
    if (errorMessage === '') return true;

    this.uiHud.showStatus(errorMessage);
    return false;
  }

  // Handles the valid-but-empty inbox case separately from network/API errors.
  private handleEmptyInbox(messageRefs: MailMessageRef[], pageIndex: number): boolean {
    if (messageRefs.length > 0) return true;

    if (pageIndex === 0) {
      this.uiHud.setEmails([]);
      this.uiHud.showStatus(StatusText.EMPTY_INBOX);
    }

    this.updatePaginationControls();
    return false;
  }

  // Fetches metadata sequentially to keep requests simple and avoid rate limiting.
  private async fetchInboxMetadata(messageRefs: MailMessageRef[]): Promise<EmailData[]> {
    const emails: EmailData[] = [];

    for (const messageRef of messageRefs) {
      const email = await this.fetchMetadata(messageRef.id);
      if (email !== null) emails.push(email);
    }

    return emails;
  }

  // Stores the rows locally so detail views can show instantly on tap.
  private showInboxEmails(emails: EmailData[], pageIndex: number): void {
    this.inboxCache.showPage(pageIndex, emails);
    this.uiHud.setEmails(emails);
    this.updatePaginationControls();
  }

  private updatePaginationControls(): void {
    this.uiHud.setPaginationState(this.inboxCache.canGoBack(), this.hasNextPage());
  }

  private hasNextPage(): boolean {
    return this.inboxCache.hasNextPage();
  }

  // Fetches the small row-level data for one Gmail message.
  // Failed messages return null so the rest of the inbox can still render.
  private async fetchMetadata(id: string): Promise<EmailData | null> {
    try {
      const response = await this.gmailRequest.fetchMetadata(id, this.accessToken);
      if (!StatusMessages.isSuccess(response.status)) return null;

      const data = await response.json();
      return this.gmailParser.createEmailData(data);
    } catch (err) {
      console.warn('[AppController] metadata fetch failed for ' + id + ': ' + err);
      return null;
    }
  }

  // ========== Email detail ==========

  // Opens one email. A cached preview is shown immediately, then the full
  // message body is requested if it has not been loaded before.
  private async openEmail(id: string): Promise<void> {
    const cachedEmail = this.findCachedEmail(id);
    this.showEmailPreview(cachedEmail);

    if (this.hasFullEmailBody(cachedEmail)) return;

    this.uiHud.showDetailStatus(StatusText.LOADING_MESSAGE);

    try {
      const response = await this.gmailRequest.fetchFullEmail(id, this.accessToken);
      if (!this.handleOpenEmailStatus(response.status)) return;

      const data = await response.json();
      const fullEmail = this.gmailParser.createFullEmailData(data);

      this.updateCachedEmail(fullEmail);
      this.showFullEmailDetail(fullEmail);
    } catch (err) {
      console.error('[AppController] openEmail error: ' + err);
      this.uiHud.hideDetailStatus();
    }
  }

  // Finds the cached inbox row that matches the selected Gmail message ID.
  private findCachedEmail(id: string): EmailData | undefined {
    return this.inboxCache.findEmail(id);
  }

  // Shows cached metadata immediately while the full email body loads.
  private showEmailPreview(email: EmailData | undefined): void {
    if (!email) return;

    this.uiHud.showDetail({
      ...email,
      body: email.body || email.snippet,
    });
  }

  // Checks whether this EmailData already contains the full body.
  private hasFullEmailBody(email: EmailData | undefined): boolean {
    return !!(email && email.body);
  }

  // Stops detail loading when Gmail cannot return the full message.
  private handleOpenEmailStatus(status: number): boolean {
    if (StatusMessages.isSuccess(status)) return true;

    this.uiHud.hideDetailStatus();
    return false;
  }

  // Replaces the cached metadata-only row with the full-body version.
  private updateCachedEmail(fullEmail: EmailData): void {
    this.inboxCache.updateEmail(fullEmail);
  }

  // Final step after a full email loads: render it and clear the loading status.
  private showFullEmailDetail(fullEmail: EmailData): void {
    this.uiHud.showDetail(fullEmail);
    this.uiHud.hideDetailStatus();
  }
}
