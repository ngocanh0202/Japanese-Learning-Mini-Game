## 1. Add kuroshiro-browser library

- [x] 1.1 Add kuroshiro-browser script to index.html from jsdelivr CDN
- [x] 1.2 Verify script loads correctly before game scripts

## 2. Initialize kuroshiro in main.js

- [x] 2.1 Add `let kuroshiro = null;` and `let kuroshiroReady = false;` global variables
- [x] 2.2 Create `initKuroshiro()` function to initialize kuroshiro with KuromojiAnalyzer
- [x] 2.3 Call `initKuroshiro()` after DOMContentLoaded
- [x] 2.4 Add fallback to wanakana if kuroshiro fails to initialize

## 3. Update game-type.js for kuroshiro conversion

- [x] 3.1 Update spawnWord() to use kuroshiro for hiragana conversion
- [x] 3.2 Handle async conversion with .then() or await
- [x] 3.3 Update drawWord() to display pre-converted hiragana
- [x] 3.4 Update onTypeInput() to use cached hiragana for comparison

## 4. Test and verify

- [ ] 4.1 Test kanji answer display (e.g., "会って" → "あって")
- [ ] 4.2 Test input validation with hiragana
- [ ] 4.3 Test fallback to wanakana if kuroshiro not ready
