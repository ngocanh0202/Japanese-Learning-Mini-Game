## Why

The URL import feature cannot parse Firestore REST API responses correctly, causing import to fail. Additionally, the COPY button behavior is tied to the import toggle, which is confusing - it should always copy from the active question-set's backup, not from the import input field.

## What Changes

- Add Firestore REST format detection in URL import
- Add parser for Firestore's nested JSON structure (fields → arrayValue → mapValue)
- Fix COPY button to always copy from active question-set's firestoreId
- If question-set hasn't been backed up, show appropriate error message

## Capabilities

### New Capabilities
- `firestore-rest-parse`: Parse Firestore REST API response format

### Modified Capabilities
- `generic-url-import`: Extended to detect and parse Firestore REST format
- `firestore-url-copy`: Fixed to always copy from question-set backup

## Impact

- **Modified**: `main.js` - Add Firestore parser functions, fix COPY button logic