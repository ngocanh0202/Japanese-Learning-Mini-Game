## 1. UI - Add Word Count to Writing Game

- [x] 1.1 Add "Words: X" display to write game HUD in index.html
- [x] 1.2 Update updateWriteHUD() in game-write.js to show word count

## 2. Kanji API - Fetch and Cache Readings

- [x] 2.1 Add getKanjiCache() function in game-write.js
- [x] 2.2 Add setKanjiCache() function in game-write.js
- [x] 2.3 Add fetchKanjiData() function with kanjiapi.dev integration in game-write.js

## 3. Multi-Kanji Practice Modal

- [x] 3.1 Add pagination HTML to practice modal in index.html
- [x] 3.2 Add CSS styling for pagination controls in game-write.css
- [x] 3.3 Add practiceKanjiList and practiceCurrentIdx variables
- [x] 3.4 Rewrite showWritePracticeModal() to extract multiple kanji
- [x] 3.5 Add renderPracticeKanjiPage() async function
- [x] 3.6 Add nextPracticeKanji() and prevPracticeKanji() navigation functions
- [x] 3.7 Update checkWritePracticeAnswer() to auto-advance after correct

## 4. Testing and Verification

- [x] 4.1 Test writing game shows correct word count
- [x] 4.2 Test practice modal with single kanji word
- [x] 4.3 Test practice modal with multi-kanji word (e.g., 学生)
- [x] 4.4 Test pagination navigation prev/next
- [x] 4.5 Test auto-advance after correct answer
- [x] 4.6 Verify API data displays correctly (readings + meaning from JSON)
