## Why

In the Writing Practice game, users practice writing individual kanji characters. However, they sometimes need context - what is the original word (e.g., "学生") that the kanji came from, and what is the explanation? Adding a hint button will help users understand the kanji in its full context.

## What Changes

- Add a "? Hint" button next to the displayed kanji in the Writing game screen
- When user hovers over the button, show a popup with:
  - **Word**: The original word containing the kanji (e.g., "学生")
  - **Explanation**: The explanation from question data (ex field)
- Store the `ex` (explanation) field in the writeKanjiQueue alongside existing data

## Capabilities

### New Capabilities
- **writing-hint**: A hover-triggered hint showing word and explanation for the current kanji

### Modified Capabilities
- (none - this is a new feature)

## Impact

- **Files modified**: `index.html`, `js/games/game-write.js`, `css/game-write.css`
- **Breaking changes**: None
- **User-facing**: New hint button and popup in Writing game
