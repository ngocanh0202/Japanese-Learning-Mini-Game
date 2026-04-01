## Why

Users currently have no way to backup their question sets to the cloud or share them with others. All data is stored locally in localStorage, making it vulnerable to data loss and preventing sharing between users. This change adds Firebase Cloud Storage integration to enable backup and sharing capabilities.

## What Changes

- Add Firebase configuration UI in screen-data (Project ID, Storage Bucket fields)
- Store Firebase config in localStorage (jq_firebase_config)
- Add backup button (☁️) to upload question set JSON to Firebase Storage
- Add copy link button (📋) to copy the Firebase URL to clipboard
- Add import from URL input directly on screen-data
- Add test connection button to verify Firebase config works

## Capabilities

### New Capabilities
- `firebase-storage-backup`: Upload question set JSON to Firebase Storage and generate shareable public URL
- `firebase-storage-import`: Fetch and import question set from a Firebase Storage URL
- `firebase-config-management`: UI to configure and store Firebase credentials

### Modified Capabilities
None - this is a new feature

## Impact

- **New file**: `firebase-config.js` - Firebase SDK initialization and storage operations
- **Modified**: `index.html` - Add Firebase config UI, backup/copy buttons, import URL section
- **Modified**: `main.js` - Add backup, copy, import functions and Firebase config management
- **Dependencies**: Firebase SDK (firebase-storage) via CDN