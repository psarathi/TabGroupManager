import {expandCollapseTabGroups, goToOptionsPage, loadSession, saveSession} from './helpers.js';

const btn_collapse = document.getElementById('btn_collapseTabs');
const btn_expand = document.getElementById('btn_expandAllTabs');
const btn_saveSession = document.getElementById('btn_saveCurrentSession');
const btn_loadSession = document.getElementById('btn_loadSession');
const options_link = document.getElementById('lnk_Options');
const label_save = document.getElementById('lbl_sessionSaveStatus');
// const btn_group = document.getElementById('btn_groupUngroupedTabs');
// const btn_addEditRules = document.getElementById('btn_addEditRules');
// const defaultTabgroupName = document.getElementById("txt_defaultTabGroupName");

// chrome.action.setBadgeText({text: 'ON'});
// chrome.action.setBadgeBackgroundColor({color: 'green'});

options_link.addEventListener('click', goToOptions);
// chrome.runtime.onMessage.addListener(saveSessions);

// Get the tabs on the current window that have not been grouped
// let tabs = await chrome.tabs.query({groupId: NO_GROUP_ID, windowId: CURRENT_WINDOW});
// if (tabs.length) {
//     btn_group.innerText = `Group all (${tabs.length}) ungrouped tabs`;
// } else {
//     btn_group.disabled = true;
// }

// btn_group.addEventListener('click', async () => {
//
//     try {
//         await groupUngroupedTabs();
//     } finally {
//         btn_group.disabled = true;
//     }
// });
btn_collapse.addEventListener('click', async () => {
    alert('expandCollapseTabGroups');
    await expandCollapseTabGroups();
});
btn_expand.addEventListener('click', async () => {
    await expandCollapseTabGroups(false);
});
// btn_addEditRules.addEventListener('click', async () => {
//     // openRulesConfigPage();
//     const results = await searchTabs('*://developer.chrome.com/*');
//     console.log(results.length ? `${results.length} matching tabs found: ${JSON.stringify(results)}` : 'no tabs found');
// });
btn_saveSession.addEventListener('click', async () => {
    saveSession().then(() => label_save.innerHTML = 'Session saved successfully')
        .catch((e) => label_save.innerHTML = `Session couldn\'t be saved:${e}`)
        .finally(() => setTimeout(() => {
            label_save.innerHTML = '';
        }, 750));
});
btn_loadSession.addEventListener('click', async () => {
    loadSession().catch((e) => label_save.innerHTML = `Session couldn\'t be loaded:${e}`)
        .finally(() => setTimeout(() => {
            label_save.innerHTML = '';
        }, 75000));
});

function goToOptions() {
    goToOptionsPage();
}
