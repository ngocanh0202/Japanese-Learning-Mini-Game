# Spec: CSS Recovery

## Goal
Restore all CSS classes and keyframe animations that were accidentally deleted during CSS modularization.

## Requirements

### 1. Animations File (css/animations.css)
Create new file with 13 keyframe animations:
- `toastSlideIn` - Toast slide from top (0% → 100%)
- `slideDown` - Priority panel reveal
- `cardClick` - Scale 1 → 0.95 → 1
- `matchSuccess` - Scale + glow success
- `matchWrong` - Horizontal shake
- `cardEnter` - Scale + translateY entrance
- `slideIn` - Slide from top
- `fadeIn` - Opacity 0 → 1
- `slideUp` - Toast position slide up
- `pulse` - Opacity 1 → 0.4 → 1
- `comboFloat` - Float up + fade out
- `shake` - Horizontal shake
- `twinkle` - Opacity flicker

### 2. Extra CSS (css/extra.css)
Add missing classes by category:

**Select/Input:**
- `.setting-select` - 160px width, dark bg, rounded
- `#question-set-selector` - min-width 180px, no appearance

**Settings:**
- `.settings-group` - grid gap 18px
- `.priority-panel` - display none, margin-top 12px
- `.priority-panel.active` - display block + slideDown animation

**Priority weights:**
- `.weight-header` - flex, space-between, margin-bottom 8px
- `.weight-value` - font-size 14px, color accent
- `.weight-slider` - full width, gradient bg
- `.weight-desc` - font-size 8px, color #666

**Stats:**
- `.mastery-circle` - 80px circle, conic gradient, centered
- `.mastery-mastered` - --circle-color: #30d158
- `.mastery-learning` - --circle-color: #ffd60a
- `.mastery-new` - --circle-color: #ff2d55

**Quiz:**
- `.choices-grid` - grid-template-columns: 1fr 1fr, gap 10px
- `.quiz-container` - max-width 680px, flex column
- `.listen-container` - max-width 680px, flex column

**Flashcard:**
- `.flash-actions` - flex gap 16px, full width
- `.flash-bar-track` - height 8px, rounded overflow
- `.flash-bar-fill` - gradient bg, transition width
- `.btn-known` - accent3 bg, color #000
- `.btn-unknown` - accent bg, color #fff

**Match:**
- `.match-container` - padding 16px, 50% width
- `.match-footer` - flex center, margin-top 14px
- `.tile-card.match-success` - matchSuccess animation
- `.match-instructions` - font-size 14px, accent4 color

**Data:**
- `.table-scroll` - min-width 100%
- `.question-list .tiny-btn.table-btn` - padding 6px 10px
- `.status-msg` - font-size 12px, min-height 20px
- `.status-ok` - color accent3
- `.status-err` - color accent

**Firebase:**
- `.firebase-config-section` - margin 16px 0, full width

**Other:**
- `.loading` - text-align center, padding 20px, color text-dim
- `.empty-message` - same as loading
- `.error-message` - same but color accent

### 3. HTML Update (index.html)
Add in `<head>`:
```html
<link rel="stylesheet" href="css/animations.css">
<link rel="stylesheet" href="css/extra.css">
```

## Acceptance Criteria
- [ ] All 13 keyframe animations exist in css/animations.css
- [ ] All 25+ CSS classes exist in css/extra.css
- [ ] index.html includes both new CSS files
- [ ] UI renders correctly with all restored styles
