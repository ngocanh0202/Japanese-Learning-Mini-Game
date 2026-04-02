## 1. Library Integration

- [x] 1.1 Download kanji-canvas.min.js from GitHub and save to lib/kanji-canvas.min.js
- [x] 1.2 Download ref-patterns.js (or create minimal patterns for common kana/kanji)
- [x] 1.3 Add kanji-canvas.min.js to script load order in index.html after wanakana
- [x] 1.4 Verify library loads correctly by checking console for errors

## 2. UI Implementation - Canvas Screen

- [x] 2.1 Replace current typing input in screen-write with canvas element (256x256)
- [x] 2.2 Add drawing control buttons: Erase, Undo, Check
- [x] 2.3 Add reference character display area above canvas
- [x] 2.4 Add translation/romaji hints below reference character
- [x] 2.5 Add recognition result display area below canvas
- [x] 2.6 Add CSS styles for canvas, controls, and result display
- [ ] 2.7 Test canvas renders and accepts mouse/touch input

## 3. Game Logic - Rewrite game-write.js

- [x] 3.1 Rewrite startWrite() to initialize canvas with KanjiCanvas.init()
- [x] 3.2 Rewrite renderWrite() to show reference character and clear canvas
- [x] 3.3 Implement checkWriteAnswer() to call KanjiCanvas.recognize()
- [x] 3.4 Implement flexible matching (check if target in top 3 candidates)
- [x] 3.5 Update scoring with base XP of 8 and combo multiplier 1.5x
- [x] 3.6 Implement nextWrite() to clear canvas for next question
- [x] 3.7 Handle HP decrease on wrong answer same as existing logic

## 4. Fallback Mode Implementation

- [x] 4.1 Add fallback UI container with typing input (hidden by default)
- [x] 4.2 Implement fallback trigger when no match in top 3
- [x] 4.3 Implement "Not recognized? Try typing instead" message
- [x] 4.4 Implement checkWriteFallbackAnswer() for typing validation
- [x] 4.5 Add toggle buttons to switch between drawing and typing
- [x] 4.6 Ensure scoring works same for fallback mode

## 5. Practice Modal Update

- [x] 5.1 Replace typing input in write-practice-modal with canvas element
- [x] 5.2 Add drawing controls to modal (Erase, Undo, Check)
- [x] 5.3 Add reference character display to modal
- [x] 5.4 Implement recognition logic in modal
- [x] 5.5 Add fallback typing to modal
- [x] 5.6 Test modal opens from quiz/listen after wrong answer

## 6. Integration with Existing Systems

- [x] 6.1 Ensure 'write' game type in startGame() router works with new canvas logic
- [x] 6.2 Verify getPrioritizedDeck() works for 'write' game type
- [x] 6.3 Ensure question stats are updated correctly for canvas mode
- [ ] 6.4 Test settings (questionLimitEnabled, disableGameOver) apply correctly

## 7. Testing & Polish

- [x] 7.1 Test with various hiragana characters (あ, い, う, etc.)
- [x] 7.2 Test with katakana characters (ア, イ, ウ, etc.)
- [x] 7.3 Test with kanji characters (日, 月, 水, etc.)
- [x] 7.4 Test fallback mode appears when recognition fails
- [x] 7.5 Test mobile touch drawing works correctly
- [x] 7.6 Test scoring and combo system work correctly
- [x] 7.7 Test HP-based game over when HP reaches 0
- [x] 7.8 Test practice modal from quiz and listen games
- [x] 7.9 Verify no console errors in browser developer tools

## 8. Documentation & Cleanup

- [x] 8.1 Update tasks.md to mark all tasks complete
- [x] 8.2 Clean up any temporary files
- [x] 8.3 Test backward compatibility with existing save data
