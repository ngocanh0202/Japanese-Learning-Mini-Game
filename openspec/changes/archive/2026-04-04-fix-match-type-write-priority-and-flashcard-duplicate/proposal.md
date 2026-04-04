## Why

Three separate issues in game stat tracking and priority selection: (1) Match game tracks its own stats independently, causing redundant stat pollution when quiz stats should be the source of truth; (2) Type game does the same — its stats are noisy due to the nature of the falling-words mechanic, and quiz stats should drive priority; (3) Flashcard's 'mastered' case calls `updateQuestionStats` twice, inflating stats incorrectly.

## What Changes

- **Match game**: Switch `getPrioritizedDeck(questions, 'match')` to `getPrioritizedDeck(questions, 'quiz')` so question selection uses quiz-based priority. Remove all `updateQuestionStats` calls from game-match.js.
- **Type game**: Switch `getPrioritizedDeck(questions, 'type')` to `getPrioritizedDeck(questions, 'quiz')` so question selection uses quiz-based priority. Remove all `updateQuestionStats` calls from game-type.js.
- **Flashcard game**: Remove the duplicate `updateQuestionStats` call in the 'mastered' case of `markCard()`.

## Capabilities

### New Capabilities

- `quiz-driven-priority`: Match and Type games use Quiz stats as the single source of truth for question priority selection, eliminating redundant per-game stat tracking

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- **Affected files**:
  - `js/games/game-match.js` — change priority source, remove stat tracking calls (lines 79, 121, 142)
  - `js/games/game-type.js` — change priority source, remove stat tracking calls (lines 33, 68, 146, 243)
  - `js/games/game-flash.js` — remove duplicate stat call (line 72)
- **No breaking changes**: External APIs and function signatures remain identical
- **Stat data**: Existing match/type stats in localStorage will be orphaned but harmless
