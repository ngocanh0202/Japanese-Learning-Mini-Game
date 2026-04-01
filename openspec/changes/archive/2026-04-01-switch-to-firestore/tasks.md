## 1. Add Firestore SDK

- [x] 1.1 Add Firestore SDK CDN script to index.html
- [x] 1.2 Remove Firebase Storage SDK (no longer needed)

## 2. Update Firebase Config

- [x] 2.1 Add Firestore initialization in firebase-config.js
- [x] 2.2 Update loadFirebaseConfig to include Firestore database ID
- [x] 2.3 Add databaseId input field to UI (optional, default to "(default)")

## 3. Implement Firestore Backup/Share

- [x] 3.1 Rewrite backupQuestionSet() to write to Firestore
- [x] 3.2 Rename firebaseUrl field to firestoreId in question set
- [x] 3.3 Rewrite copyFirebaseUrl() to copy document ID
- [x] 3.4 Update updateCopyButtonState() for firestoreId

## 4. Implement Firestore Import

- [x] 4.1 Rewrite importFromUrl() to query Firestore by document ID
- [x] 4.2 Update validateImportUrl() to validate document ID format
- [x] 4.3 Change import section label to "IMPORT FROM ID"

## 5. Update UI Labels

- [x] 5.1 Change "COPY" button text to "📋 COPY ID"
- [x] 5.2 Change import section label from "URL" to "ID"
- [x] 5.3 Update placeholder text for import input

## 6. Testing

- [ ] 6.1 Test backup to Firestore
- [ ] 6.2 Test copy document ID
- [ ] 6.3 Test import from document ID
- [ ] 6.4 Test error handling