# Peeeky for Gmail �� Chrome Extension

Insert tracked Peeeky document links directly into Gmail compose.

## How it works

1. User installs the extension from Chrome Web Store
2. Connects their Peeeky account (using referral code as API key)
3. When composing an email in Gmail, a "Peeeky" button appears in the toolbar
4. Clicking it shows a dropdown with their documents and links
5. Clicking a link inserts it directly into the email body

## Development

### Load as unpacked extension
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select this `gmail-chrome` folder
5. Open Gmail and compose a new email

### Generate icons
1. Open `generate-icons.html` in a browser
2. Icons will auto-download as PNG files
3. Move them to the `icons/` folder

## Publishing to Chrome Web Store

### Prerequisites
- Google Developer account ($5 one-time fee)
- Icon PNGs in `icons/` folder (16x16, 48x48, 128x128)
- At least 1 screenshot (1280x800 or 640x400)

### Steps
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item"
3. Upload a ZIP of this folder (excluding README and generate-icons.html)
4. Fill in:
   - **Name:** Peeeky for Gmail
   - **Description:** Insert tracked document links directly into Gmail. Know who reads your attachments with page-level analytics, engagement scoring, and AI chat.
   - **Category:** Productivity
   - **Language:** English
5. Upload screenshots and promotional images
6. Submit for review (typically 1-3 business days)

### Required files for ZIP
```
manifest.json
content.js
popup.html
popup.js
style.css
icons/icon16.png
icons/icon48.png
icons/icon128.png
```
