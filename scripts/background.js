import {
    CURRENT_WINDOW,
    DEFAULT_TAB_GROUP_COLOR,
    DEFAULT_TAB_GROUP_NAME,
    NO_GROUP_ID,
    PERIODICALLY_GROUP_TABS,
    PERIODICALLY_SAVE_SESSIONS,
    PRESERVE_SESSION_HISTORY,
    SESSION_SAVE_DURATION,
    TAB_GROUPING_DURATION,
    TAB_RULES
} from './constants.js';
import {getDataToBeSaved, getSessionFileName} from './helpers.js';


chrome.runtime.onInstalled.addListener((details) => {
    initiateBackgroundTasks();
});

// chrome.tabGroups.onUpdated.addListener(handleTabGroupUpdate);
function initiateBackgroundTasks() {
    setInterval(async () => {
        await groupUngroupedTabs();
        // chrome.runtime.sendMessage({"save": true});
    }, TAB_GROUPING_DURATION);
    setInterval(async () => {
        await saveSession();
    }, SESSION_SAVE_DURATION);
}

async function groupTabs(tabIds, groupName, groupColor) {
    if (tabIds.length) {
        const doesTheTabAlreadyExist = (await chrome.tabGroups.query({
            title: groupName, windowId: CURRENT_WINDOW
        }))[0];
        const group = doesTheTabAlreadyExist ? await chrome.tabs.group({
            groupId: doesTheTabAlreadyExist.id, tabIds: tabIds
        }) : await chrome.tabs.group({tabIds});
        const tabGroupOptions = doesTheTabAlreadyExist ? {color: groupColor} : {
            title: groupName, color: groupColor
        };
        await chrome.tabGroups.update(group, tabGroupOptions);
    }
}

async function groupUngroupedTabs() {
    let settings = await chrome.storage.sync.get({
        defaultTabGroupName: DEFAULT_TAB_GROUP_NAME,
        defaultTabGroupColor: DEFAULT_TAB_GROUP_COLOR,
        groupOnLaunch: PERIODICALLY_GROUP_TABS
    });
    if (!settings.groupOnLaunch) {
        return;
    }
    let tabsWithNoGroup = await chrome.tabs.query({groupId: NO_GROUP_ID, windowId: CURRENT_WINDOW, pinned: false});
    const tabIds = tabsWithNoGroup.map(({id}) => id);
    await groupTabs(tabIds, settings.defaultTabGroupName, settings.defaultTabGroupColor);
//     group tabs as per the rules
    for (const tabRule in TAB_RULES) {
        let tabsThatMatchRule = await chrome.tabs.query({
            url: TAB_RULES[tabRule]['url'],
            windowId: CURRENT_WINDOW,
            pinned: false
        });
        const tabIds = tabsThatMatchRule.map(({id}) => id);
        await groupTabs(tabIds, tabRule, TAB_RULES[tabRule]['color'] || settings.defaultTabGroupColor);
    }
}

async function handleTabGroupUpdate(tg) {
    // if (tg.collapsed && !(tg.title.includes('(') || tg.title.includes(')'))) {
    if (tg.collapsed) {
        let tabs = await chrome.tabs.query({groupId: tg.id, windowId: tg.windowId});
        await chrome.tabGroups.update(tg.id, {'title': `(${tabs.length}) ${tg.title}`});
    }
}

export async function saveSession() {
    let settings = await chrome.storage.sync.get({
        periodicallySaveSessions: PERIODICALLY_SAVE_SESSIONS,
        preserveSessionHistory: PRESERVE_SESSION_HISTORY
    });
    if (!settings.periodicallySaveSessions) {
        return;
    }
    const windows = await chrome.windows.getAll({populate: true});
    const {name, version} = chrome.runtime.getManifest();
    let formattedWindows = {'windows': [], 'extension': {name, version}};
    for (const w of windows) {
        let tabGroupsInWindow = Object.groupBy(await chrome.tabGroups.query({windowId: w.id}), ({id}) => id);
        let formattedTabs = [];
        for (const tab of w['tabs']) {
            if (tab.groupId === NO_GROUP_ID) {
                formattedTabs.push({[`tab_${tab.id}`]: tab});
                continue;
            }
            const tabGroupDetails = tabGroupsInWindow[tab.groupId][0];
            const groupPropertyName = `group_${tab.groupId}`;
            let tabGroup = formattedTabs.find(ft => Object.keys(ft).includes(groupPropertyName));
            if (!tabGroup) {
                formattedTabs.push({[`${groupPropertyName}`]: {...tabGroupDetails, tabs: [tab]}});
                continue;
            }
            tabGroup[`${groupPropertyName}`].tabs.push(tab);
        }
        formattedWindows['windows'].push({[`${w.id}`]: formattedTabs});
    }
    await chrome.downloads.download({
        url: getDataToBeSaved(formattedWindows, true),
        filename: getSessionFileName(settings.preserveSessionHistory),
        conflictAction: 'overwrite'
    });
}