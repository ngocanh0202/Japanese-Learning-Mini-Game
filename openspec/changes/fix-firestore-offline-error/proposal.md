## Why

When users try to import a question set using Firestore document ID, they get the error "Failed to get document because the client is offline". This happens because the Firestore SDK is not properly configured for offline persistence and the error handling doesn't provide helpful feedback to users.

## What Changes

- Add Firestore offline persistence configuration in firebase-config.js
- Add enableNetwork() call before Firestore queries to ensure connection
- Improve error handling with more descriptive messages
- Add network status check before attempting import

## Capabilities

### New Capabilities
- `firestore-offline-support`: Configure Firestore to handle offline scenarios gracefully

### Modified Capabilities
- `firestore-import`: Improved error handling for offline scenarios

## Impact

- **Modified**: `firebase-config.js` - Add persistence and network configuration
- **Modified**: `main.js` - Add network check and better error handling