// MailMessageParser converts Gmail JSON responses into the app's EmailData model.
//
// Learning goal:
// This is the boundary between raw Gmail response JSON and the small model used
// by the rest of the app. Other scripts should receive EmailData instead of
// depending on nested Gmail payload/header/body shapes.

import { EmailData } from '../Models/EmailData';
import { MailFetchResponse, MailListData, MailMessageRef } from './ReadOnlyMailRequest';

// Base64url lookup for body decoding (no dependency on atob — works on 2024 Specs).
const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// ========== Gmail response shapes used by this script ==========

// Keeping these small makes it clear which Gmail fields the sample depends on.
type GmailHeader = { name: string; value: string };
type GmailBody = { data?: string };
type GmailPayloadPart = { mimeType?: string; body?: GmailBody; parts?: GmailPayloadPart[] };
type GmailMessagePayload = { headers?: GmailHeader[] } & GmailPayloadPart;
type GmailMessageData = { id: string; snippet?: string; payload?: GmailMessagePayload };
type ParsedInboxList = { messageRefs: MailMessageRef[]; nextPageToken: string };

export class MailMessageParser {
  // Parses the inbox list JSON and normalizes missing fields used for pagination.
  async readInboxList(response: MailFetchResponse): Promise<ParsedInboxList> {
    const listData: MailListData = await response.json();
    return {
      messageRefs: listData.messages ?? [],
      nextPageToken: listData.nextPageToken ?? '',
    };
  }

  // Converts Gmail JSON into the app's simple EmailData shape.
  // `body` is optional because inbox rows are loaded before full bodies.
  createEmailData(data: GmailMessageData, body: string = ''): EmailData {
    const headers: GmailHeader[] = data.payload?.headers ?? [];

    return {
      id: data.id,
      subject: this.getHeaderValue(headers, 'Subject') || '(No subject)',
      from: this.getHeaderValue(headers, 'From') || 'Unknown sender',
      date: this.getHeaderValue(headers, 'Date') || '',
      snippet: data.snippet ?? '',
      body,
    };
  }

  // Converts a full Gmail response into the UI model. Plain text remains the
  // preferred source, but HTML-only messages now get passed through as a
  // markdown-like body that EmailTextFormatter can simplify for Lens Studio.
  createFullEmailData(data: GmailMessageData): EmailData {
    const body = this.extractBestReadableBody(data) || data.snippet || '';
    return this.createEmailData(data, body);
  }

  // Finds a single Gmail header value by exact name.
  private getHeaderValue(headers: GmailHeader[], name: string): string {
    const header = headers.find((h) => h.name === name);
    return header ? header.value : '';
  }

  // ========== Body extraction ==========

  // Gmail messages can be nested MIME trees. Prefer every readable text/plain
  // part so multipart/alternative and forwarded-message bodies do not stop at
  // the first tiny part. If no plain text exists, fall back to text/html so the
  // formatter can convert common email markup into Lens-friendly text.
  private extractBestReadableBody(msg: GmailMessageData): string {
    if (!msg.payload) return '';

    const plainTextBodies = this.collectDecodedBodies(msg.payload, 'text/plain');
    if (plainTextBodies.length > 0) return this.joinBodySections(plainTextBodies);

    const htmlBodies = this.collectDecodedBodies(msg.payload, 'text/html');
    return this.joinBodySections(htmlBodies);
  }

  // Walks the MIME tree depth-first and collects every matching inline body.
  private collectDecodedBodies(part: GmailPayloadPart, mimeType: string): string[] {
    const bodies: string[] = [];
    this.collectDecodedBodiesInto(part, mimeType, bodies);
    return bodies;
  }

  private collectDecodedBodiesInto(part: GmailPayloadPart, mimeType: string, bodies: string[]): void {
    if (part.mimeType === mimeType && part.body?.data) {
      const decoded = this.decodeBase64Url(part.body.data).trim();
      if (decoded !== '') bodies.push(decoded);
    }

    const children = part.parts ?? [];
    for (const child of children) this.collectDecodedBodiesInto(child, mimeType, bodies);
  }

  // Keeps separate MIME body sections readable without adding UI behavior.
  private joinBodySections(sections: string[]): string {
    return sections.join('\n\n').trim();
  }

  // Decodes Gmail's base64url-encoded body text without relying on browser APIs.
  // This keeps the sample compatible with Spectacles runtime environments where
  // atob/TextDecoder may not be available.
  private decodeBase64Url(data: string): string {
    // Convert URL-safe base64 to standard base64 and pad.
    let b64 = data.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';

    const bytes: number[] = [];
    let i = 0;

    // Decode four base64 characters at a time into up to three bytes.
    while (i < b64.length) {
      const e1 = B64_CHARS.indexOf(b64[i++]);
      const e2 = B64_CHARS.indexOf(b64[i++]);
      const e3 = b64[i] === '=' ? (i++, -1) : B64_CHARS.indexOf(b64[i++]);
      const e4 = b64[i] === '=' ? (i++, -1) : B64_CHARS.indexOf(b64[i++]);

      if (e1 < 0 || e2 < 0) break;

      bytes.push((e1 << 2) | (e2 >> 4));
      if (e3 >= 0) bytes.push(((e2 & 15) << 4) | (e3 >> 2));
      if (e4 >= 0) bytes.push(((e3 & 3) << 6) | e4);
    }

    return this.decodeUtf8Bytes(bytes);
  }

  // Gmail message bodies are UTF-8 bytes. Decoding them manually preserves
  // accented characters, emoji, and non-English email text without TextDecoder.
  private decodeUtf8Bytes(bytes: number[]): string {
    let result = '';
    let i = 0;

    while (i < bytes.length) {
      const b1 = bytes[i++];

      if (b1 < 0x80) {
        result += String.fromCharCode(b1);
        continue;
      }

      if (b1 >= 0xc2 && b1 < 0xe0 && i < bytes.length) {
        const b2 = bytes[i++];
        result += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f));
        continue;
      }

      if (b1 >= 0xe0 && b1 < 0xf0 && i + 1 < bytes.length) {
        const b2 = bytes[i++];
        const b3 = bytes[i++];
        result += String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f));
        continue;
      }

      if (b1 >= 0xf0 && b1 < 0xf5 && i + 2 < bytes.length) {
        const b2 = bytes[i++];
        const b3 = bytes[i++];
        const b4 = bytes[i++];
        let codePoint = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
        codePoint -= 0x10000;
        result += String.fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff));
        continue;
      }

      result += '�';
    }

    return result;
  }

}
