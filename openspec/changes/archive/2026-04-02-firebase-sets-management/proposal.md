## Why

Users need better management of their backed up question sets in Firebase. Currently there's no way to see all question sets stored in Firebase, copy shareable URLs, import them back, or delete them. Additionally, the backup should always create a new document instead of updating existing ones.

## What Changes

- After Firebase config is saved successfully, show a "☁️ FIREBASE SETS" button
- Clicking the button opens a modal showing all question sets stored in Firebase
- Change backup to always create NEW document (no update logic)
- Remove the old COPY button completely
- In the Firebase sets list, add three action buttons per item: Copy URL, Import, Delete
- Add function to fetch all documents from question-sets collection
- Add delete function to remove documents from Firebase

## Capabilities

### New Capabilities
- `firebase-sets-list`: Display all question sets stored in Firebase
- `firebase-set-import`: Import a question set from Firebase to local
- `firebase-set-delete`: Delete a question set from Firebase

### Modified Capabilities
- `firestore-backup`: Changed to always create new document (not update)

## Impact

- **Modified**: `main.js` - Add functions for listing, importing, deleting Firebase sets
- **Modified**: `index.html` - Add Firebase Sets button and modal
- **Modified**: `style.css` - Style for Firebase Sets modal and actions