## 1. Show Firebase Sets Button

- [x] 1.1 Add Firebase Sets button to question-set controls (visible after config saved)
- [x] 1.2 Add showFirebaseSetsButton() function to toggle button visibility

## 2. Add Firebase Sets Modal UI (index.html)

- [x] 2.1 Add modal structure for Firebase Sets list
- [x] 2.2 Add close button and title to modal
- [x] 2.3 Add container for list items with action buttons

## 3. Implement Firebase Sets List (main.js)

- [x] 3.1 Add fetchAllFirebaseSets() function to get all documents
- [x] 3.2 Add renderFirebaseSetsList() function to display in modal
- [x] 3.3 Add showFirebaseSetsModal() function to open modal

## 4. Implement Actions (main.js)

- [x] 4.1 Add copyFirebaseSetUrl() function - copy REST URL
- [x] 4.2 Add importFirebaseSet() function - import to local
- [x] 4.3 Add deleteFirebaseSet() function - delete from Firebase

## 5. Update Backup Logic

- [x] 5.1 Modify backupQuestionSet() to always create NEW (remove update logic)

## 6. Remove Old COPY Button

- [x] 6.1 Remove COPY button from question-set controls in index.html

## 7. Styling (style.css)

- [x] 7.1 Add styles for Firebase Sets modal
- [x] 7.2 Add styles for action buttons in list

## 8. Testing

- [ ] 8.1 Test Firebase Sets button appears after config save
- [ ] 8.2 Test viewing Firebase sets list
- [ ] 8.3 Test copy URL action
- [ ] 8.4 Test import action
- [ ] 8.5 Test delete action (with confirmation)