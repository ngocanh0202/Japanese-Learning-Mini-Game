## Why

The Practice Writing Modal in the Japanese learning game has a critical bug: `KanjiCanvas.erase()` is called before `KanjiCanvas.init()`, causing a TypeError: "Cannot read properties of undefined (reading 'clearRect')". Additionally, when a word contains no kanji characters, the system should display a user-friendly error message instead of silently failing.

## What Changes

- Move `KanjiCanvas.init('practiceCanvas')` to execute BEFORE calling `renderPracticeKanjiPage()` or `KanjiCanvas.erase()`
- Add toast notification "No kanji found in this word" when the word has no kanji characters
- Display the word as-is (with original romaji and translation) when no kanji is present

## Capabilities

### New Capabilities
(None - this is a bug fix)

### Modified Capabilities
- **multi-kanji-practice**: Fix initialization order and add edge case handling for non-kanji words

## Impact

- **Files modified**: `game-write.js`
- **Breaking changes**: None
- **User-facing**: Better error message for non-kanji words
