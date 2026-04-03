## Why

The Practice Writing Modal currently displays meaning in Vietnamese (from JSON data) but should show English meaning from kanjiapi.dev API first, then provide a button to translate to Vietnamese on demand. This gives users more flexibility - see the English definition first, then translate if needed.

## What Changes

- Update `renderPracticeKanjiPage()` to display English meaning from kanjiapi.dev API (`data.meanings[0]`) instead of Vietnamese from JSON
- Add a translation button "🌐 VI" next to the Meaning field in the practice modal
- Add `translateToVietnamese()` function using MyMemory Translation API (free, no key required)
- When button is clicked, translate current English meaning to Vietnamese and update the display

## Capabilities

### New Capabilities
- **kanji-translation**: New capability to translate kanji meanings from English to Vietnamese using MyMemory API

### Modified Capabilities
- **multi-kanji-practice**: Modified to display English meaning from API initially

## Impact

- **Files modified**: `index.html`, `js/games/game-write.js`, `css/game-write.css`
- **External dependencies**: MyMemory Translation API (https://api.mymemory.translated.net/get)
- **Breaking changes**: None
- **User-facing**: New button and potential API call for translation
