// EmailTextFormatter owns display-only text cleanup used by InboxHudController.
//
// Formatting here is presentation-only. It should not change which Gmail data is
// loaded; it only makes strings fit and read better inside the fixed HUD panels.

// Detail header and metadata are single-line fields. Replacing embedded
// line breaks keeps them from pushing later content out of place.
export function formatSingleLine(value: string): string {
  return (value || '').replace(/[\r\n]+/g, ' ').trim();
}

// Adds short visible labels to fixed-width detail metadata lines. Lens Studio
// Text does not support rich styling per substring here, so labels are kept
// inline instead of adding separate UI objects.
export function formatLabeledLine(label: string, value: string): string {
  const cleanValue = formatSingleLine(value);
  return label + ': ' + (cleanValue || '—');
}

// Keeps the message body readable in the fixed detail panel while preserving
// intentional paragraph breaks from plain-text emails. This is display-only: it
// converts simple email/markdown conventions into plain text because Lens Studio
// Text does not render HTML or markdown inside this generated panel.
export function formatEmailBody(value: string): string {
  const normalized = (value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const htmlAsText = convertBasicHtmlToText(normalized);
  const markdownAsText = convertBasicMarkdownToText(htmlAsText);

  return cleanBodyWhitespace(decodeCommonEmailEntities(markdownAsText));
}

// Converts common email HTML into markdown-like plain text that is safe to
// assign to Lens Studio's basic Text component. This is not rich HTML rendering;
// it preserves readable structure such as links, paragraphs, headings, lists,
// quotes, and simple table spacing.
function convertBasicHtmlToText(value: string): string {
  const withoutHiddenMarkup = value
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '');

  const withReadableImages = withoutHiddenMarkup.replace(
    /<img\b[^>]*alt=["']?([^"'>]*)["']?[^>]*>/gi,
    (_match: string, alt: string) => {
      const cleanAlt = decodeCommonEmailEntities(alt).trim();
      return cleanAlt ? '[' + cleanAlt + ']' : '';
    }
  );

  const withReadableLinks = withReadableImages.replace(
    /<a\b[^>]*href=["']?([^"'\s>]+)["']?[^>]*>([\s\S]*?)<\/a>/gi,
    (_match: string, href: string, label: string) => {
      const cleanLabel = decodeCommonEmailEntities(stripHtmlTags(label)).trim();
      const cleanHref = decodeCommonEmailEntities(href).trim();

      if (!cleanLabel) return cleanHref;
      if (!cleanHref || cleanLabel === cleanHref) return cleanLabel;
      return cleanLabel + ' (' + cleanHref + ')';
    }
  );

  return withReadableLinks
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<h[1-6]\b[^>]*>/gi, '\n\n')
    .replace(/<\/h[1-6]\s*>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<\/li\s*>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<p\b[^>]*>/gi, '')
    .replace(/<\/?(ul|ol)\b[^>]*>/gi, '\n')
    .replace(/<blockquote\b[^>]*>/gi, '\n> ')
    .replace(/<\/blockquote\s*>/gi, '\n')
    .replace(/<\/?(div|section|article|header|footer)\b[^>]*>/gi, '\n')
    .replace(/<\/t[dh]\s*>/gi, '  ')
    .replace(/<\/tr\s*>/gi, '\n')
    .replace(/<\/?(table|tbody|thead|tr|td|th)\b[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '');
}

// Converts markdown-like plain text into display-friendly plain text. This does
// not try to parse markdown; it only removes syntax that would otherwise add
// visual noise in a non-rich Text component.
function convertBasicMarkdownToText(value: string): string {
  return value
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_match: string, label: string, url: string) => {
      return label === url ? label : label + ' (' + url + ')';
    })
    .replace(/(^|\s)([*_]{1,2})([^*_\n]+)\2(?=\s|$|[.,!?;:])/g, '$1$3')
    .replace(/^\s*[-*+]\s+/gm, '• ');
}

// Final whitespace pass after HTML/markdown cleanup so the body fits the bounded
// detail panel without losing useful paragraph breaks.
function cleanBodyWhitespace(value: string): string {
  return value
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n{2,}(?=• )/g, '\n')
    .trim();
}

// Keeps long email fields from spilling too far outside the fixed HUD layout.
export function truncate(value: string, maxLen: number): string {
  return value.length <= maxLen ? value : value.substring(0, maxLen - 1) + '…';
}

// Stable tiny hash used only to pick a decorative row accent color.
export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Minimal HTML-entity decoding for common email markup. This intentionally
// avoids a DOM dependency so it stays compatible with Lens Studio runtimes.
function decodeCommonEmailEntities(value: string): string {
  return (value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match: string, code: string) => {
      const value = parseInt(code, 10);
      return isNaN(value) ? '' : String.fromCharCode(value);
    })
    .replace(/&#x([0-9a-f]+);/gi, (_match: string, code: string) => {
      const value = parseInt(code, 16);
      return isNaN(value) ? '' : String.fromCharCode(value);
    });
}

// Removes markup inside link labels before entity decoding.
function stripHtmlTags(value: string): string {
  return (value || '').replace(/<[^>]+>/g, '');
}
