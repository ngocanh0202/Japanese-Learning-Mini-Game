## 1. Firebase Config UI (index.html)

- [x] 1.1 Add Firebase config section in screen-data (collapsible, toggle button)
- [x] 1.2 Add input fields: Project ID, Storage Bucket
- [x] 1.3 Add SAVE CONFIG and TEST CONNECTION buttons
- [x] 1.4 Add backup (☁️) and copy (📋) buttons to question set controls
- [x] 1.5 Add import from URL section with input and GET button

## 2. Firebase SDK Integration

- [x] 2.1 Create firebase-config.js with initializeFirebase() function
- [x] 2.2 Add Firebase SDK CDN script to index.html (firebase-storage)
- [x] 2.3 Load Firebase config from localStorage on app start

## 3. Backup Functionality (main.js)

- [x] 3.1 Implement backupQuestionSet() - upload JSON to Firebase Storage
- [x] 3.2 Implement sanitizeFileName() - convert set name to safe filename
- [x] 3.3 Implement copyFirebaseUrl() - copy URL to clipboard
- [x] 3.4 Save firebaseUrl to question set object after successful backup
- [x] 3.5 Enable/disable copy button based on firebaseUrl existence

## 4. Import from URL Functionality (main.js)

- [x] 4.1 Implement importFromUrl() - fetch JSON from Firebase URL
- [x] 4.2 Implement validateImportUrl() - check URL format
- [x] 4.3 Implement parseImportedJson() - validate question set structure
- [x] 4.4 Create new question set from imported data with original name

## 5. Config Management (main.js)

- [x] 5.1 Implement saveFirebaseConfig() - save to localStorage
- [x] 5.2 Implement loadFirebaseConfig() - load from localStorage
- [x] 5.3 Implement testFirebaseConnection() - verify config works
- [x] 5.4 Toggle config section visibility (show/hide)

## 6. Testing & Polish

- [ ] 6.1 Test backup flow with valid Firebase config
- [ ] 6.2 Test copy link functionality
- [ ] 6.3 Test import from URL flow
- [ ] 6.4 Test error handling (invalid URL, empty JSON, no config)
- [x] 6.5 Add appropriate toast notifications for all actions