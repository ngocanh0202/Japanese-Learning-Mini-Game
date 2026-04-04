## Context

Currently, each game mode (Match, Type, Flashcard) independently tracks question stats via `updateQuestionStats()`. This creates three issues:

1. **Match game** — A memory-based matching game where the skill is recognition, not knowledge. Stats tracked here pollute the priority system with data that doesn't reflect actual learning progress.
2. **Type game** — A speed-based falling words game. The re-fetch of the deck when empty (`spawnWord()` line 68) produces near-identical ordering since stats haven't meaningfully changed mid-session. The stat tracking is noisy due to the timing-based nature.
3. **Flashcard game** — The 'mastered' case calls `updateQuestionStats()` twice (lines 71-72), doubling the stat impact for a single card review.

The user has decided that Quiz stats should be the single source of truth for question priority across all game modes.

## Goals / Non-Goals

**Goals:**
- Match and Type games use Quiz stats for priority deck selection
- Match and Type games stop tracking their own question stats
- Flashcard removes the duplicate `updateQuestionStats` call in 'mastered' case
- Keep changes minimal — only touch the 3 affected files

**Non-Goals:**
- No changes to the priority scoring formula
- No changes to Quiz, Listen, or Write game stat tracking
- No migration of existing orphaned match/type stats from localStorage
- No changes to game mechanics, UI, or scoring

## Decisions

### Decision 1: Match and Type use `getPrioritizedDeck(questions, 'quiz')`

Both games pass their own game type string to `getPrioritizedDeck()`, which fetches per-game stats. Switching to `'quiz'` means they inherit the quiz-based priority weights. This is the simplest change — one string per call site.

**Alternatives considered:**
- **Cross-game stat aggregation** — Weighted average across all game types. More accurate but significantly more complex.
- **New 'global' game type** — Would require changes to `getWeights()` and `getPriorityScore()`. Overkill for this fix.

### Decision 2: Remove all `updateQuestionStats` calls from Match and Type

Since these games no longer contribute to priority decisions, tracking stats serves no purpose. Removing the calls simplifies the code and eliminates stat pollution.

**Match affected lines:** 121 (correct match), 142 (wrong match)
**Type affected lines:** 146 (word falls off screen), 243 (correct typing)

### Decision 3: Remove duplicate line 72 in Flashcard

Line 72 is an exact duplicate of line 71. Simply delete it.

## Risks / Trade-offs

- **Orphaned stats**: Existing match/type stats in localStorage will never be read again. This is harmless — they just occupy a few KB.
- **Loss of per-game accuracy data**: The stats screen will no longer show match/type accuracy. However, since the user explicitly requested this, the trade-off is acceptable.
- **Flashcard stat accuracy**: After removing the duplicate call, 'mastered' cards will have stats consistent with 'familiar' cards (one call each). This is the correct behavior.
