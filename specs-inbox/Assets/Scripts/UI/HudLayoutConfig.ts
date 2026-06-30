// HudLayoutConfig owns the fixed layout, asset, and color values used by InboxHudController.
//
// Learning goal:
// Keeping layout constants here lets juniors tune HUD spacing, colors, icons, and
// text sizes without searching through panel-construction code.

// ---------- Depth placement ----------
// Content is moved slightly forward so text and hit targets sit in front of
// the UIKit Frame surface instead of z-fighting with it.
export const CONTENT_Z = 0.6;
// Loading status overlays sit farther forward than regular panel content so
// they read as a raised, closer layer while the inbox or message is loading.
export const STATUS_Z = CONTENT_Z + 1.0;
export const ICON_Z_LIFT = 0.1;

// ---------- Panel dimensions (cm) ----------
export const PANEL_W = 42;
export const PANEL_H = 55;
export const PANEL_HALF_W = PANEL_W / 2;
export const PANEL_SIDE_MARGIN = 3.0;
export const ROW_TEXT_MARGIN = 4.0;
export const PANEL_CONTENT_W = PANEL_W - PANEL_SIDE_MARGIN * 2;
export const INBOX_PANEL_POSITION = new vec3(0, -25, -150);
// The UI pre-allocates fixed row objects and reuses them when data changes.
export const MAX_EMAIL_ROWS = 10;
export const FROM_PREVIEW_MAX_CHARS = 36;
export const SUBJECT_PREVIEW_MAX_CHARS = 48;
export const SNIPPET_PREVIEW_MAX_CHARS = 62;

// ---------- Header layout ----------
export const HEADER_H = 5.0;
export const HEADER_Y = PANEL_H / 2 - HEADER_H / 2;

// ---------- Row layout ----------
export const ROW_H = 4.6;
export const ROW_GAP = 0.2;
export const ROW_PITCH = ROW_H + ROW_GAP;
export const ROW_PLATE_W = PANEL_W - 2.6;
export const ROW_PLATE_H = ROW_H - 0.25;
export const ROW_HIT_W = PANEL_W - 2.0;
export const ROW_ACCENT_X = -PANEL_HALF_W + 2.3;
export const ROW_TEXT_X = -PANEL_HALF_W + ROW_TEXT_MARGIN;
export const ROW_TEXT_W = PANEL_W - 8.0;
export const ROW_DIVIDER_X = -PANEL_HALF_W + PANEL_SIDE_MARGIN;
export const ROW_DIVIDER_W = PANEL_CONTENT_W;
export const ROW_HOVER_X = 0.35;
export const ROW_TRIGGER_X = 0.65;
export const ROW_HOVER_Z = 0.12;
export const ROW_TRIGGER_Z = 0.2;
// First row center: below header bottom edge, half a row height down.
export const FIRST_ROW_Y = PANEL_H / 2 - HEADER_H - ROW_GAP - ROW_H / 2;


// ---------- Inbox row transition ----------
// Rows animate sequentially when inbox data is rendered. Durations are per row;
// stagger values control the delay between neighboring rows.
export const ROW_FADE_IN_SECONDS = 0.26;
export const ROW_FADE_OUT_SECONDS = 0.18;
export const ROW_FADE_STAGGER_SECONDS = 0.045;
export const ROW_FADE_IN_START_SCALE = new vec3(0.94, 0.94, 1);
export const ROW_FADE_OUT_END_SCALE = new vec3(0.96, 0.96, 1);
export const ROW_DEFAULT_SCALE = new vec3(1, 1, 1);

// ---------- Pagination layout ----------
export const PAGINATION_ICON_SIZE = 2.5;
export const PAGINATION_BUTTON_SPACING = PANEL_W * (8.0 / 42.0);
export const PAGINATION_GAP_BELOW_LAST_ROW = 5.0;
export const LAST_ROW_Y = FIRST_ROW_Y - (MAX_EMAIL_ROWS - 1) * ROW_PITCH;
export const PAGINATION_Y = LAST_ROW_Y - PAGINATION_GAP_BELOW_LAST_ROW;

// ---------- Detail layout ----------
export const DETAIL_TEXT_X = -PANEL_HALF_W + PANEL_SIDE_MARGIN;
export const DETAIL_TEXT_W = PANEL_CONTENT_W;
export const DETAIL_TEXT_INSET_X = DETAIL_TEXT_X + 1.2;
export const DETAIL_TEXT_INSET_W = DETAIL_TEXT_W - 2.4;
export const DETAIL_SUBJECT_W = PANEL_W - 10.0;
export const DETAIL_SUBJECT_ACCENT_X = DETAIL_TEXT_X;
export const DETAIL_SUBJECT_ACCENT_W = 1.0;
export const DETAIL_SUBJECT_TEXT_X = DETAIL_TEXT_X + 1.2;
export const DETAIL_SUBJECT_TEXT_W = DETAIL_SUBJECT_W - 1.2;
export const DETAIL_FROM_Y = HEADER_Y - HEADER_H - 1.0;
export const DETAIL_DATE_Y = HEADER_Y - HEADER_H - 4.0;
export const DETAIL_METADATA_PLATE_Y = HEADER_Y - HEADER_H - 2.75;
export const DETAIL_METADATA_PLATE_W = PANEL_CONTENT_W + 0.5;
export const DETAIL_METADATA_PLATE_H = 6.0;
export const DETAIL_BODY_Y = HEADER_Y - HEADER_H - 8.1;
export const DETAIL_BODY_H = 29.2;
export const DETAIL_BODY_PLATE_Y = DETAIL_BODY_Y - DETAIL_BODY_H / 2;
export const DETAIL_BODY_PLATE_W = PANEL_CONTENT_W + 0.5;
export const DETAIL_BODY_PLATE_H = DETAIL_BODY_H + 2.0;
export const DETAIL_CONTENT_PLATE_Z = -0.04;
export const DETAIL_CONTENT_PLATE_CORNER_RADIUS = 0.75;

