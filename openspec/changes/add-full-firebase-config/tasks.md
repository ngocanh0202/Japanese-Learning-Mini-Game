## 1. Update Firebase Config UI (index.html)

- [x] 1.1 Add 5 new input fields: apiKey, authDomain, messagingSenderId, appId, measurementId
- [x] 1.2 Arrange fields in logical groupings (required vs optional)
- [x] 1.3 Add appropriate placeholder text for each field

## 2. Update Config Management Functions (main.js)

- [x] 2.1 Update saveFirebaseConfig() to save all 7 fields
- [x] 2.2 Update loadFirebaseConfig() to load all 7 fields
- [x] 2.3 Update toggleFirebaseConfig() to populate all fields
- [x] 2.4 Handle backward compatibility for existing 2-field configs

## 3. Update Firebase Initialization (firebase-config.js)

- [x] 3.1 Update initializeFirebase() to use all config fields
- [x] 3.2 Handle missing optional fields gracefully (use empty strings)
- [x] 3.3 Remove hardcoded dummy values