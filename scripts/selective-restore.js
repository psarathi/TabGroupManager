import { NO_GROUP_ID, CURRENT_WINDOW } from './constants.js';

let sessionData = null;
let selectedItems = new Set();

// DOM elements
const btnSelectFile = document.getElementById('btn_selectFile');
const selectedFileName = document.getElementById('selected-file-name');
const sessionContent = document.getElementById('session-content');
const windowsContainer = document.getElementById('windows-container');
const btnSelectAll = document.getElementById('btn_selectAll');
const btnDeselectAll = document.getElementById('btn_deselectAll');
const btnRestore = document.getElementById('btn_restore');
const statusMessage = document.getElementById('status-message');

// Event listeners
btnSelectFile.addEventListener('click', selectSessionFile);
btnSelectAll.addEventListener('click', selectAllItems);
btnDeselectAll.addEventListener('click', deselectAllItems);
btnRestore.addEventListener('click', restoreSelected);

async function selectSessionFile() {
    try {
        const [handle] = await window.showOpenFilePicker({
            multiple: false,
            types: [{
                description: 'Saved JSON sessions (.json)',
                accept: {
                    'application/json': ['.json'],
                }
            }]
        });
        
        const file = await handle.getFile();
        selectedFileName.textContent = file.name;
        
        let contents = await file.text();
        // Check if it's a base64 encoded file saved in the background
        if (!contents.includes('{')) {
            contents = decodeURIComponent(contents);
        }
        
        sessionData = JSON.parse(contents);
        
        if (!sessionData.windows) {
            throw new Error('Invalid session file, please choose a valid one');
        }
        
        displaySessionStructure();
        sessionContent.style.display = 'block';
        
    } catch (err) {
        showStatus('Error loading file: ' + err.message, 'error');
    }
}

function displaySessionStructure() {
    windowsContainer.innerHTML = '';
    selectedItems.clear();
    
    sessionData.windows.forEach((windowData, windowIndex) => {
        const windowId = Object.keys(windowData)[0];
        const windowContent = windowData[windowId];
        
        const windowDiv = createWindowElement(windowId, windowContent, windowIndex);
        windowsContainer.appendChild(windowDiv);
    });
    
    updateRestoreButton();
}

function createWindowElement(windowId, windowContent, windowIndex) {
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window-item';
    windowDiv.dataset.windowIndex = windowIndex;
    
    // Count tabs and groups
    let tabCount = 0;
    let groupCount = 0;
    let ungroupedTabs = [];
    
    windowContent.forEach(item => {
        const key = Object.keys(item)[0];
        const value = item[key];
        
        if (key.startsWith('tab_') || value.groupId === NO_GROUP_ID) {
            ungroupedTabs.push(value);
            tabCount++;
        } else if (key.startsWith('group_')) {
            groupCount++;
            tabCount += value.tabs.length;
        }
    });
    
    // Window header
    const windowHeader = document.createElement('div');
    windowHeader.className = 'window-header';
    
    const windowCheckbox = document.createElement('input');
    windowCheckbox.type = 'checkbox';
    windowCheckbox.id = `window-${windowIndex}`;
    windowCheckbox.addEventListener('change', (e) => handleWindowSelection(e, windowIndex));
    
    const windowTitle = document.createElement('label');
    windowTitle.className = 'window-title';
    windowTitle.htmlFor = `window-${windowIndex}`;
    windowTitle.textContent = `Window ${windowIndex + 1}`;
    
    const windowInfo = document.createElement('span');
    windowInfo.className = 'window-info';
    windowInfo.textContent = `${groupCount} groups, ${tabCount} tabs`;
    
    windowHeader.appendChild(windowCheckbox);
    windowHeader.appendChild(windowTitle);
    windowHeader.appendChild(windowInfo);
    windowDiv.appendChild(windowHeader);
    
    // Tab groups container
    const tabGroupsContainer = document.createElement('div');
    tabGroupsContainer.className = 'tab-groups-container';
    
    // Add ungrouped tabs if any
    if (ungroupedTabs.length > 0) {
        const ungroupedDiv = createUngroupedTabsElement(ungroupedTabs, windowIndex);
        tabGroupsContainer.appendChild(ungroupedDiv);
    }
    
    // Add tab groups
    windowContent.forEach((item, itemIndex) => {
        const key = Object.keys(item)[0];
        const value = item[key];
        
        if (key.startsWith('group_')) {
            const groupDiv = createTabGroupElement(value, windowIndex, itemIndex);
            tabGroupsContainer.appendChild(groupDiv);
        }
    });
    
    windowDiv.appendChild(tabGroupsContainer);
    return windowDiv;
}

