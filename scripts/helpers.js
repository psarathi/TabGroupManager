import {
    CURRENT_WINDOW,
    DEFAULT_TAB_GROUP_COLOR,
    DEFAULT_TAB_GROUP_NAME,
    NO_GROUP_ID,
    PERIODICALLY_GROUP_TABS,
    PERIODICALLY_SAVE_SESSIONS,
    PRESERVE_SESSION_HISTORY,
    SEARCH_PLACE,
    SEARCH_TYPE
} from './constants.js';

let settings = {};

async function fetchSettions() {
    settings = await chrome.storage.sync.get({
        defaultTabGroupName: DEFAULT_TAB_GROUP_NAME,
        defaultTabGroupColor: DEFAULT_TAB_GROUP_COLOR,
        groupOnLaunch: PERIODICALLY_GROUP_TABS,
        periodicallySaveSessions: PERIODICALLY_SAVE_SESSIONS,
        preserveSessionHistory: PRESERVE_SESSION_HISTORY
    });
}

export async function saveSessions(req) {
    await fetchSettions();
    if (req.save) {
        //     todo: save the session silently
        // console.log(settings.periodicallySaveSessions ? 'saving' : 'not saving, check options');
    }
}

export async function groupUngroupedTabs() {
    let tabs = await chrome.tabs.query({groupId: NO_GROUP_ID, windowId: CURRENT_WINDOW, pinned: false});
    const tabIds = tabs.map(({id}) => id);
    if (tabIds.length) {
        const doesTheTabGroupAlreadyExist = (await chrome.tabGroups.query({
            title: settings.defaultTabGroupName, windowId: CURRENT_WINDOW
        }))[0];
        const group = doesTheTabGroupAlreadyExist ? await chrome.tabs.group({
            groupId: doesTheTabGroupAlreadyExist.id, tabIds: tabIds
        }) : await chrome.tabs.group({tabIds});
        const tabGroupOptions = doesTheTabGroupAlreadyExist ? {} : {
            title: settings.defaultTabGroupName, color: settings.defaultTabGroupColor
        };
        await chrome.tabGroups.update(group, tabGroupOptions);
    }
}

export async function expandCollapseTabGroups(collapse = true) {
    const openTabGroups = await chrome.tabGroups.query({collapsed: !collapse});
    const tabGroupIds = openTabGroups.map(tg => tg.id);
    tabGroupIds.forEach(t => {
        chrome.tabGroups.update(t, {collapsed: collapse});
    });
}

export async function saveSession() {
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
    await fetchSettions();
    return chrome.downloads.download({
        filename: getSessionFileName(settings.preserveSessionHistory),
        conflictAction: 'overwrite',
        url: getDataToBeSaved(formattedWindows),
        saveAs: true
    });
}

export async function loadSession() {
    try {
        const [handle] = await showOpenFilePicker({
            multiple: false, types: [{
                description: 'Saved JSON sessions (.json)',
                accept: {
                    'application/json': ['.json'],
                }
            }]
        });
        const file = await handle.getFile();
        let contents = await file.text();
        // check if it's a base64 encoded file saved in the background
        if (!contents.includes('{')) {
            contents = decodeURIComponent(contents);
        }
        const sessionToBeCreated = JSON.parse(contents);
        if (!sessionToBeCreated.windows) {
            throw new Error('Invalid session file, please choose a valid one');
        }
        const newWindows = (sessionToBeCreated['windows']);
        // await createWindowWithTabs(newWindows[0]);
        for (const newWindow of newWindows) {
            await createWindowWithTabs(newWindow);
        }
    } catch (err) {
        throw Error(err);
    }
}

async function createWindowWithTabs(newWindowToBeCreated = {}) {
    let [windowEntries] = Object.values(newWindowToBeCreated);
    if (!windowEntries.length) {
        return;
    }
    const newWindow = await chrome.windows.create({
        focused: true
    });
    const tabsToRemoved = newWindow.tabs.map(t => t.id);
    for (const windowEntry of windowEntries) {
        const [entryKey] = Object.keys(windowEntry);
        const entryValue = windowEntry[entryKey];
        if (entryKey.includes('tab_') || entryValue.groupId === NO_GROUP_ID) {
            await chrome.tabs.create({pinned: entryValue.pinned, url: entryValue.url, windowId: newWindow.id});
            continue;
        }
        let tabIds = [];
        for (const t of entryValue.tabs) {
            const tab = await chrome.tabs.create({url: t.url, windowId: newWindow.id});
            tabIds.push(tab.id);
        }
        const groupId = await chrome.tabs.group({
            tabIds, createProperties: {
                windowId: newWindow.id
            }
        });
        await chrome.tabGroups.update(groupId, {
            title: entryValue.title, color: entryValue.color, collapsed: entryValue.collapsed
        });
    }
    chrome.windows.update(newWindow.id, {state: 'maximized'});
    // Remove the first empty tab that gets created when a new window is created
    await chrome.tabs.remove(tabsToRemoved);
}

export function getSessionFileName(preserve = true) {
    if (!preserve) {
        return 'chrome_tab_groups.json';
    }
    const date = new Date();
    return `chrome_tab_groups_${date.toLocaleDateString().replaceAll('/', '')}.json`;
}

export function getDataToBeSaved(data, isBackground = false) {
    if (!data) {
        return;
    }
    if (isBackground) {
        return 'data:application/json;base64,' + btoa(encodeURIComponent(JSON.stringify(data)));
    }
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    return URL.createObjectURL(blob);
}

export function openRulesConfigPage() {
    chrome.tabs.create({url: 'rules.html', windowId: CURRENT_WINDOW});
}

export async function searchTabs(searchText, searchPlace = SEARCH_PLACE.Page_Body, searchType = SEARCH_TYPE.Includes) {
    return chrome.tabs.query({url: searchText});
}

export function goToOptionsPage() {
    chrome.runtime.openOptionsPage();
}

export async function relocateTabToBeginningOfTabGroup() {
    let currentWindowTabs = await chrome.tabs.query({windowId: CURRENT_WINDOW});
    if (!currentWindowTabs.length) {
        return;
    }
    let activeTab = currentWindowTabs.find(t => t.active);
    // This works because the tabs are returned in sorted order of index
    let smallestIndexInTabGroup = currentWindowTabs.filter(t => t.groupId === activeTab.groupId).map(t => t.index)[0];
    await chrome.tabs.move(activeTab.id, {index: smallestIndexInTabGroup});
    await chrome.tabs.update(activeTab.id, {active: true});
}

export async function closeTabsToRightOfCurrentTab() {
    let currentWindowTabs = await chrome.tabs.query({windowId: CURRENT_WINDOW});
    if (!currentWindowTabs.length) {
        return;
    }
    let activeTab = currentWindowTabs.find(t => t.active);
    let tabIdsToBeClosed = currentWindowTabs.filter(t => t.groupId === activeTab.groupId && t.index > activeTab.index).map(t => t.id);
    await chrome.tabs.remove(tabIdsToBeClosed);
}