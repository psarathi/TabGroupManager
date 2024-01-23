import {
    DEFAULT_TAB_GROUP_COLOR,
    DEFAULT_TAB_GROUP_NAME,
    PERIODICALLY_GROUP_TABS,
    PERIODICALLY_SAVE_SESSIONS,
    PRESERVE_SESSION_HISTORY
} from './constants.js';
// Saves options to chrome.storage
const saveOptions = () => {
    const defaultTabGroupName = document.getElementById('txt_defaultTabGroupName').value;
    const defaultTabGroupColor = document.getElementById('default_tab_color').value;
    const groupOnLaunch = document.getElementById('opt_group_on_launch').checked;
    const periodicallySaveSessions = document.getElementById('opt_periodically_save_sessions').checked;
    const preserveSessionHistory = document.getElementById('opt_overwrite_saved_sessions').checked;

    chrome.storage.sync.set(
        {defaultTabGroupName, defaultTabGroupColor, groupOnLaunch, periodicallySaveSessions, preserveSessionHistory},
        () => {
            // Update status to let user know options were saved.
            const status = document.getElementById('status');
            status.textContent = 'Options saved';
            setTimeout(() => {
                status.textContent = '';
            }, 750);
        }
    );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
    chrome.storage.sync.get(
        {
            defaultTabGroupName: DEFAULT_TAB_GROUP_NAME,
            defaultTabGroupColor: DEFAULT_TAB_GROUP_COLOR,
            groupOnLaunch: PERIODICALLY_GROUP_TABS,
            periodicallySaveSessions: PERIODICALLY_SAVE_SESSIONS,
            preserveSessionHistory: PRESERVE_SESSION_HISTORY
        },
        (items) => {
            document.getElementById('txt_defaultTabGroupName').value = items.defaultTabGroupName;
            document.getElementById('default_tab_color').value = items.defaultTabGroupColor;
            document.getElementById('opt_group_on_launch').checked = items.groupOnLaunch;
            document.getElementById('opt_periodically_save_sessions').checked = items.periodicallySaveSessions;
            document.getElementById('opt_overwrite_saved_sessions').checked = items.preserveSessionHistory;
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);