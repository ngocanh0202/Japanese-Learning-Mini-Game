## Context

The `getPrioritizedDeck()` function in `js/game-utils.js` (lines 94-147) builds a weighted random deck for game question ordering. It currently calculates `totalWeight` once before the selection loop (line 107), then uses this static value throughout the entire loop. As items are selected and removed from `tempIndices`, the actual remaining weight decreases but `totalWeight` stays constant.

The function is called by all 6 game modes: Quiz, Flashcard, Listen, Match, Type, and Write.

## Goals / Non-Goals

**Goals:**
- Maintain accurate weighted probability distribution throughout the entire deck selection process
- Keep the fix minimal — only update the running total as items are removed
- Preserve all existing behavior: function signature, return value, fallback logic

**Non-Goals:**
- No changes to the priority scoring formula
- No changes to how individual game modes call `getPrioritizedDeck()`
- No performance optimization beyond fixing the correctness issue
- No changes to the fallback selection logic

## Decisions

### Decision: Subtract removed item's weight instead of recalculating

**Approach:** Track `currentTotalWeight` as a mutable variable. After each item is selected and removed, subtract that item's weight (`Math.max(0, item.score) + 1`) from `currentTotalWeight`.

**Alternatives considered:**
1. **Recalculate totalWeight each iteration** — O(n) per iteration, total O(n²). Correct but wasteful.
2. **Fenwick tree / segment tree** — O(log n) per operation. Overkill for a deck of ≤200 questions.
3. **Subtract weight (chosen)** — O(1) per iteration, total O(n²) dominated by `tempIndices.includes()`. Minimal code change, correct behavior.

## Risks / Trade-offs

- **No significant risk**: The change is purely additive — introduces a running total that mirrors what `totalWeight` already represents but keeps it accurate. The original `totalWeight` variable can be removed entirely.
- **Edge case safety**: If `currentTotalWeight` somehow reaches 0 before all items are selected (should not happen since every item has weight ≥ 1), the existing fallback logic handles it.