// ---------- Detail transition ----------
export const DETAIL_OPEN_OFFSET_FROM_INBOX = new vec3(0, 0, 2);
export const DETAIL_CLOSED_POSITION = new vec3(0, 2.8, -113);
export const DETAIL_OPEN_SCALE = new vec3(1, 1, 1);
export const DETAIL_CLOSED_SCALE = new vec3(0.86, 0.86, 1);
export const DETAIL_ANIMATION_SECONDS = 0.5;

// ---------- Text sizes (calibrated for z = -110 cm) ----------
export const TS_INBOX_HEADER = 112;
// export const INBOX_HEADER_OUTLINE_SIZE = 0.12;
export const HEADER_ICON_X = -PANEL_HALF_W + PANEL_SIDE_MARGIN;
export const HEADER_REFRESH_BUTTON_X = PANEL_HALF_W - 4.0;
export const HEADER_CLOSE_BUTTON_X = PANEL_HALF_W - PANEL_SIDE_MARGIN;
export const INBOX_HEADER_TEXT_W = PANEL_W - 24.0;
export const STATUS_PLATE_W = PANEL_CONTENT_W;
export const STATUS_PLATE_H = 5.0;
export const STATUS_LOADING_ICON_SIZE = 2.2;
export const STATUS_LOADING_ICON_LEFT_PADDING = PANEL_W * (7.5 / 42.0);
export const STATUS_LOADING_ICON_X = -STATUS_PLATE_W / 2 + STATUS_LOADING_ICON_LEFT_PADDING;
export const TS_HEADLINE = 48;
export const TS_SUBHEAD  = 48;
export const TS_BODY     = 39;
export const TS_CAPTION  = 38;
export const TS_SMALL    = 36;

// ---------- Assets ----------
export const ICON_MAIL:    Texture  = requireAsset('../../Textures/Icons/mail.png') as Texture;
export const ICON_REFRESH: Texture  = requireAsset('../../Textures/Icons/refresh.png') as Texture;
export const ICON_CLOSE:   Texture  = requireAsset('../../Textures/Icons/close.png') as Texture;
export const ICON_ARROW_BACK: Texture = requireAsset('../../Textures/Icons/arrow.png') as Texture;
export const IMAGE_MAT:    Material = requireAsset('../../Materials/ImageMaterial.mat') as Material;
export const LOADING_MAT:    Material = requireAsset('../../Materials/LoadingMaterial.mat') as Material;

// ---------- Icon button feedback ----------
export const BUTTON_HOVER_OFFSET = new vec3(0, 0.12, 0.18);
export const BUTTON_TRIGGER_OFFSET = new vec3(0, -0.10, 0.28);
export const BUTTON_DEFAULT_SCALE = new vec3(1, 1, 1);
export const BUTTON_HOVER_SCALE = new vec3(1.08, 1.08, 1);
export const BUTTON_TRIGGER_SCALE = new vec3(0.94, 0.94, 1);
export const BUTTON_PLATE_CORNER_RADIUS = 0.45;
export const COLOR_BUTTON_DEFAULT = new vec4(1, 1, 1, 1);
export const COLOR_BUTTON_HOVER = new vec4(0.45, 0.92, 1, 1);
export const COLOR_BUTTON_TRIGGER = new vec4(1, 0.88, 0.55, 1);
export const COLOR_BUTTON_PLATE_DEFAULT = new vec4(1, 1, 1, 0.045);
export const COLOR_BUTTON_PLATE_HOVER = new vec4(0.45, 0.92, 1, 0.16);
export const COLOR_BUTTON_PLATE_TRIGGER = new vec4(1, 0.88, 0.55, 0.26);

// ---------- Text colors ----------
export const COLOR_TEXT_PRIMARY = new vec4(1, 0.98, 0.93, 1);
export const COLOR_TEXT_SECONDARY = new vec4(0.91, 0.95, 1, 0.92);
export const COLOR_TEXT_MUTED = new vec4(0.87, 0.91, 1, 0.78);
export const COLOR_TEXT_FAINT = new vec4(0.75, 0.80, 0.90, 0.64);
export const COLOR_TEXT_SNIPPET = new vec4(0.78, 0.83, 0.91, 0.62);
export const COLOR_STATUS = new vec4(1, 0.88, 0.55, 0.95);
export const COLOR_HEADER_ACCENT = new vec4(0.45, 0.92, 1, 1);
export const COLOR_INBOX_HEADER_TEXT = new vec4(1, 1, 1, 1);
// export const COLOR_INBOX_HEADER_OUTLINE = new vec4(0.75, 0.53, 0.94, 1);
export const COLOR_DIVIDER = new vec4(1, 1, 1, 0.16);
export const COLOR_ROW_PLATE_A = new vec4(1, 1, 1, 0.045);
export const COLOR_ROW_PLATE_B = new vec4(0.45, 0.92, 1, 0.06);
export const COLOR_DETAIL_METADATA_PLATE = new vec4(1, 1, 1, 0.055);
export const COLOR_DETAIL_BODY_PLATE = new vec4(1, 1, 1, 0.04);
export const ROW_ACCENT_COLORS: vec4[] = [
  new vec4(0.45, 0.92, 1, 1),
  new vec4(1.00, 0.64, 0.87, 1),
  new vec4(0.63, 1.00, 0.65, 1),
  new vec4(1.00, 0.82, 0.36, 1),
  new vec4(0.72, 0.66, 1.00, 1),
];
