## Context

Japanese QUEST is a vanilla HTML/CSS/JS Japanese learning mini-game app. No build system, no package manager. The entire application runs from a single `index.html` with 7 script files loading in sequence.

**Current state:** `main.js` is 2093 lines containing storage, settings, data management, Firebase, stats, priority scoring, screen navigation, and game routing. This monolithic file is hard to maintain. Multiple feature requests have accumulated: UI fixes, new game modes, better learning tracking, and rebalanced progression.

**Constraints:** Must remain vanilla HTML/CSS/JS. No bundlers, no npm, no module systems. Scripts load via `<script>` tags in `index.html`. All state is global. Data persists via localStorage.

## Goals / Non-Goals

**Goals:**
- Reduce main.js from 2093 to ~400 lines by extracting into focused modules
- Add 13 features/fixes without breaking existing functionality
- Maintain backward compatibility with existing localStorage data
- Keep the project runnable by opening index.html directly in browser

**Non-Goals:**
- No build system or bundler introduction
- No TypeScript or transpilation
- No changes to the question data format (backward compatible additions only)
- No Firebase schema changes
- No mobile app or PWA conversion

## Decisions

### 1. Module architecture without bundlers
**Decision:** Use global function exposure pattern. Each new file defines functions that attach to `window` implicitly (standard JS behavior in browser). No IIFE wrappers, no `export/import`.

**Rationale:** The project has zero build tooling. Adding any module system would require a bundler or build step, violating the project's core constraint. The existing codebase already uses this pattern.

**Alternatives considered:**
- ES modules (`<script type="module">`): Would work but changes the global scope semantics and requires careful import ordering. More complex for minimal benefit.
- IIFE pattern: Would prevent accidental global pollution but adds boilerplate. Current code doesn't use it.

### 2. Script load order
**Decision:** `data.js → main.js → storage.js → settings.js → game-utils.js → data-manager.js → game-*.js`

**Rationale:** `main.js` defines all globals. `storage.js` needs those globals for read/write. `settings.js` needs globals + storage functions. `game-utils.js` needs globals + settings. `data-manager.js` needs everything above. Game files need all utilities.

### 3. Response time tracking approach
**Decision:** Track `questionStartTime` as a global timestamp set on render, calculate delta on answer. Store running average in question stats.

**Rationale:** Simple, no external dependencies. Running average avoids storing every individual response time (which would bloat localStorage). 8-second threshold is reasonable for multiple-choice questions.

### 4. Writing game input method
**Decision:** Support both romaji input (via wanakana) and direct Japanese input. Default to romaji mode.

**Rationale:** Most users won't have Japanese IME configured. Romaji input via wanakana is the most accessible option. The `word` mode is available for advanced users.

### 5. Practice writing modal vs full game
**Decision:** Use inline modal for practice writing after wrong answers, not launching the full writing game.

**Rationale:** User is in the middle of a quiz/listen session. Launching a full game would lose context. A modal lets them practice the specific word they got wrong, then return to the game.

### 6. Level rebalance formula
**Decision:** Progressive XP curve: `XP_needed(level) = 500 * 1.2^(level-1)`. Base reward reduced from 10 to 5 XP. Combo multiplier at 1.5x.

**Rationale:** At level 1, needs 500 XP (50 correct answers at base rate). At level 10, needs ~2600 XP per level. This creates meaningful progression without being grindy.

### 7. Session history fix
**Decision:** Add `completed` boolean parameter to `gameOver()`. Only record when `true`. HP-based game overs pass `false`.

**Rationale:** Minimal change to existing function signature. Clear intent. Backward compatible (default to `false` if parameter omitted).

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Script load order breakage** — Adding new files increases risk of load-order bugs | Carefully document load order in index.html comments. Test by opening index.html directly. |
| **localStorage data corruption** — New fields in questionStats could conflict with old data | Add migration check: if stats object lacks new fields, initialize them to defaults. |
| **Response time tracking adds latency** — Timing calculations on every answer | Negligible — just `Date.now()` subtraction. No measurable performance impact. |
| **Writing game wanakana dependency** — wanakana.min.js must be loaded before game-write.js | Already loaded in index.html before all game files. No change needed. |
| **Settings UI toggle conversion** — Converting checkboxes to toggles could break existing `updateSettingsFromUI()` | The toggle pattern uses the same `id` attributes and `checked` property. No JS changes needed for existing toggles. New toggles follow same pattern. |
| **Scroll fix may affect other screens** — `scrollbar-gutter: stable` could cause visual shifts | Only apply to `#screen-settings .panel` and `#screen-data .panel`. Other screens use different layout. |
| **Shuffle answers breaks existing question data** — If `q.c` is not recalculated after shuffle | The shuffle function creates a new options array and recalculates the correct index. Original question object is never mutated. |
