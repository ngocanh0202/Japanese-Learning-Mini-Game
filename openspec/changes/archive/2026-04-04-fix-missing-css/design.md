# Design: fix-missing-css

## Overview
Restore CSS classes and keyframe animations that were accidentally deleted during CSS modularization.

## Solution

### 1. Create css/animations.css
New file containing all 13 keyframe animations:
- `toastSlideIn` - Toast notification slide in from top
- `slideDown` - Slide down reveal (priority panel)
- `cardClick` - Card click scale effect
- `matchSuccess` - Match success glow + scale
- `matchWrong` - Match wrong shake animation
- `cardEnter` - Card entering animation
- `slideIn` - Generic slide in
- `fadeIn` - Generic fade in
- `slideUp` - Slide up (toast position)
- `pulse` - Pulse effect (game over)
- `comboFloat` - Combo popup float up
- `shake` - Shake animation
- `twinkle` - Twinkle/flicker effect

### 2. Update css/extra.css
Add missing CSS classes organized by category:
- **Select/Input**: `.setting-select`, `#question-set-selector`
- **Settings**: `.settings-group`, `.priority-panel`, `.priority-panel.active`
- **Priority weights**: `.weight-header`, `.weight-value`, `.weight-slider`, `.weight-desc`
- **Stats**: `.mastery-circle`, `.mastery-mastered`, `.mastery-learning`, `.mastery-new`
- **Quiz**: `.choices-grid`, `.quiz-container`, `.listen-container`
- **Flashcard**: `.flash-actions`, `.flash-bar-track`, `.flash-bar-fill`, `.btn-known`, `.btn-unknown`
- **Match**: `.match-container`, `.match-footer`, `.tile-card.match-success`, `.match-instructions`
- **Data**: `.table-scroll`, `.question-list .tiny-btn.table-btn`, `.status-msg`, `.status-ok`, `.status-err`
- **Firebase**: `.firebase-config-section`
- **Other**: `.loading`, `.empty-message`, `.error-message`

### 3. Update index.html
Add CSS links in `<head>`:
```html
<link rel="stylesheet" href="css/animations.css">
<link rel="stylesheet" href="css/extra.css">
```

## Implementation Order
1. Create `css/animations.css` with all keyframes
2. Update `css/extra.css` with missing classes
3. Update `index.html` to include new CSS files
