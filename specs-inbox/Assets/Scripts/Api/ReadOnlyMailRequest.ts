// ReadOnlyMailRequest owns Gmail API endpoint construction and authenticated GET requests.
//
// Learning goal:
// Keep all Gmail URL construction in one place so junior developers can see
// exactly which Gmail endpoints this sample uses without reading UI code.

// ========== Gmail API constants ==========

// Gmail API base URL used for inbox, metadata, and full-message requests.
const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
// Keep the inbox small so the HUD stays readable and requests remain quick on-device.
const MAX_MESSAGES = 10;
// Gmail label used by the list request. This project only shows the inbox.
const INBOX_LABEL = 'INBOX';
// Metadata requests only ask for the headers used by the row UI.
// The full body is fetched later, only when the user opens a message.
const METADATA_HEADERS_QUERY = 'metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date';

export type MailMessageRef = { id: string };
export type MailListData = { messages?: MailMessageRef[]; nextPageToken?: string };

// Minimal response shape used by this sample. Avoids `any` at AppController call sites
// while staying compatible with Lens Studio's fetch response object.
export type MailFetchResponse = {
  status: number;
  json(): Promise<any>;
};

export class ReadOnlyMailRequest {
  // Lens Studio's networking module. All Gmail requests go through this one instance.
  private internetModule: InternetModule = require('LensStudio:InternetModule');

  // Requests the message IDs for the current inbox page.
  async fetchInboxList(accessToken: string, pageToken: string = ''): Promise<MailFetchResponse> {
    return this.fetchGmail(this.getInboxListPath(pageToken), accessToken);
  }

  // Requests the small row-level data for one Gmail message.
  async fetchMetadata(id: string, accessToken: string): Promise<MailFetchResponse> {
    return this.fetchGmail(this.getMetadataPath(id), accessToken);
  }

  // Requests a full Gmail message, including MIME body parts.
  async fetchFullEmail(id: string, accessToken: string): Promise<MailFetchResponse> {
    return this.fetchGmail(this.getFullEmailPath(id), accessToken);
  }

  // Shared helper for authenticated Gmail GET requests.
  // `path` is relative to GMAIL_BASE so callers only pass endpoint details.
  private async fetchGmail(path: string, accessToken: string): Promise<MailFetchResponse> {
    return this.internetModule.fetch(GMAIL_BASE + path, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + accessToken },
    });
  }

  // Builds the relative endpoint for the initial inbox list.
  // The response contains message IDs only, not full email content.
  private getInboxListPath(pageToken: string = ''): string {
    let path = '/messages?maxResults=' + MAX_MESSAGES + '&labelIds=' + INBOX_LABEL;
    if (pageToken !== '') path += '&pageToken=' + encodeURIComponent(pageToken);
    return path;
  }

  // Builds the metadata endpoint for a single message.
  private getMetadataPath(id: string): string {
    return '/messages/' + id + '?format=metadata&' + METADATA_HEADERS_QUERY;
  }

  // Builds the full-message endpoint for a single message.
  private getFullEmailPath(id: string): string {
    return '/messages/' + id + '?format=full';
  }
}
