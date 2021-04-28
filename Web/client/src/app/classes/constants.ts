// Line thickness
export const THICKNESS_MINIMUM = 1;
export const THICKNESS_DEFAULT = 5;
export const THICKNESS_MAXIMUM = 100;

// Line pixel detection
export const OFFSET_MIN = 3;
export const SIZEOF_POINT = 8;

// Eraser thickness
export const THICKNESS_MINIMUM_ERASER = 3;

// Colors
export const DEFAULT_PRIMARY_COLOR = '#000000';
export const DEFAULT_BLANK_COLOR = '#FFFFFF';
export const DEFAULT_TRANSPARENCY = 1;
export const MAX_TRANSPARENCY = 1;
export const MIN_TRANSPARENCY = 0.01;
export const WORKSPACE_BACKGROUND = '808080';
export const COLOR_MIN_VALUE = 0;
export const COLOR_MAX_VALUE = 255;

export const COLOR_DEFAULT = '#000000';
export const OPACITY_DEFAULT = 1;
export const MAX_RECENT_COLORS = 10;
export const VISUAL_DIFFERENCE = 15; // %

// Math
export const HEX_BASE = 16;
export const HEX_LENGTH = 6;
export const DECIMAL_BASE = 10;
export const BYTES_IN_HEX = 3;

export const FIRST_QUADRANT = 1;
export const SECOND_QUADRANT = 2;
export const THIRD_QUADRANT = 3;
export const FOURTH_QUADRANT = 4;
export const MAX_ANGLE = 360;
export const MIN_ANGLE = 0;

// Eraser
export const ERASER_OUTLINE = '#FF0000';
export const ERASER_OUTLINE_RED_ELEMENTS = '#8B0000';

// Grid
export const GRID_MINIMUM = 5;
export const GRID_MAXIMUM = 100;
export const OPACITY_MINIMUM = 0.3;
export const OPACITY_MAXIMUM = 1;
export const THICKNESS_STEP = 5;

// Gallery
export const TILE_WIDTH_PX = 250;
export const SVG_SERIAL_SIGNATURE = 'data:image/svg+xml;';
export const SVG_HTML_TAG = '<defs';

// SaveServer
export const MAX_TAGS_ALLOWED = 5;

// Export
export const EXPORT_MAX_WIDTH = 300;
export const EXPORT_MAX_HEIGHT = 270;

// Backend server
export const REST_API_ROOT = 'http://localhost:3000/api/images';
export const REST_API_EMAIL = 'http://localhost:3000/api/email';

// MouseEvents
export const LEFT_CLICK = 0;
export const RIGHT_CLICK = 2;

// HTTP Codes
export const HTTP_STATUS_OK = 201;
export const HTTP_STATUS_BAD_REQUEST = 400;
export const HTTP_STATUS_FORBIDDEN = 403;
export const HTTP_STATUS_NOT_FOUND = 404;
export const HTTP_STATUS_UNPROCESSABLE = 422;
export const HTTP_STATUS_TOO_MANY = 429;
export const HTTP_STATUS_INTERNAL_ERROR = 500;

// Cloud Functions
export const CLOUD_FUNCTIONS_ROOT = 'https://us-central1-chat-b68d4.cloudfunctions.net/';
export const CREATE_LOBBY_ENDPOINT = 'createLobby';
export const CREATE_GAME_ENDPOINT = 'createGameFromLobby';
export const GUESS_WORD_ENDPOINT = 'guessWord';
export const LEADERBOARD_ENDPOINT = 'leaderboard';
export const TIMER_EXPIRED_ENDPOINT = 'timerExpired';
export const QUIT_GAME_ENDPOINT = 'quitGame';
export const CREATE_SOLO_SPRINT_ENDPOINT = 'createSoloGame';
export const END_SOLO_SPRINT_ENDPOINT = 'endSoloGame';
export const CORRECT_SOLO_ENDPOINT = 'correctSoloGuess';
export const NO_MORE_SOLO_ENDPOINT = 'noMoreSoloAttempts';

// USER PROFILE INPUT LIMITS
export const NAME_MAX_LIMIT = 20;
export const NAME_MIN_LIMIT = 1;
export const USERNAME_MAX_LIMIT = 12;
export const PASSWORD_MIN_LIMIT = 6;
export const EMAIL_LENGTH = 26;
export const LEVEL_LIMIT = 20;

// Opacity Constant
export const OPACITY_CONSTANT = 255.0;

// Solo Sprint Durations
export const SOLO_EASY_TIME = 45;
export const SOLO_NORMAL_TIME = 35;
export const SOLO_HARD_TIME = 30;
export const SOLO_EASY_EXTRA_TIME = 40;
export const SOLO_NORMAL_EXTRA_TIME = 30;
export const SOLO_HARD_EXTRA_TIME = 20;

// Solo Sprint Guesses
export const SOLO_EASY_GUESSES = 3;
export const SOLO_NORMAL_GUESSES = 2;
export const SOLO_HARD_GUESSES = 1;

// Dessin synchronisation
export const OFFSET_DRAWING_SIDEBAR_X = 348;
export const OFFSET_DRAWING_TOPBAR_Y = 93.6;

// Une Seconde
export const ONE_SECOND = 1000;
export const MILLISECOND_MULTIPLIER = 60000;

// Chat
export const SHARE_KEY_LENGTH = 6;
