## 1. Update Import UI (index.html)

- [x] 1.1 Replace "IMPORT FROM ID" section with toggle-based "IMPORT" section
- [x] 1.2 Add radio button toggle: [● URL  ○ ID] (default: URL)
- [x] 1.3 Update input placeholder based on toggle state
- [x] 1.4 Update GET button to handle both modes
- [x] 1.5 Change COPY button behavior based on toggle state

## 2. Add Toggle State Management (main.js)

- [x] 2.1 Add importMode state variable ('url' or 'id', default: 'url')
- [x] 2.2 Create toggleImportMode() function to switch between URL/ID
- [x] 2.3 Update input placeholder text when toggle changes
- [x] 2.4 Add event listeners for radio button toggle

## 3. Implement Generic URL Import (main.js)

- [x] 3.1 Add validateGenericUrl() function - check http/https prefix
- [x] 3.2 Add fetchFromGenericUrl() function - fetch and parse JSON
- [x] 3.3 Add parseGenericJson() function - validate question set structure
- [x] 3.4 Add promptForSetName() function - ask for name after successful fetch
- [x] 3.5 Update importFromGenericUrl() to use all above functions

## 4. Update COPY Button Behavior (main.js)

- [x] 4.1 Update copyButtonHandler() to check import mode
- [x] 4.2 URL mode: copy input field value directly
- [x] 4.3 ID mode: generate Firestore REST URL and copy
- [x] 4.4 Add generateFirestoreUrl(docId) function

## 5. Update GET Button Handler (main.js)

- [x] 5.1 Update handleGetButton() to detect which function to call
- [x] 5.2 If URL mode: call importFromGenericUrl()
- [x] 5.3 If ID mode: call importFromFirestore()

## 6. Update Name Prompt for Firestore Import (main.js)

- [x] 6.1 Add promptForSetName() to importFromFirestore() as well
- [x] 6.2 Update both import functions to use same name prompt

## 7. Add Toggle Styles (style.css)

- [x] 7.1 Style the import toggle (radio buttons as toggle switch)
- [x] 7.2 Add active/inactive states for toggle
- [x] 7.3 Ensure responsive layout on mobile

## 8. Testing

- [ ] 8.1 Test URL mode import with valid JSON URL
- [ ] 8.2 Test URL mode with invalid URL format
- [ ] 8.3 Test URL mode with CORS-blocked URL
- [ ] 8.4 Test ID mode import with valid document ID
- [ ] 8.5 Test ID mode import without Firebase config
- [ ] 8.6 Test COPY button in URL mode
- [ ] 8.7 Test COPY button in ID mode (generate Firestore URL)
- [ ] 8.8 Test name prompt appears after successful fetch