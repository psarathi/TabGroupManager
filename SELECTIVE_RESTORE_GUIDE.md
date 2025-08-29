# Selective Session Restore Feature

## Overview
The Selective Session Restore feature allows users to selectively restore specific windows or tab groups from a saved session file, rather than restoring the entire session.

## How to Use

### Accessing the Feature
1. Click on the Tab Group Manager extension icon
2. Click the "Selective Restore" button (or press 'R' key)
3. This will open the Selective Restore page in a new tab

### Using Selective Restore
1. **Select a Session File**: Click "Select Session File" and choose a previously saved session JSON file
2. **View Session Structure**: The page will display:
   - All windows in the session
   - Tab groups within each window
   - Ungrouped tabs
   - Number of tabs in each group

3. **Select Items to Restore**:
   - Check the checkbox next to any window to restore the entire window
   - Check individual tab groups to restore only those groups
   - Check "Ungrouped Tabs" to restore tabs that weren't in any group
   - Use "Select All" or "Deselect All" buttons for bulk selection

4. **Choose Restore Location**:
   - **Restore in new window(s)** (default): Creates new browser windows for the selected items
   - **Restore in current window**: Adds the selected tab groups and tabs to your current browser window

5. **Restore**: Click "Restore Selected" to restore the selected items based on your location preference

## Features

### Hierarchical Selection
- Selecting a window automatically selects all its tab groups
- Deselecting a tab group automatically deselects its parent window

### Visual Indicators
- Tab group colors are displayed as colored dots
- Tab counts are shown for each group
- Individual tab titles are listed under each group

### Smart Restoration
- Option to restore in new windows or current window
- When restoring to current window:
  - Tab groups with matching titles will merge with existing groups
  - New tab groups will be created for groups that don't exist
- Preserves tab group properties (title, color, collapsed state)
- Maintains tab order within groups

## Testing with Sample Data
A `sample-session.json` file is included for testing. It contains:
- 2 windows
- 4 tab groups (Work Projects, Documentation, Research, Personal)
- 2 ungrouped tabs in the first window
- Various tab group colors and states

## Keyboard Shortcuts
- Press 'R' in the main popup to open Selective Restore

## Technical Details
- Uses the Chrome Extensions API for tab and window management
- Supports both regular JSON and base64-encoded session files
- Validates session file structure before displaying