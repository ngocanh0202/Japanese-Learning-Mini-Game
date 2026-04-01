## Why

Firebase Storage has CORS issues when accessed from browser-based apps without complex setup. Firestore provides a simpler solution without CORS configuration and works seamlessly with web apps. This change switches from Firebase Storage to Firestore for backup/sharing functionality.

## What Changes

- Add Firestore SDK to index.html
- Update firebase-config.js to initialize Firestore
- Change backupQuestionSet() to write to Firestore document instead of Storage
- Change copyFirebaseUrl() to copy Firestore document ID (for sharing)
- Change importFromUrl() to query Firestore by document ID
- Update UI: Change "COPY" button to copy document ID
- Update import section: Change input to accept document ID instead of Storage URL

## Capabilities

### New Capabilities
- `firestore-backup`: Write question set to Firestore document
- `firestore-import`: Read question set from Firestore document ID

### Modified Capabilities
- `firebase-storage-backup`: Changed to use Firestore instead
- `firebase-storage-import`: Changed to use Firestore document ID instead of Storage URL
- `firebase-config-management`: Extended to include Firestore config

## Impact

- **Modified**: `index.html` - Add Firestore SDK, change UI labels
- **Modified**: `firebase-config.js` - Add Firestore initialization and operations
- **Modified**: `main.js` - Update backup/import functions for Firestore
- **Dependencies**: Firebase Firestore SDK (via CDN)
- **Removed**: Firebase Storage SDK (no longer needed)