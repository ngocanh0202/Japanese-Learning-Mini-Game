# Tasks: Add Type Answer Check Mode

## Phase 1: HTML Settings

### Task 1.1: Add select option in index.html
- [x] Add `<select id="type-compare-mode">` in Settings screen under "Game 3 - FALLING WORDS"
- [x] Options: "romaji" (Romaji) and "answer" (Answer from question)
- [x] Add onchange handler: `onchange="updateSettingsFromUI()"`

## Phase 2: JavaScript Settings

### Task 2.1: Add default setting in js/main.js
- [x] Add `typeAnswerMode: 'romaji'` to default settings object

### Task 2.2: Add load function in js/settings.js
- [x] Load setting value from `settings.typeAnswerMode`
- [x] Set select element value

### Task 2.3: Add save function in js/settings.js
- [x] Read select value from `type-compare-mode`
- [x] Save to `settings.typeAnswerMode`

## Phase 3: Game Logic

### Task 3.1: Update mode label in js/games/game-type.js
- [x] Update `getTypeModeLabel()` to show "Romaji" or "Answer" based on mode

### Task 3.2: Update input check logic in js/games/game-type.js
- [x] Modify `onTypeInput()` to check based on `settings.typeAnswerMode`
- [x] If mode is "answer", use `target.a[target.c]` as compare value
- [x] Fall back to `target.romaji` if `a` or `c` is missing

## Phase 4: Testing

### Task 4.1: Test Romaji mode
- [ ] Select "Romaji" in settings
- [ ] Play game-type
- [ ] Verify input is checked against romaji

### Task 4.2: Test Answer mode
- [ ] Select "Answer" in settings
- [ ] Play game-type
- [ ] Verify input is checked against answer from question

### Task 4.3: Test fallback
- [ ] Use question without `a` or `c`
- [ ] Verify falls back to romaji

### Task 4.4: Test persistence
- [ ] Change setting, refresh page
- [ ] Verify setting persists