function createUngroupedTabsElement(tabs, windowIndex) {
    const ungroupedDiv = document.createElement('div');
    ungroupedDiv.className = 'ungrouped-tabs';
    
    const ungroupedHeader = document.createElement('div');
    ungroupedHeader.className = 'ungrouped-tabs-header';
    
    const ungroupedCheckbox = document.createElement('input');
    ungroupedCheckbox.type = 'checkbox';
    ungroupedCheckbox.id = `ungrouped-${windowIndex}`;
    ungroupedCheckbox.addEventListener('change', (e) => handleUngroupedSelection(e, windowIndex));
    
    const ungroupedLabel = document.createElement('label');
    ungroupedLabel.htmlFor = `ungrouped-${windowIndex}`;
    ungroupedLabel.textContent = 'Ungrouped Tabs';
    
    const ungroupedInfo = document.createElement('span');
    ungroupedInfo.className = 'tab-group-info';
    ungroupedInfo.textContent = `${tabs.length} tabs`;
    
    ungroupedHeader.appendChild(ungroupedCheckbox);
    ungroupedHeader.appendChild(ungroupedLabel);
    ungroupedHeader.appendChild(ungroupedInfo);
    ungroupedDiv.appendChild(ungroupedHeader);
    
    // Tabs list
    const tabsList = document.createElement('div');
    tabsList.className = 'tabs-list';
    
    tabs.forEach(tab => {
        const tabItem = document.createElement('div');
        tabItem.className = 'tab-item';
        tabItem.textContent = tab.title || tab.url;
        tabItem.title = tab.url;
        tabsList.appendChild(tabItem);
    });
    
    ungroupedDiv.appendChild(tabsList);
    return ungroupedDiv;
}

function createTabGroupElement(group, windowIndex, groupIndex) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'tab-group-item';
    
    const groupHeader = document.createElement('div');
    groupHeader.className = 'tab-group-header';
    
    const groupCheckbox = document.createElement('input');
    groupCheckbox.type = 'checkbox';
    groupCheckbox.id = `group-${windowIndex}-${groupIndex}`;
    groupCheckbox.addEventListener('change', (e) => handleGroupSelection(e, windowIndex, groupIndex));
    
    const groupColor = document.createElement('div');
    groupColor.className = `tab-group-color color-${group.color}`;
    
    const groupTitle = document.createElement('label');
    groupTitle.className = 'tab-group-title';
    groupTitle.htmlFor = `group-${windowIndex}-${groupIndex}`;
    groupTitle.textContent = group.title || 'Untitled Group';
    
    const groupInfo = document.createElement('span');
    groupInfo.className = 'tab-group-info';
    groupInfo.textContent = `${group.tabs.length} tabs`;
    
    groupHeader.appendChild(groupCheckbox);
    groupHeader.appendChild(groupColor);
    groupHeader.appendChild(groupTitle);
    groupHeader.appendChild(groupInfo);
    groupDiv.appendChild(groupHeader);
    
    // Tabs list
    const tabsList = document.createElement('div');
    tabsList.className = 'tabs-list';
    
    group.tabs.forEach(tab => {
        const tabItem = document.createElement('div');
        tabItem.className = 'tab-item';
        tabItem.textContent = tab.title || tab.url;
        tabItem.title = tab.url;
        tabsList.appendChild(tabItem);
    });
    
    groupDiv.appendChild(tabsList);
    return groupDiv;
}

