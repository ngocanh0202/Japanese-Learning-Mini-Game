## Why

The current Smart Prioritization system uses a flat `incorrect` counter that never decays over time. This means questions answered incorrectly 30 days ago are weighted the same as recent mistakes, causing the algorithm to over-prioritize questions the user has already mastered. Additionally, there is no mechanism to reduce the `incorrect` count when a user demonstrates consistent correct answers, and no confidence metric to show learning progress.

## What Changes

- Add exponential time-decay to incorrect answer scoring (`incorrectHistory` array with timestamps)
- Implement `effectiveIncorrect` calculation: `Σ(0.85^daysSinceEachIncorrect)` — recent mistakes weigh more, old mistakes fade
- Auto-reduce `incorrect` count when user achieves correct streaks (every 3 correct in a row reduces incorrect by 1)
- Add `getConfidenceLevel()` function returning `"new" | "learning" | "familiar" | "mastered"`
- Update mastery calculation in stats screen to use `effectiveIncorrect` instead of raw `incorrect`
- Clean up `incorrectHistory` entries older than 30 days on each update

## Capabilities

### New Capabilities
- `priority-decay`: Exponential time-decay for incorrect answer history, replacing flat incorrect counter with weighted effective score
- `confidence-scoring`: Confidence level calculation and display for question mastery tracking

### Modified Capabilities
<!-- No existing spec files found in openspec/specs/ -->

## Impact

- **Modified files**: `js/game-utils.js` (core algorithm), `js/storage.js` (data structure), `js/main.js` (mastery UI)
- **All 6 game modes** affected (quiz, listen, flash, match, type, write) — they all call `getPrioritizedDeck` and `updateQuestionStats`
- **localStorage**: `jq_question_stats` schema extended with `incorrectHistory` field — backward compatible (defaults to `[]`)
- **No breaking changes**: Existing `incorrect` field retained for compatibility; new fields are additive
