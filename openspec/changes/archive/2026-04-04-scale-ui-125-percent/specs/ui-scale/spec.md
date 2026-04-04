# Spec: UI Scale 125%

## Goal

Scale all UI elements (fonts, widths, spacing) by 125% on desktop screens (≥1024px) to improve readability without breaking canvas functionality.

## Requirements

### 1. Font Size Scaling

Scale all font sizes by 125%:

| Original | Scaled | Files |
|----------|--------|-------|
| 6px | 8px | base.css, modals.css |
| 7px | 9px | base.css, game-quiz.css, modals.css, extra.css |
| 8px | 10px | base.css, extra.css, menu.css, game-write.css, modals.css |
| 9px | 11px | extra.css, game-quiz.css, game-listen.css, modals.css |
| 10px | 12px | extra.css, game-write.css |
| 11px | 14px | extra.css, game-quiz.css |
| 12px | 15px | extra.css, game-write.css |
| 13px | 16px | extra.css, game-flash.css |
| 14px | 18px | extra.css, menu.css, game-write.css, game-type.css |
| 18px | 22px | extra.css |
| 24px | 30px | extra.css, game-listen.css |

### 2. Max-Width Scaling

Scale container max-widths by 125%:

| Container | Original | Scaled | File |
|-----------|----------|--------|------|
| Menu | 600px | 750px | base.css |
| Panel | 680px | 850px | extra.css |
| Quiz | 680px | 850px | game-quiz.css |
| Listen | 680px | 850px | game-listen.css |
| Flash | 550px | 688px | game-flash.css |
| Type | 700px | 875px | game-type.css |
| HUD | 700px | 875px | game-hud.css |
| Write | 720px | 900px | game-write.css |
| Game Over | 640px | 800px | game-write.css |

### 3. Padding Scaling

Scale key paddings by 125%:

- Button padding: `10px 16px` → `12px 20px`
- Panel padding: `24px` → `30px`
- Card padding: `12px` → `15px`
- Input padding: `10px` → `12px`

### 4. Zoom Removal

Remove CSS zoom from `js/main.js`:

```javascript
// Before
function adjustZoom() {
  if (window.innerWidth >= 1024) {
    document.body.style.zoom = '150%';
  }
}

// After
function adjustZoom() {
  // No zoom - using CSS scaling instead
}
```

### 5. Responsive Breakpoints

Maintain mobile-first with desktop overrides:

- `min-width: 1024px` - Apply 125% scaling
- Keep existing `max-width: 768px` and `max-width: 480px` for mobile

## Implementation Files

Modify these CSS files:
- `css/variables.css` - base font sizes
- `css/base.css` - button, menu container
- `css/extra.css` - panel, settings, forms, data table
- `css/menu.css` - menu buttons
- `css/game-quiz.css`
- `css/game-listen.css`
- `css/game-flash.css`
- `css/game-type.css`
- `css/game-write.css`
- `css/game-hud.css`
- `css/game-overlays.css`
- `css/modals.css`

Also modify:
- `js/main.js` - remove/adjust zoom logic