function handleWindowSelection(event, windowIndex) {
    const isChecked = event.target.checked;
    const windowKey = `window-${windowIndex}`;
    
    if (isChecked) {
        selectedItems.add(windowKey);
        // Select all groups in this window
        const windowDiv = event.target.closest('.window-item');
        const groupCheckboxes = windowDiv.querySelectorAll('.tab-groups-container input[type="checkbox"]');
        groupCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            const id = checkbox.id;
            if (id.startsWith('group-')) {
                selectedItems.add(id);
            } else if (id.startsWith('ungrouped-')) {
                selectedItems.add(id);
            }
        });
    } else {
        selectedItems.delete(windowKey);
        // Deselect all groups in this window
        const windowDiv = event.target.closest('.window-item');
        const groupCheckboxes = windowDiv.querySelectorAll('.tab-groups-container input[type="checkbox"]');
        groupCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            const id = checkbox.id;
            selectedItems.delete(id);
        });
    }
    
    updateRestoreButton();
}

function handleGroupSelection(event, windowIndex, groupIndex) {
    const isChecked = event.target.checked;
    const groupKey = `group-${windowIndex}-${groupIndex}`;
    
    if (isChecked) {
        selectedItems.add(groupKey);
    } else {
        selectedItems.delete(groupKey);
        // If unchecking a group, also uncheck the window
        const windowCheckbox = document.getElementById(`window-${windowIndex}`);
        if (windowCheckbox) {
            windowCheckbox.checked = false;
            selectedItems.delete(`window-${windowIndex}`);
        }
    }
    
    updateRestoreButton();
}

function handleUngroupedSelection(event, windowIndex) {
    const isChecked = event.target.checked;
    const ungroupedKey = `ungrouped-${windowIndex}`;
    
    if (isChecked) {
        selectedItems.add(ungroupedKey);
    } else {
        selectedItems.delete(ungroupedKey);
        // If unchecking ungrouped tabs, also uncheck the window
        const windowCheckbox = document.getElementById(`window-${windowIndex}`);
        if (windowCheckbox) {
            windowCheckbox.checked = false;
            selectedItems.delete(`window-${windowIndex}`);
        }
    }
    
    updateRestoreButton();
}

function selectAllItems() {
    const allCheckboxes = windowsContainer.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
        selectedItems.add(checkbox.id);
    });
    updateRestoreButton();
}

function deselectAllItems() {
    const allCheckboxes = windowsContainer.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    selectedItems.clear();
    updateRestoreButton();
}

function updateRestoreButton() {
    btnRestore.disabled = selectedItems.size === 0;
}

