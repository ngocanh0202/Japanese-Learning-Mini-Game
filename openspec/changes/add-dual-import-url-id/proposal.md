## Why

Currently IMPORT FROM ID only works with Firestore document IDs and requires Firebase config. Users want flexibility to import from any public JSON URL (GitHub Gist, personal server, etc.) without needing Firebase. This change adds a dual-mode import that supports both generic URLs and Firestore IDs, with the URL mode as default.

## What Changes

- Replace single "IMPORT FROM ID" section with toggle-based "IMPORT" section
- Add URL/ID toggle (radio buttons), default to URL mode
- Update COPY button to copy appropriate link based on toggle state:
  - URL mode: Copy URL from input field
  - ID mode: Generate and copy Firestore REST API URL from firestoreId
- Update GET button to detect input type and route to appropriate import function
- Add prompt for question set name before importing (after successful fetch/validation)
- Rename COPY button to properly reflect the copy action for both modes

## Capabilities

### New Capabilities
- `generic-url-import`: Import question set from any public JSON URL
- `dual-import-toggle`: Toggle between URL and ID import modes
- `firestore-url-copy`: Generate and copy Firestore REST API URL for sharing

### Modified Capabilities
- `firestore-import`: Extended to work alongside URL import with toggle

## Impact

- **Modified**: `index.html` - Replace import section with toggle-based UI
- **Modified**: `main.js` - Add generic URL import, toggle detection, name prompt, URL generation
- **Modified**: `style.css` - Style for import toggle