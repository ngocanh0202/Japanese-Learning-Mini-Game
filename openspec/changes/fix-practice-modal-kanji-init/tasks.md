## 1. Fix Practice Modal Initialization

- [x] 1.1 Move KanjiCanvas.init('practiceCanvas') before kanji processing in showWritePracticeModal()
- [x] 1.2 Add showToast('No kanji found in this word') for words without kanji
- [x] 1.3 Display word as-is when no kanji found (with original romaji/translation)

## 2. Testing

- [x] 2.1 Test practice modal with multi-kanji word (e.g., 学生)
- [x] 2.2 Test practice modal with word containing no kanji (e.g., あめ)
- [x] 2.3 Verify no TypeError occurs
