## 1. Fix Firestore REST URL Import

- [x] 1.1 Add isFirestoreResponse() function to detect Firestore REST format
- [x] 1.2 Add parseFirestoreRestResponse() function to parse nested structure
- [x] 1.3 Update parseGenericJson() to handle Firestore format
- [x] 1.4 Update importFromGenericUrl() to use Firestore parser when detected

## 2. Fix COPY Button Behavior

- [x] 2.1 Update copyButtonHandler() to ignore importMode toggle
- [x] 2.2 Always check activeSet.firestoreId for backup status
- [x] 2.3 Show appropriate error when question-set hasn't been backed up

## 3. Testing

- [ ] 3.1 Test URL import with Firestore REST URL
- [ ] 3.2 Test URL import with plain JSON URL
- [ ] 3.3 Test COPY button with backed up question-set
- [ ] 3.4 Test COPY button with non-backed up question-set