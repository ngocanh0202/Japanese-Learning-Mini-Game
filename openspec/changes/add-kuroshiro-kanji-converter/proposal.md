## Why

Currently, the game-type falling words game uses wanakana library to convert text for display and input validation. However, wanakana cannot convert kanji to hiragana - it only handles romaji and katakana. This means questions with kanji in their answer (e.g., "会って") display incorrectly as "会って" instead of "あって", making it impossible for users to verify their input.

## What Changes

- Add kuroshiro-browser library for kanji-to-hiragana conversion
- Replace wanakana.toHiragana() with kuroshiro.convert(..., {to: 'hiragana'}) in game-type.js
- Handle async conversion properly in spawnWord() and onTypeInput()
- Update index.html to load kuroshiro-browser from CDN

## Capabilities

### New Capabilities
- `kuroshiro-converter`: Async kanji-to-hiragana converter using kuroshiro library

### Modified Capabilities
- `type-answer-mode`: Update input validation to use kuroshiro for accurate kanji conversion

## Impact

- **js/main.js**: Add kuroshiro initialization
- **js/games/game-type.js**: Replace wanakana with kuroshiro for conversion
- **index.html**: Add kuroshiro-browser script from CDN
