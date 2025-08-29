# Tab Group Manager - Chrome Extension

A powerful Chrome extension for managing tab groups with advanced session management capabilities. Features a modern UI design and selective session restoration.

![Chrome Web Store Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

### Tab Group Management
- **Collapse/Expand All Groups** - Quickly collapse or expand all tab groups with one click
- **Move Tab to Beginning** - Relocate the current tab to the beginning of its group
- **Close Tabs to Right** - Close all tabs to the right of the current tab within the same group
- **Auto-Grouping** - Automatically group ungrouped tabs based on customizable rules
- **Smart Tab Organization** - Group tabs by domain patterns with custom colors

### Session Management
- **Save Sessions** - Save your current browser session including all windows, tab groups, and tabs
- **Load Full Sessions** - Restore entire saved sessions with all windows and tab groups intact
- **Selective Restore** *(New!)* - Choose specific windows or tab groups to restore
- **Restore Location Options** - Restore in new windows or merge with current window
- **Auto-Save** - Configurable automatic session saving
- **Session History** - Option to preserve session history with timestamped filenames

### Audio Control
- **Mute All Tabs** - Instantly mute all tabs in the current window
- **Unmute All Tabs** - Unmute all previously muted tabs

### Modern UI Design
- Clean, modern interface with gradient header
- Organized button groups by functionality
- Color-coded action buttons (primary, secondary, danger)
- Emoji icons for better visual recognition
- Smooth animations and transitions
- Responsive design optimized for Chrome extension popup

## ⌨️ Keyboard Shortcuts

Use these shortcuts when the popup is open:

- `C` - Collapse all tab groups
- `E` - Expand all tab groups
- `S` - Save current session
- `L` - Load session
- `R` - Open selective restore
- `M` - Move tab to beginning of group
- `X` - Close tabs to right
- `D` - Duplicate active tab
- `U` - Mute all tabs
- `N` - Unmute all tabs

## 🚀 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/psarathi/TabGroupManager.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the cloned directory

5. The extension icon will appear in your Chrome toolbar

## 📖 Usage Guide

### Basic Tab Group Operations
1. Click the extension icon to open the popup
2. Use the button groups to manage your tabs:
   - **Tab Groups** section for collapse/expand operations
   - **Sessions** section for saving/loading
   - **Audio** section for mute controls

### Saving and Loading Sessions
1. Click "Save Current Session" to save all open windows and tabs
2. Choose a location to save the JSON file
3. To restore, click "Load Full Session" and select a saved file

### Selective Session Restore
1. Click "Selective Restore" to open the restore interface
2. Select a saved session file
3. Check the boxes next to windows, tab groups, or ungrouped tabs you want to restore
4. Choose restore location:
   - **New window(s)** - Creates fresh browser windows
   - **Current window** - Merges with existing tabs (groups with same names will merge)
5. Click "Restore Selected"

### Configuring Auto-Grouping Rules
1. Click the settings icon (⚙️) in the popup
2. Configure default tab group settings
3. Set up domain-based grouping rules

## 🛠️ Configuration Options

Access options by clicking the gear icon in the popup:

- **Default Tab Group Name** - Name for ungrouped tabs
- **Default Tab Group Color** - Color for new tab groups
- **Periodically Group Tabs** - Enable/disable auto-grouping
- **Periodically Save Sessions** - Enable/disable auto-save
- **Preserve Session History** - Save sessions with timestamps

## 📁 File Structure

```
TabGroupManager/
├── manifest.json           # Extension manifest
├── index.html             # Popup interface
├── selective-restore.html # Selective restore interface
├── options.html           # Options page
├── scripts/
│   ├── background.js      # Background service worker
│   ├── popup.js          # Popup functionality
│   ├── selective-restore.js # Selective restore logic
│   ├── options.js        # Options page logic
│   ├── helpers.js        # Shared helper functions
│   └── constants.js      # Configuration constants
├── styles/
│   ├── popup.css         # Popup styling
│   ├── selective-restore.css # Selective restore styling
│   └── options.css       # Options page styling
└── images/               # Extension icons

```

## 🔧 Development

### Prerequisites
- Chrome browser
- Basic knowledge of Chrome Extension APIs
- JavaScript ES6+

### Key APIs Used
- `chrome.tabs` - Tab management
- `chrome.tabGroups` - Tab group operations
- `chrome.windows` - Window management
- `chrome.storage` - Settings persistence
- `chrome.downloads` - Session file saving

### Testing
1. Load the extension in developer mode
2. Use `sample-session.json` for testing selective restore
3. Check the console for debugging information

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Chrome Extension API documentation
- Modern UI design inspired by current web design trends
- Icons from emoji Unicode standards

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/psarathi/TabGroupManager/issues)
- Check existing issues before creating a new one

---

**Note**: This extension requires Chrome version 89 or higher for full tab groups API support.