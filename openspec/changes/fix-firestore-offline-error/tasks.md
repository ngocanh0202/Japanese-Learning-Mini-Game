## 1. Update Firebase Config

- [x] 1.1 Add enableIndexedDbPersistence() in firebase-config.js
- [x] 1.2 Add enableNetwork() call before Firestore operations

## 2. Improve Error Handling

- [x] 2.1 Add isOnline() check function
- [x] 2.2 Update importFromFirestore() to check network before query
- [x] 2.3 Improve error message for offline scenarios

## 3. Testing

- [ ] 3.1 Test import with network available
- [ ] 3.2 Test import when offline (show proper error)