# Snap Spectacles Gmail Reader

A Lens Studio learning project for Snap Spectacles that displays a read-only Gmail inbox in a generated spatial UI.

This sample is intended to help developers understand how a Spectacles Lens can combine:

- TypeScript scripts in Lens Studio
- Spectacles Interaction Kit tap/hover interactions
- Spectacles UI Kit panel-style UI elements
- Gmail API read requests
- Small client-side state management for cached inbox pages and selected messages

The project is intentionally simple. It does not implement a production OAuth sign-in flow. For learning and testing, you paste a Gmail OAuth access token into the `GmailClient` component in the Lens Studio Inspector.

## What the Lens does

At runtime, the Lens:

1. Builds a Gmail inbox HUD in front of the wearer.
2. Checks whether a Gmail access token was assigned in the Inspector.
3. Requests the first page of Gmail inbox message IDs.
4. Requests lightweight metadata for each visible message.
5. Displays each message as a selectable inbox row.
6. Lets the wearer use previous/next pagination controls with hover and press feedback.
7. Opens a detail panel when an email row is selected.
8. Carries the selected inbox row's small color accent into the beginning of the detail-panel subject line, labels the selected message metadata as `From`, `Date`, and `Message`, then visually groups subject, metadata, and body text for quick scanning in the fixed detail panel.
9. Fetches the selected email's readable MIME body, preferring `text/plain` content when available.
10. Falls back to `text/html` content for HTML-only messages and converts common email markup into Lens-friendly, markdown-like plain text.
11. Falls back to Gmail snippet text when no readable body part is available.
12. Reuses cached page and message data to avoid unnecessary repeat requests during navigation.

## What this project does not do

This sample does not include:

- User-facing Google sign-in
- Token refresh
- Sending, deleting, archiving, labeling, or modifying email
- Attachment handling
- HTML email rendering
- Search, filters, compose, or reply behavior
- Server-side OAuth handling

Those features are intentionally outside the scope of this learning example.

## Requirements

- Lens Studio 5.15.1 or later
- Snap Spectacles project setup
- Spectacles Interaction Kit package
- Spectacles UI Kit package
- A Gmail account for testing
- A temporary Gmail OAuth 2.0 access token with read-only Gmail access

The included project already contains `Packages/SpectaclesInteractionKit.lspkg` and `Packages/SpectaclesUIKit.lspkg`.

## Gmail API access used by the sample

The sample uses read-only Gmail requests through `https://gmail.googleapis.com/gmail/v1/users/me`.

The request flow is:

1. `GET /messages?maxResults=10&labelIds=INBOX`
2. `GET /messages/{id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`
3. `GET /messages/{id}?format=full`

Use the Gmail read-only scope when generating a test token:

```text
https://www.googleapis.com/auth/gmail.readonly
```

## Setup

1. Open the project in Lens Studio.
2. Confirm the project is configured for Spectacles.
3. Confirm the Spectacles Interaction Kit and Spectacles UI Kit packages are present in the Asset Browser.
4. Select the SceneObject that has the `GmailClient` script component.
5. Paste a Gmail OAuth 2.0 access token into the `accessToken` field in the Inspector.
6. Run the Lens in Preview or on Spectacles.

The included UI sound effects are loaded by script from `Assets/Audio` with `requireAsset()`, so they do not appear as editable fields on the `GmailClient` component in the Inspector. To change a sample sound, replace the corresponding audio file or update the SFX constants at the top of `Assets/Scripts/GmailClient.ts`.

If `accessToken` is empty, the Lens shows:

```text
Set your Gmail access token in the Inspector to begin
```

## How to use the Lens

- Open the Lens.
- Wait for the inbox list to load. Rows fade in sequentially with a small scale-in motion when email data is ready.
- Tap an email row to open the detail panel.
- Hover the close, refresh, or pagination buttons to play the shared button-hover sound once on hover enter and see a small position, scale, icon color, and rounded-plate color change.
- Tap the close button in the detail panel to play the optional close sound effect, show a small press motion on its rounded button plate, and return to the inbox.
- Tap the refresh button to play the optional refresh sound effect, show a small press motion on its rounded button plate, and reload the inbox from page one.
- Tap the pagination arrows to play the optional pagination sound effect, show a small press motion on their rounded button plates, and move between loaded and available inbox pages.

