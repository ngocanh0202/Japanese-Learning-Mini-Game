## Why

The `getPrioritizedDeck()` function in `game-utils.js` calculates `totalWeight` once before the weighted selection loop, but never updates it as items are removed. This causes the weighted random selection to degrade: as items are picked and removed, `rand = Math.random() * totalWeight` increasingly overshoots the actual remaining weight, triggering the fallback random selection path. The result is that priority-based ordering works correctly for the first half of the deck but degrades toward random distribution for the second half — defeating the purpose of the priority system.

## What Changes

- Fix `getPrioritizedDeck()` to track and update `currentTotalWeight` as items are selected and removed from the pool
- This ensures weighted probability distribution remains accurate throughout the entire deck selection process

## Capabilities

### New Capabilities

- `priority-deck-selection`: Correct weighted random selection that maintains accurate probability distribution throughout the entire deck building process

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- **Affected file**: `js/game-utils.js` — `getPrioritizedDeck()` function only
- **No breaking changes**: The function signature, return value, and external API remain identical
- **All 6 games benefit**: Quiz, Flashcard, Listen, Match, Type, Write all call `getPrioritizedDeck()` and will see improved priority accuracy
