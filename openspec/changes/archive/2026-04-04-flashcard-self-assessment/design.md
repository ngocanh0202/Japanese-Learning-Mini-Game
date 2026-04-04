## Context

The flashcard game (`js/games/game-flash.js`) currently uses a binary Unknown/Known assessment after flipping a card. This lacks nuance for spaced repetition learning. Additionally, there is a bug: `markCard()` passes `flashIdx` (shuffled deck position) to `updateQuestionStats()` instead of the original question index in the `questions` array, causing all priority stats to be recorded against wrong questions.

Current flow:
1. `startFlash()` → `getPrioritizedDeck(questions, 'flash')` → shuffled deck
2. User flips card → sees 2 buttons: Unknown / Known
3. `markCard(known)` → `updateQuestionStats(flashIdx, 'flash', ...)` ← BUG: flashIdx is deck position, not question index

## Goals / Non-Goals

**Goals:**
- Replace binary assessment with 4-level self-assessment (New/Learning/Familiar/Mastered)
- Each level maps to differentiated stat tracking and XP rewards
- Mastered grants +2 correctStreak (double Familiar's +1) to reduce appearance frequency
- Fix originalIndex tracking bug
- Color-coded UI for intuitive recognition

**Non-Goals:**
- No changes to other game modes
- No changes to the priority scoring algorithm itself
- No server-side sync

## Decisions

### Decision 1: 4-level stat mapping

| Level | incorrect | correctStreak | incorrectHistory | XP multiplier |
|-------|-----------|---------------|-------------------|---------------|
| New | +1 | reset 0 | +timestamp | 1.0x |
| Learning | +1 | reset 0 | +timestamp | 1.0x |
| Familiar | 0 | +1 | 0 | 1.5x |
| Mastered | 0 | +2 | 0 | 2.5x |

**Rationale**: New and Learning both count as "not yet known" — if the user isn't confident, they need more exposure. Familiar and Mastered are both "known" but Mastered gets double streak credit, meaning it takes 2× fewer correct answers to reduce priority.

**Alternatives considered**:
- Learning = 0 incorrect, 0 streak change: Too neutral, doesn't encourage honest self-assessment
- Mastered = reduce incorrect by 1: Too aggressive, could erase learning history

### Decision 2: Mastered = +2 correctStreak via double call

**Approach**: Call `updateQuestionStats(origIdx, 'flash', true, responseTime)` twice for Mastered.

**Rationale**: Simplest implementation — no API change needed. Each call increments correctStreak by 1, so two calls = +2. The streak-based incorrect reduction (every 3 correct) also triggers faster.

**Alternatives considered**:
- Add `streakIncrement` parameter to `updateQuestionStats()`: More explicit but requires changing shared utility
- Add separate `incrementStreak()` function: Extra code for one use case

### Decision 3: Store originalIndex in deck objects

**Approach**: `flashDeck = getPrioritizedDeck(questions, 'flash').map(q => ({ ...q, originalIndex: questions.indexOf(q) }))`

**Rationale**: Matches pattern already used in `game-type.js`. `questions.indexOf(q)` works because `getPrioritizedDeck` returns references to original question objects (not copies).

### Decision 4: Button colors

| Button | Color | CSS var |
|--------|-------|---------|
| New | Red (#ff2d55) | `--accent` |
| Learning | Yellow (#ffd60a) | `--accent2` |
| Familiar | Green (#30d158) | `--accent3` |
| Mastered | Blue (#0a84ff) | `--accent4` |

**Rationale**: Traffic light metaphor — red = stop/don't know, yellow = caution/learning, green = good/familiar, blue = expert/mastered.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| 4 buttons may not fit on small screens | CSS responsive: 2×2 grid on mobile |
| Double `updateQuestionStats` call for Mastered triggers 2x `saveQuestionStats()` | Acceptable — localStorage writes are fast; could batch in future |
| `questions.indexOf(q)` is O(n) | Acceptable for current deck sizes (<500 questions); could optimize with index map if needed |