## Current runtime flow

1. `GmailClient.onAwake()` creates a `GmailUI` component on the same SceneObject.
2. `GmailUI.initialize()` creates the runtime panel parent, sound-effect helper, row transition controller, inbox panel, and detail panel.
3. On `OnStartEvent`, `GmailClient` binds UI events and starts the first inbox load.
4. `GmailClient.loadInitialInbox()` checks that `accessToken` is not blank.
5. `GmailClient.fetchInbox()` shows the inbox loading status with the loading material icon, then asks `GmailRequest` for a page of Gmail inbox message IDs.
6. `GmailParser.readInboxList()` converts the Gmail list response into message references and a next-page token.
7. `GmailClient.fetchInboxMetadata()` requests row-level metadata for each message ID.
8. `GmailParser.createEmailData()` converts each Gmail message response into the app's `EmailData` model.
9. `GmailInboxCache` stores the loaded page, selected message data, and pagination token.
10. `GmailUI.setEmails()` delegates to `GmailUIRowTransitionController`: currently visible rows fade out sequentially, the reusable row pool receives the new email data, and the new rows fade in sequentially.
11. When a row is tapped, `GmailClient.openEmail()` shows cached preview text immediately.
12. If the full body is not cached yet, `GmailClient.openEmail()` shows the detail-panel loading status and requests the full Gmail message. The detail loading status is centered in the panel and mirrors the inbox loading status backplate, body text size, and loading material icon.
13. `GmailParser.createFullEmailData()` collects readable `text/plain` body sections first, falls back to `text/html` body sections for HTML-only messages, then falls back to the Gmail snippet.
14. `GmailUI.showDetail()` displays the selected message in the detail panel.
15. `GmailUIDetailPanel` uses the same stable email ID/from hash as `GmailUIEmailRow` to color the detail subject accent, then `populateDetailText()` adds inline labels for metadata and sends the body through `GmailTextFormatter.formatEmailBody()` before assigning the bounded Lens Studio text fields.

## Script organization

Scripts are grouped by learning area so the Asset Browser shows the same layers described in the code comments:

```text
Assets/Scripts/
  GmailClient.ts                  # Scene component and app coordinator
  Api/                            # Gmail HTTP requests and Gmail JSON parsing
  App/                            # Client state helpers used by GmailClient
  Models/                         # Small app-level data models
  UI/                             # Generated Spectacles HUD presentation layer
    Detail/                       # Detail panel and detail-panel animation
    Elements/                     # Shared Lens Studio / UIKit element creation
    Inbox/                        # Reusable inbox rows and row transitions
  Utils/                          # Display-only text cleanup helpers
```

`GmailClient.ts` remains at the top level because it is the script component attached in the scene and is the best entry point for learners. The helper folders separate Gmail API code, app state, UI construction, inbox-row behavior, detail-panel behavior, shared UI element creation, and formatting utilities without changing runtime behavior.

`GmailTypes.ts` was renamed to `Models/EmailData.ts` because it currently exports one app-level model, `EmailData`. The exported interface name did not change.

## Recommended reading order

Start with `Assets/Scripts/GmailClient.ts`. It is the main coordinator and shows the full app flow without requiring you to understand every UI construction detail first.

