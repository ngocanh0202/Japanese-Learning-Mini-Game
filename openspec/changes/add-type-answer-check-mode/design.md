## Context

Game-type (Falling Words) currently checks player input against `word.romaji`. Users want to also check against the correct answer from question options (`word.a[word.c]`).

## Goals / Non-Goals

**Goals:**
- Add new setting option to choose compare mode
- Support checking against romaji or answer options
- Preserve existing romaji mode as default

**Non-Goals:**
- Change other game modes (quiz, listen, etc.)
- Add new game features

## Decisions

### Decision 1: Setting Option
**Choice:** Add dropdown in Settings under "Game 3 - FALLING WORDS"
**Options:**
- "Romaji" - Check against romaji (default, current behavior)
- "Answer" - Check against word.a[word.c]

**Rationale:** Simple dropdown that matches existing UI patterns.

### Decision 2: Data Flow
**Choice:** Pass full question object to game, access both romaji and answer
**Rationale:** The falling word object already contains the full question data including `a` (answers array) and `c` (correct index).

## Implementation Details

### HTML Changes
```html
<label class="setting-row"><span>Compare input against</span>
  <select id="type-compare-mode" onchange="updateSettingsFromUI()">
    <option value="romaji">Romaji</option>
    <option value="answer">Answer (from question)</option>
  </select>
</label>
```

### JavaScript Logic
```javascript
// In onTypeInput:
const target = fallingWords[0];
let compareValue;

if (settings.typeAnswerMode === 'answer') {
  // Get correct answer from a[c]
  compareValue = target.a && typeof target.c === 'number' ? target.a[target.c] : target.romaji;
} else {
  compareValue = target.romaji;
}

// Compare input against compareValue
```

### Settings Storage
- Key: `typeAnswerMode`
- Values: `'romaji'` (default), `'answer'`
- Stored in localStorage like other settings

## Risks / Trade-offs

### Risk: Questions without answers array
**Mitigation:** Fall back to romaji if `a` or `c` is missing/undefined.

### Risk: UI position
**Mitigation:** Add after existing type-game-speed and type-spawn-interval settings.

## Migration Plan

1. Add setting option in HTML
2. Add default in main.js
3. Add load/save in settings.js
4. Update game-type.js logic
5. Test both modes work correctly

## Open Questions

None - user requirements are clear.
