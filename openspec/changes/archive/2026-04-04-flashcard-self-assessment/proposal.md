## Why

The flashcard game currently uses a binary Unknown/Known assessment that lacks nuance — users cannot distinguish between "never seen this before" and "pretty sure but not 100%". Additionally, the game tracks stats using the shuffled deck index instead of the original question index, causing all priority data to be recorded against the wrong questions.

## What Changes

- Replace 2-button (Unknown/Known) UI with 4-button self-assessment (New/Learning/Familiar/Mastered)
- Each assessment level maps to different stat tracking behavior and XP rewards
- Mastered grants double correctStreak (+2) to reduce appearance frequency vs Familiar (+1)
- Fix bug: flashcard deck now stores `originalIndex` so stats are tracked against correct questions
- Add color-coded button styles for the 4 assessment levels

## Capabilities

### New Capabilities
- `flashcard-self-assessment`: 4-level self-assessment UI replacing binary Unknown/Known, with differentiated stat tracking and XP rewards

### Modified Capabilities
<!-- No existing spec files found in openspec/specs/ -->

## Impact

- **Modified files**: `index.html` (flash screen buttons), `css/game-flash.css` (button styles), `js/games/game-flash.js` (markCard logic, deck indexing)
- **Flashcard game only** — no changes to other game modes
- **Breaking**: Existing flashcard sessions in progress will have mismatched button references (negligible — sessions are short-lived)
- **Stats fix**: Questions previously tracked under wrong indices will now be correctly tracked going forward