1. `GmailClient.ts` — lifecycle, UI event wiring, inbox loading, pagination, and detail loading.
2. `Models/EmailData.ts` — the small app-level email model shared by the other scripts.
3. `Api/GmailRequest.ts` — Gmail API endpoint construction and authenticated GET requests.
4. `Api/GmailParser.ts` — conversion from Gmail JSON into `EmailData`.
5. `App/GmailInboxCache.ts` — client-side page cache and selected-email lookup.
6. `UI/GmailUI.ts` — generated HUD panel orchestration, UI events, inbox panel rendering, inbox loading-status icon display, responsive header/status placement, and detail-panel delegation.
7. `UI/Elements/GmailUIElementFactory.ts` — shared scene-object, frame, text, icon, rounded icon-button plate, decorative content plate, icon-button feedback, backplate, hit-area, and text-bounds construction.
8. `UI/Inbox/GmailUIEmailRow.ts` — reusable inbox row construction, responsive row text/hit-area placement, text binding, tap selection, transition visuals, and hover/trigger feedback.
9. `UI/Inbox/GmailUIRowTransitionController.ts` — reusable inbox row data binding plus sequential fade-out/fade-in transition timing.
10. `UI/GmailUIConfig.ts` — panel-width-derived layout, asset, color, sizing, and row transition constants.
11. `Utils/GmailTextFormatter.ts` — display-only cleanup for email text.
12. `UI/Detail/GmailUIDetailPanel.ts` — detail panel construction, content rendering, and centered detail loading-status icon display.
13. `UI/Detail/GmailUIDetailAnimator.ts` — detail panel open/close animation.
14. `UI/GmailUISfxPlayer.ts` — optional UI audio playback for row hover, row click, shared icon-button hover, pagination click, close click, refresh interactions, and inbox row transitions.
15. `App/GmailClientStatus.ts` — user-facing status messages and simple Gmail HTTP status handling.

## Script responsibility map

| Script | Responsibility | Does not own |
| --- | --- | --- |
| `GmailClient.ts` | App flow, async request sequence, UI event handling | Scene-object construction details or Gmail endpoint strings |
| `Api/GmailRequest.ts` | Gmail URLs and authenticated network calls | UI state or email display formatting |
| `Api/GmailParser.ts` | Gmail JSON-to-`EmailData` conversion | Network calls or Lens Studio scene objects |
| `App/GmailInboxCache.ts` | Cached rows, cached pages, pagination tokens | Gmail API requests or UI rendering |
| `Models/EmailData.ts` | The app-level email data shape shared across layers | Gmail response parsing or UI rendering |
| `UI/GmailUI.ts` | Generated HUD panel orchestration, UI events, inbox panel construction, inbox loading-status icon display, responsive header/status placement, and detail-panel delegation | Gmail API calls, parsing Gmail JSON, or row transition timing |
| `UI/Elements/GmailUIElementFactory.ts` | Shared scene-object, frame, text, icon, rounded icon-button plate, decorative content plate, icon-button feedback, backplate, hit-area, and text-bounds construction | Email data, pagination state, or panel rendering decisions |
| `UI/Inbox/GmailUIEmailRow.ts` | One reusable inbox row: row object construction, row text bounds and hit-area placement, row text binding, tap selection, transition alpha/scale visuals, and row feedback | Gmail API calls, pagination state, or detail-panel rendering |
| `UI/Inbox/GmailUIRowTransitionController.ts` | Reusable inbox row population, sequential fade-out/fade-in timing, queued row updates, easing, and transition update-event ownership | Inbox panel construction, UI event ownership, or Gmail API calls |
| `UI/GmailUIConfig.ts` | Panel-width-derived layout, asset, color, sizing, interaction-feedback, and inbox row transition constants | Runtime state or behavior |
| `Utils/GmailTextFormatter.ts` | Display-only text cleanup | Gmail API parsing or UI scene construction |
| `UI/Detail/GmailUIDetailPanel.ts` | Detail panel objects, close interaction, selected-row subject accent, message text, and centered detail loading-status icon display | Gmail API calls or inbox pagination |
| `UI/Detail/GmailUIDetailAnimator.ts` | Detail-panel transform animation | Email data or UI content rendering |
| `UI/GmailUISfxPlayer.ts` | Optional UI audio playback for row hover, row click, shared icon-button hover, pagination click, close click, refresh interactions, and inbox row transitions | UI interaction decisions |
| `App/GmailClientStatus.ts` | Shared status strings and simple response-status checks | Gmail requests, parsing, or UI construction |

## Learning notes

