# Tasks: Scale UI 125%

## Phase 1: CSS Variables & Base Styles

### Task 1.1: Update css/variables.css
- [x] Increase `--font-px` base from 8px to 10px
- [x] Increase `--font-jp` base from 14px to 18px

### Task 1.2: Update css/base.css
- [x] Update `.action-btn` padding: `10px 16px` → `12px 20px`
- [x] Update `.btn-sm` padding: `6px 10px` → `8px 12px`
- [x] Update `.menu-container` max-width: `600px` → `750px`
- [x] Update `.title-en` font-size at media query

## Phase 2: Extra & Layout CSS

### Task 2.1: Update css/extra.css
- [x] Update `.panel` max-width: `680px` → `850px`
- [x] Update `.panel-stats` max-width: `720px` → `900px`
- [x] Update `.setting-row` font-size: `10px` → `12px`
- [x] Update `.setting-select` font-size: `10px` → `12px`
- [x] Update `.form-group label` font-size: `12px` → `15px`
- [x] Update `.form-group input` font-size: `12px` → `15px`
- [x] Update `.data-table` font-size: `11px` → `14px`
- [x] Update `.current-data h3` font-size: `12px` → `15px`
- [x] Update `.data-chip` font-size: `12px` → `15px`
- [x] Update `.page-btn` font-size: `10px` → `12px`
- [x] Update `.modal-textarea` font-size: `11px` → `14px`
- [x] Update `.type-target` font-size: `24px` → `30px`
- [x] Update `#type-input` font-size: `18px` → `22px`
- [x] Update `.stats-summary-value` font-size: `18px` → `22px`
- [x] Update all other 8px → 10px, 9px → 11px, 10px → 12px references

### Task 2.2: Update css/menu.css
- [x] Update `.stat-label` font-size: `7px` → `9px`
- [x] Update `.stat-val` font-size: `7px` → `9px`
- [x] Update `.btn-text` font-size: `14px` → `18px`
- [x] Update `.btn-text small` font-size: `10px` → `12px`
- [x] Update `.btn-arrow` font-size: `9px` → `11px`
- [x] Update `.menu-footer` font-size: `7px` → `9px`
- [x] Update `.menu-btn` padding: `14px 18px` → `18px 22px`

## Phase 3: Game CSS

### Task 3.1: Update css/game-quiz.css
- [x] Update `.quiz-container` max-width: `680px` → `850px`
- [x] Update `.choice-btn` font-size: `15px` → `19px`
- [x] Update `.progress-info` font-size: `7px` → `9px`

### Task 3.2: Update css/game-listen.css
- [x] Update `.listen-container` max-width: `680px` → `850px`
- [x] Update listen instruction font-size: `14px` → `18px`
- [x] Update `.listen-audio-status` font-size: `14px` → `18px`

### Task 3.3: Update css/game-flash.css
- [x] Update `.flash-container` max-width: `550px` → `688px`
- [x] Update `.card-reading` font-size: `32px` → `40px`
- [x] Update `.card-translation` font-size: `18px` → `22px`
- [x] Update `.card-explanation` font-size: `13px` → `16px`

### Task 3.4: Update css/game-type.css
- [x] Update `.type-container` max-width: `700px` → `875px`
- [x] Update `#type-canvas-container` max-width: `800px` → `1000px`
- [x] Update `.type-target` font-size: `24px` → `30px`

### Task 3.5: Update css/game-write.css
- [x] Update `.write-container` max-width: `720px` → `900px`
- [x] Update `.modal-gameover` max-width: `640px` → `800px`
- [x] Update `.write-target-char` font-size: `72px` → `90px`
- [x] Update all font-sizes proportionally (8px→10px, 10px→12px, 12px→15px, 14px→18px)

### Task 3.6: Update css/game-hud.css
- [x] Update `.hud-container` max-width: `700px` → `875px`
- [x] Update `.hud-bar-container` max-width: `700px` → `875px`

### Task 3.7: Update css/game-overlays.css
- [x] Update `.go-title` font-size: `28px` → `35px`
- [x] Update `.go-score` font-size: `14px` → `18px`

### Task 3.8: Update css/modals.css
- [x] Update `.modal-title` font-size: `12px` → `15px`
- [x] Update `.weight-label` font-size: `11px` → `14px`
- [x] Update `.weight-value` font-size: `9px` → `11px`
- [x] Update `.weight-desc` font-size: `10px` → `12px`

## Phase 4: JavaScript

### Task 4.1: Update js/main.js
- [x] Remove or disable zoom logic in `adjustZoom()` function
- [x] Keep the function but make it do nothing or just set zoom to 100%

## Phase 5: Verification

### Task 5.1: Test on Desktop
- [x] Open app on screen ≥1024px
- [x] Verify fonts are larger and readable
- [x] Verify containers are wider
- [x] Verify all game screens work correctly
- [x] Verify canvas drawing still works

### Task 5.2: Test on Mobile
- [x] Open app on screen <768px
- [x] Verify mobile layout unchanged
- [x] Verify touch events work correctly
