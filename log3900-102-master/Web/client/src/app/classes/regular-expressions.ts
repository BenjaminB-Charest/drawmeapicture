
// Color
export const COLOR_REGEX_WITH_HASHTAG: RegExp = /^#[0-9A-F]{6}$/i;
export const COLOR_REGEX_WITHOUT_HASHTAG: RegExp = /[0-9A-F]{6}$/i;
export const COLOR_REGEX_RGB_VALUE_IN_HEX: RegExp = /[0-9A-F]{2}$/i;

// Export
export const REGEX_TITLE: RegExp = /^[A-Za-z0-9- ]{3,16}$/; // Alphanumeric, space and dash: 3 to 16 chars
export const REGEX_EMAIL: RegExp = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/m; // from https://regex101.com/library/SOgUIV

// SaveServer
export const REGEX_TAG: RegExp = /^[A-Za-z0-9]{1,10}$/; // Alphanumeric, 1 to 10 chars