- `EmailData` is the internal model. The UI does not need to know the full Gmail response shape.
- Inbox rows are created once and reused. This keeps the runtime UI stable and easy to inspect.
- The inbox status element creates one loading icon using `GmailUIConfig.LOADING_MAT`. Its backplate width, backplate height, icon size, and loading-icon left padding come from `GmailUIConfig` constants derived from the main panel width where appropriate. `GmailClient.fetchInbox()` enables that icon only for the inbox loading status, and other status messages keep the same text-only presentation.
- The detail loading status mirrors the inbox loading status: it is centered in the detail panel, uses the same status backplate size, body text size, derived loading-icon placement, and loading material icon while full message details load.
- Inbox row transitions are run by `GmailUIRowTransitionController` and configured by `ROW_FADE_IN_SECONDS`, `ROW_FADE_OUT_SECONDS`, `ROW_FADE_STAGGER_SECONDS`, `ROW_FADE_IN_START_SCALE`, and `ROW_FADE_OUT_END_SCALE` in `GmailUIConfig.ts`. When a fade-out or fade-in phase starts with visible rows, the controller asks `GmailUISfxPlayer` to play the optional row transition whoosh sound.
- Metadata and full message bodies are loaded separately. Inbox loading stays lightweight, and full body text is requested only after the wearer opens a message.
- Pagination is cached by page index. Going back to an already loaded page does not make another Gmail request.
- UI events flow upward from `GmailUI` to `GmailClient`; loaded email data flows downward from `GmailClient` to `GmailUI`.
- Audio tracks are loaded in `GmailClient.ts` with `requireAsset()` from the included files in `Assets/Audio`, then passed into `GmailUISfxPlayer` during UI setup. This keeps the same runtime SFX playback behavior without exposing the SFX as `GmailClient` Inspector fields. Rows use the shared hover/click SFX. Refresh, pagination, and close buttons share the button-hover sound for hover enter, while keeping their own click/tap SFX. Row hide/reveal animation phases use the included `whoosh-sfx.mp3` asset.
- Icon buttons use shared rounded background plates plus hover and press feedback in `GmailUIElementFactory.addTapButton()`, so the refresh, pagination, and detail close controls read as clickable controls and respond consistently. Their optional hover callback fires from `onHoverEnter`, so the shared hover SFX plays once per hover interaction without changing tap behavior.

- The generated panel layout is centered around `GmailUIConfig.PANEL_W`. The inbox header mail icon uses `HEADER_ICON_X` and the refresh button uses `HEADER_REFRESH_BUTTON_X`; both are derived from panel width constants. Row hit-area width, row text bounds, row divider width, status backplate width, status loading-icon padding, detail text widths, detail content plate widths, and detail close/loading icon placement are also derived from that panel width while preserving the original `PANEL_W = 42` cm layout as the baseline.
- Gmail body extraction prefers all readable `text/plain` MIME parts and joins separate body sections with paragraph breaks instead of stopping at the first matching part.
- HTML-only messages now use decoded `text/html` body sections before falling back to the Gmail snippet. The detail panel still does not render rich HTML or markdown; `GmailTextFormatter.formatEmailBody()` converts common links, images with alt text, headings, lists, block quotes, simple table spacing, emphasis markers, and whitespace into readable plain text for the existing Lens Studio `Text` component.
- The detail subject line reuses the selected email's row accent color as a small leading marker. Detail metadata labels remain inline text (`From:`, `Date:`, `Message:`), while soft rounded plates separate the metadata and body regions without adding new interaction behavior.

## Assumptions for this sample

- The Lens is used as a learning resource, not as a production email client.
- The developer provides a valid temporary Gmail OAuth access token manually.
- The token has read-only Gmail permission.
- The device/runtime can make network requests to the Gmail API.
- The Gmail inbox contains messages that can be represented with From, Subject, Date, snippet, and optional `text/plain` or `text/html` body fields.

## Useful references

- Snap Spectacles documentation: https://developers.snap.com/spectacles/home
- Spectacles Interaction Kit: https://developers.snap.com/spectacles/spectacles-frameworks/spectacles-interaction-kit/get-started
- Spectacles UI Kit: https://developers.snap.com/spectacles/spectacles-frameworks/spectacles-ui-kit/get-started
- Lens Studio scripting API: https://developers.snap.com/lens-studio/api/lens-scripting/
- Gmail API messages list: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list
- Gmail API messages get: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get
- Gmail API scopes: https://developers.google.com/workspace/gmail/api/auth/scopes
