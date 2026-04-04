## Why

The current game-type (Falling Words) only checks input against romaji. Users want the ability to check against the answer option from the question data instead. This provides more variety in gameplay and helps users learn the specific answer format from their questions.

## What Changes

1. Add a new setting option for "Compare input against" in Settings screen
2. Add new setting `typeAnswerMode` to default settings
3. Modify game-type logic to check input against:
   - **Romaji mode**: Check against `word.romaji`
   - **Answer mode**: Check against `word.a[word.c]` (the correct answer from options)

## Capabilities

### New Capabilities
- **type-answer-check**: New mode to check input against answer options in game-type

### Modified Capabilities
- None - this is adding new functionality

## Impact

- **HTML**: Add select option in Settings screen
- **js/main.js**: Add `typeAnswerMode` to default settings
- **js/settings.js**: Add UI loading/saving for new setting
- **js/games/game-type.js**: Modify input check logic based on mode

No breaking changes - backward compatible with existing behavior (romaji mode).
