// InboxPageCache owns the client-side inbox cache and pagination state.
//
// Cache state is isolated here so AppController can read like a request pipeline.
// This class tracks loaded pages, next-page tokens, the current page, and the
// selected email data needed for quick detail previews.

import { EmailData } from '../Models/EmailData';

export class InboxPageCache {
  private cachedEmails: EmailData[] = [];
  private pageCache: EmailData[][] = [];
  private pageNextTokens: string[] = [];
  private currentPageIndex = 0;

  // Clears all cached rows, loaded pages, pagination tokens, and page position.
  reset(): void {
    this.cachedEmails = [];
    this.pageCache = [];
    this.pageNextTokens = [];
    this.currentPageIndex = 0;
  }

  // Returns the page index currently shown in the inbox UI.
  getCurrentPageIndex(): number {
    return this.currentPageIndex;
  }

  // Checks whether a page has already been loaded and cached.
  hasPage(pageIndex: number): boolean {
    return !!this.pageCache[pageIndex];
  }

  // Returns cached email rows for a previously loaded page.
  getPage(pageIndex: number): EmailData[] {
    return this.pageCache[pageIndex];
  }

  // Stores a loaded page and the token Gmail returned for the following page.
  setPage(pageIndex: number, emails: EmailData[], nextPageToken: string): void {
    this.pageCache[pageIndex] = emails;
    this.pageNextTokens[pageIndex] = nextPageToken;
  }

  // Returns the token needed to request this page from Gmail.
  // Page zero does not use a token.
  getPageToken(pageIndex: number): string {
    if (pageIndex === 0) return '';

    return this.pageNextTokens[pageIndex - 1] || '';
  }

  // Marks a page as visible and makes its rows available for quick detail lookup.
  showPage(pageIndex: number, emails: EmailData[]): void {
    this.currentPageIndex = pageIndex;
    this.cacheEmails(emails);
  }

  // True when the previous-page button should be visible.
  canGoBack(): boolean {
    return this.currentPageIndex > 0;
  }

  // True when a next page is either cached locally or available through Gmail.
  hasNextPage(): boolean {
    return !!this.pageCache[this.currentPageIndex + 1] || !!this.pageNextTokens[this.currentPageIndex];
  }

  // Finds an email by Gmail message ID across rows the app has already seen.
  findEmail(id: string): EmailData | undefined {
    return this.cachedEmails.find((email) => email.id === id);
  }

  // Replaces cached metadata with the full-body version after detail loading.
  updateEmail(fullEmail: EmailData): void {
    this.replaceEmailInList(this.cachedEmails, fullEmail);

    for (const page of this.pageCache) {
      if (!page) continue;
      this.replaceEmailInList(page, fullEmail);
    }
  }

  // Stores rows locally so detail views can show instantly on tap.
  private cacheEmails(emails: EmailData[]): void {
    for (const email of emails) {
      this.upsertEmailInList(this.cachedEmails, email);
    }
  }

  // Adds a metadata row to the flat lookup cache, or refreshes it when the row
  // already exists from another page render.
  private upsertEmailInList(list: EmailData[], email: EmailData): void {
    const cachedIndex = this.findEmailIndex(list, email.id);
    if (cachedIndex >= 0) {
      list[cachedIndex] = email;
    } else {
      list.push(email);
    }
  }

  // Replaces an existing metadata-only row with the full-body version.
  private replaceEmailInList(list: EmailData[], email: EmailData): void {
    const cachedIndex = this.findEmailIndex(list, email.id);
    if (cachedIndex >= 0) list[cachedIndex] = email;
  }

  // Centralized lookup keeps the cache rules easy to follow and prevents the
  // same findIndex predicate from being repeated in multiple methods.
  private findEmailIndex(list: EmailData[], emailId: string): number {
    return list.findIndex((email) => email.id === emailId);
  }
}
