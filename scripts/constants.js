export const DEFAULT_TAB_GROUP_NAME = 'Misc';
export const DEFAULT_TAB_GROUP_COLOR = 'red';
export const PERIODICALLY_GROUP_TABS = true;
export const PERIODICALLY_SAVE_SESSIONS = false;
export const PRESERVE_SESSION_HISTORY = true;
export const CURRENT_WINDOW = -2;
export const NO_GROUP_ID = -1;
export const TAB_GROUPING_DURATION = 5 * 1000; // 30s or more, the service worker becomes deactivated
export const SESSION_SAVE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const SEARCH_TYPE = Object.freeze({
    Includes: Symbol('includes'),
    Equals: Symbol('equals'),
    Begins_With: Symbol('begins_with'),
    Ends_With: Symbol('ends_with'),
    Regex: Symbol('regex')
});
export const SEARCH_PLACE = Object.freeze({
    Hostname: Symbol('includes'),
    URL: Symbol('equals'),
    Page_Title: Symbol('begins_with'),
    Page_Body: Symbol('ends_with')
});