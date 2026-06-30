// StatusMessages owns controller-level status text and simple Gmail HTTP status classification.
//
// Keeping these values outside AppController makes the client flow easier to scan.

export const StatusText = {
  MISSING_ACCESS_TOKEN: 'Set your Gmail access token in the Inspector to begin',
  LOADING_INBOX: 'Loading inbox…',
  EMPTY_INBOX: 'Inbox is empty',
  NETWORK_ERROR: 'Network error — check your connection',
  LOADING_MESSAGE: 'Loading message…',
  EXPIRED_ACCESS_TOKEN: 'Access token expired — generate a new one',
};

export class StatusMessages {
  // Gmail requests used by this sample are considered successful only on HTTP 200.
  static isSuccess(status: number): boolean {
    return status === 200;
  }

  // Returns an empty string when the inbox-list response is valid.
  static getInboxListErrorMessage(status: number): string {
    if (StatusMessages.isSuccess(status)) return '';

    if (status === 401) return StatusText.EXPIRED_ACCESS_TOKEN;

    return 'Gmail error ' + status;
  }
}
