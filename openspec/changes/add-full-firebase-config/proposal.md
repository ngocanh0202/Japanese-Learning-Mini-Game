## Why

The current Firebase integration only stores projectId and storageBucket. The Firebase SDK initialization uses hardcoded dummy values for other fields (apiKey, authDomain, etc.), which may cause issues or warnings. Users need to be able to configure their full Firebase config including all required fields.

## What Changes

- Add 5 new input fields to Firebase config UI: apiKey, authDomain, messagingSenderId, appId, measurementId
- Update saveFirebaseConfig() to save all 7 fields to localStorage
- Update loadFirebaseConfig() to load all 7 fields
- Update initializeFirebase() in firebase-config.js to use all config values
- Maintain backward compatibility with existing saved configs (only 2 fields)

## Capabilities

### New Capabilities
- `full-firebase-config`: Allow users to configure all Firebase config fields

### Modified Capabilities
- `firebase-config-management` (existing): Extended to include all 7 Firebase config fields instead of just 2

## Impact

- **Modified**: `index.html` - Add 5 new input fields to Firebase config panel
- **Modified**: `main.js` - Update saveFirebaseConfig() and loadFirebaseConfig() functions
- **Modified**: `firebase-config.js` - Update initializeFirebase() to use full config