async function restoreSelected() {
    if (selectedItems.size === 0) return;
    
    try {
        btnRestore.disabled = true;
        showStatus('Restoring selected items...', 'info');
        
        // Get restore location preference
        const restoreLocation = document.querySelector('input[name="restoreLocation"]:checked').value;
        const useCurrentWindow = restoreLocation === 'current';
        
        // Group selected items by window
        const windowsToRestore = new Map();
        
        selectedItems.forEach(itemId => {
            if (itemId.startsWith('window-')) {
                const windowIndex = parseInt(itemId.split('-')[1]);
                windowsToRestore.set(windowIndex, 'all');
            } else if (itemId.startsWith('group-') || itemId.startsWith('ungrouped-')) {
                const parts = itemId.split('-');
                const windowIndex = parseInt(parts[1]);
                
                if (!windowsToRestore.has(windowIndex)) {
                    windowsToRestore.set(windowIndex, []);
                }
                
                if (windowsToRestore.get(windowIndex) !== 'all') {
                    windowsToRestore.get(windowIndex).push(itemId);
                }
            }
        });
        
        // If restoring to current window, we'll process all items in the current window
        if (useCurrentWindow) {
            // Collect all items to restore in current window
            const allItemsToRestore = [];
            for (const [windowIndex, items] of windowsToRestore) {
                const windowData = sessionData.windows[windowIndex];
                if (items === 'all') {
                    allItemsToRestore.push({ windowData, items: 'all', windowIndex });
                } else {
                    allItemsToRestore.push({ windowData, items, windowIndex });
                }
            }
            
            // Restore all items in the current window
            await restoreInCurrentWindow(allItemsToRestore);
        } else {
            // Original behavior - create new windows
            for (const [windowIndex, items] of windowsToRestore) {
                const windowData = sessionData.windows[windowIndex];
                
                if (items === 'all') {
                    // Restore entire window
                    await createWindowWithTabs(windowData);
                } else {
                    // Restore selected groups/tabs only
                    await createWindowWithSelectedItems(windowData, items, windowIndex);
                }
            }
        }
        
        showStatus('Selected items restored successfully!', 'success');
        
        // Clear selection after successful restore
        setTimeout(() => {
            deselectAllItems();
            sessionContent.style.display = 'none';
            selectedFileName.textContent = '';
            sessionData = null;
        }, 2000);
        
    } catch (err) {
        showStatus('Error restoring session: ' + err.message, 'error');
    } finally {
        btnRestore.disabled = false;
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
    
    const tabsToRemove = newWindow.tabs.map(t => t.id);
    
    for (const windowEntry of windowEntries) {
        const [entryKey] = Object.keys(windowEntry);
        const entryValue = windowEntry[entryKey];
        
        if (entryKey.includes('tab_') || entryValue.groupId === NO_GROUP_ID) {
            await chrome.tabs.create({
                pinned: entryValue.pinned,
                url: entryValue.url,
                windowId: newWindow.id
            });
            continue;
        }
        
        let tabIds = [];
        for (const t of entryValue.tabs) {
            const tab = await chrome.tabs.create({
                url: t.url,
                windowId: newWindow.id
            });
            tabIds.push(tab.id);
        }
        
        const groupId = await chrome.tabs.group({
            tabIds,
            createProperties: {
                windowId: newWindow.id
            }
        });
        
        await chrome.tabGroups.update(groupId, {
            title: entryValue.title,
            color: entryValue.color,
            collapsed: entryValue.collapsed
        });
    }
    
    chrome.windows.update(newWindow.id, {state: 'maximized'});
    await chrome.tabs.remove(tabsToRemove);
}

async function createWindowWithSelectedItems(windowData, selectedItemIds, windowIndex) {
    const [windowEntries] = Object.values(windowData);
    if (!windowEntries.length) {
        return;
    }
    
    const newWindow = await chrome.windows.create({
        focused: true
    });
    
    const tabsToRemove = newWindow.tabs.map(t => t.id);
    
    // Process selected items
    for (const itemId of selectedItemIds) {
        if (itemId.startsWith('ungrouped-')) {
            // Restore ungrouped tabs
            for (const windowEntry of windowEntries) {
                const [entryKey] = Object.keys(windowEntry);
                const entryValue = windowEntry[entryKey];
                
                if (entryKey.includes('tab_') || entryValue.groupId === NO_GROUP_ID) {
                    await chrome.tabs.create({
                        pinned: entryValue.pinned,
                        url: entryValue.url,
                        windowId: newWindow.id
                    });
                }
            }
        } else if (itemId.startsWith('group-')) {
            // Restore specific group
            const groupIndex = parseInt(itemId.split('-')[2]);
            let currentIndex = 0;
            
            for (const windowEntry of windowEntries) {
                const [entryKey] = Object.keys(windowEntry);
                const entryValue = windowEntry[entryKey];
                
                if (entryKey.startsWith('group_')) {
                    if (currentIndex === groupIndex) {
                        // This is the selected group
                        let tabIds = [];
                        for (const t of entryValue.tabs) {
                            const tab = await chrome.tabs.create({
                                url: t.url,
                                windowId: newWindow.id
                            });
                            tabIds.push(tab.id);
                        }
                        
                        const groupId = await chrome.tabs.group({
                            tabIds,
                            createProperties: {
                                windowId: newWindow.id
                            }
                        });
                        
                        await chrome.tabGroups.update(groupId, {
                            title: entryValue.title,
                            color: entryValue.color,
                            collapsed: entryValue.collapsed
                        });
                        
                        break;
                    }
                    currentIndex++;
                }
            }
        }
    }
    
    chrome.windows.update(newWindow.id, {state: 'maximized'});
    await chrome.tabs.remove(tabsToRemove);
}

async function restoreInCurrentWindow(itemsToRestore) {
    const currentWindow = await chrome.windows.getCurrent();
    
    for (const { windowData, items, windowIndex } of itemsToRestore) {
        const [windowEntries] = Object.values(windowData);
        if (!windowEntries.length) continue;
        
        if (items === 'all') {
            // Restore all items from this window
            for (const windowEntry of windowEntries) {
                const [entryKey] = Object.keys(windowEntry);
                const entryValue = windowEntry[entryKey];
                
                if (entryKey.includes('tab_') || entryValue.groupId === NO_GROUP_ID) {
                    await chrome.tabs.create({
                        pinned: entryValue.pinned,
                        url: entryValue.url,
                        windowId: currentWindow.id
                    });
                } else {
                    // It's a tab group
                    await createTabGroupInWindow(entryValue, currentWindow.id);
                }
            }
        } else {
            // Restore selected items only
            for (const itemId of items) {
                if (itemId.startsWith('ungrouped-')) {
                    // Restore ungrouped tabs
                    for (const windowEntry of windowEntries) {
                        const [entryKey] = Object.keys(windowEntry);
                        const entryValue = windowEntry[entryKey];
                        
                        if (entryKey.includes('tab_') || entryValue.groupId === NO_GROUP_ID) {
                            await chrome.tabs.create({
                                pinned: entryValue.pinned,
                                url: entryValue.url,
                                windowId: currentWindow.id
                            });
                        }
                    }
                } else if (itemId.startsWith('group-')) {
                    // Restore specific group
                    const groupIndex = parseInt(itemId.split('-')[2]);
                    let currentIndex = 0;
                    
                    for (const windowEntry of windowEntries) {
                        const [entryKey] = Object.keys(windowEntry);
                        const entryValue = windowEntry[entryKey];
                        
                        if (entryKey.startsWith('group_')) {
                            if (currentIndex === groupIndex) {
                                await createTabGroupInWindow(entryValue, currentWindow.id);
                                break;
                            }
                            currentIndex++;
                        }
                    }
                }
            }
        }
    }
}

async function createTabGroupInWindow(groupData, windowId) {
    // Check if a tab group with the same title already exists in the window
    const existingGroups = await chrome.tabGroups.query({
        title: groupData.title,
        windowId: windowId
    });
    
    let tabIds = [];
    for (const tab of groupData.tabs) {
        const newTab = await chrome.tabs.create({
            url: tab.url,
            windowId: windowId,
            pinned: tab.pinned || false
        });
        tabIds.push(newTab.id);
    }
    
    if (existingGroups.length > 0 && groupData.title) {
        // Add tabs to existing group
        await chrome.tabs.group({
            groupId: existingGroups[0].id,
            tabIds: tabIds
        });
    } else {
        // Create new group
        const groupId = await chrome.tabs.group({
            tabIds,
            createProperties: {
                windowId: windowId
            }
        });
        
        await chrome.tabGroups.update(groupId, {
            title: groupData.title,
            color: groupData.color,
            collapsed: groupData.collapsed
        });
    }
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
    statusMessage.style.display = 'block';
    
    if (type !== 'info') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
}