## 1. Add Skip Button to HTML

- [x] 1.1 Add Skip button in screen-write section of index.html
- [x] 1.2 Add CSS styling for skip-button

## 2. Implement Kanji Splitting Logic

- [x] 2.1 Add getKanjiChars() helper function in game-write.js
- [x] 2.2 Modify startWrite() to build kanji queue from questions
- [x] 2.3 Modify renderWrite() to display single kanji from queue

## 3. Implement Match Percentage

- [x] 3.1 Add calculateMatchScore() function in game-write.js
- [x] 3.2 Modify checkWriteAnswer() to calculate and display % match
- [x] 3.3 Update scoring logic to multiply by match percentage
- [x] 3.4 Display match percentage in feedback UI

## 4. Implement Skip Functionality

- [x] 4.1 Add skipWrite() function in game-write.js
- [x] 4.2 Connect skip button to skipWrite() function
- [x] 4.3 Handle HP decrement and combo reset on skip
- [x] 4.4 Mark question as wrong in stats when skipped

## 5. Testing

- [x] 5.1 Test with single kanji word (should work normally)
- [x] 5.2 Test with 2-kanji word (should split to 2 kanji)
- [x] 5.3 Test with 3-kanji word (should split to 3 kanji)
- [x] 5.4 Test skip button functionality
- [x] 5.5 Test match percentage display for top 1/2/3 candidates
