## Context

The current Smart Prioritization system lives in `js/game-utils.js` and tracks per-question, per-game-type stats in `questionStats` (persisted to localStorage via `jq_question_stats`).

Current data structure per question per game type:
```
{ incorrect: 0, correctCount: 0, totalAttempts: 0, lastSeen: null, correctStreak: 0, avgResponseTime: 0, slowCorrectCount: 0 }
```

Priority score formula:
```
score = (incorrect × weight.incorrect) + timeBonus - learningPenalty + slowBonus
```

Problem: `incorrect` is a flat counter that never decays. A question answered wrong 10 times 30 days ago still scores the same as one answered wrong today, even if the user has since answered it correctly 5 times in a row.

All 6 game modes call `getPrioritizedDeck()` and `updateQuestionStats()`, so changes to these core functions apply globally.

## Goals / Non-Goals

**Goals:**
- Implement exponential time-decay for incorrect answer history
- Reduce incorrect count when user demonstrates mastery (correct streaks)
- Add confidence level calculation for UI display
- Maintain backward compatibility with existing localStorage data
- Keep changes localized to `game-utils.js`, `storage.js`, `main.js`

**Non-Goals:**
- No changes to game-specific logic or UI
- No performance optimization of the selection algorithm (O(n²) is acceptable for current data sizes)
- No server-side sync or cloud storage changes
- No changes to the weight/score formula structure — only the `incorrect` input changes

## Decisions

### Decision 1: Store `incorrectHistory` as timestamp array

**Approach**: Add `incorrectHistory: string[]` (ISO date strings) to track each incorrect answer timestamp.

**Rationale**: 
- Enables precise exponential decay calculation
- Allows cleanup of old entries (>30 days)
- More flexible than pre-computed decay values

**Alternatives considered**:
- Store pre-decayed `effectiveIncorrect` value: Loses granularity, can't recalculate with different decay rates
- Store `{timestamp, weight}` pairs: Overkill, weight is derived from timestamp alone

### Decision 2: Decay rate of 0.85 per day

**Formula**: `effectiveIncorrect = Σ(0.85^daysSinceEachIncorrect)`

**Rationale**:
- Half-life ≈ 4.3 days — mistakes from ~4 days ago count as 50%
- 30-day-old mistakes: 0.85^30 ≈ 0.007 (essentially gone)
- Balances between "recent mistakes matter more" and "don't forget old patterns too fast"

**Alternatives considered**:
- 0.9/day (half-life ≈ 6.6 days): Too slow, old mistakes linger too long
- 0.8/day (half-life ≈ 3.1 days): Too aggressive, might forget genuine weak spots
- Fixed window (e.g., "only last 14 days"): Hard cutoff is jarring, exponential is smoother

### Decision 3: Reduce incorrect by 1 per 3 correct streak

**Rule**: When `correctStreak % 3 === 0`, reduce `incorrect` by 1 (min 0) and remove the oldest entry from `incorrectHistory`.

**Rationale**:
- Demonstrates real progress — user is consistently getting it right
- Gradual reduction prevents "gaming" the system
- Removing oldest history entry keeps `incorrectHistory` in sync with `incorrect` count

**Alternatives considered**:
- Reduce by 1 per correct answer: Too fast, single lucky guess wipes out history
- Reduce by 1 per 5 correct streak: Too slow, user doesn't see progress feedback

### Decision 4: Keep `incorrect` field alongside `incorrectHistory`

**Rationale**: Backward compatibility. Existing code and localStorage data use `incorrect`. New code computes `effectiveIncorrect` from `incorrectHistory` when available, falls back to `incorrect` when not.

### Decision 5: Confidence level thresholds

```
confidence = correctStreak / (correctStreak + effectiveIncorrect + 1)

new:      confidence < 0.1  (no data yet)
learning: 0.1 ≤ confidence < 0.4
familiar: 0.4 ≤ confidence < 0.7
mastered: confidence ≥ 0.7
```

**Rationale**: Simple ratio that balances recent performance against historical mistakes.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Existing users have no `incorrectHistory` | Fallback to `incorrect` field; new entries populate on next incorrect answer |
| `incorrectHistory` array grows unbounded | Clean entries >30 days old on every `updateQuestionStats` call |
| Decay rate too aggressive for some learners | Rate is configurable via a constant; can be tuned later |
| localStorage size increase | Each timestamp is ~24 bytes; even 100 mistakes = 2.4KB per question per game type — negligible |

## Migration Plan

1. Deploy code changes — no data migration needed
2. On first `updateQuestionStats` call for an existing question, `incorrectHistory` initializes as `[]`
3. If `incorrect > 0` but `incorrectHistory` is empty, seed with a single entry at `lastSeen` timestamp (approximation)
4. Rollback: Remove new code, existing `incorrect` field remains intact — no data loss

## Open Questions

None — all decisions resolved.
