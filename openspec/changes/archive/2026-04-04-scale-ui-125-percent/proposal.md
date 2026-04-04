## Why

The current UI is too small on desktop screens (≥1024px), making it difficult to read and use. The app previously used CSS zoom (150%) but this broke the KanjiCanvas drawing functionality. A proper scaling solution is needed to improve user experience on larger screens without breaking canvas functionality.

## What Changes

1. Increase all font sizes by 25% (125% scale)
2. Increase max-width for all screens/containers by 25%
3. Increase padding and margins by 25% where appropriate
4. Remove CSS zoom (`document.body.style.zoom`) implementation
5. Add responsive breakpoints to maintain mobile usability

## Capabilities

### New Capabilities
- **scale-ui-125**: Scale all UI elements (fonts, widths, spacing) by 125% on desktop screens

### Modified Capabilities
- None - this is a visual/UX improvement that doesn't change functionality

## Impact

- **CSS Files**: All files in `css/` directory will be modified
- **JavaScript**: `js/main.js` - remove/adjust zoom logic in `adjustZoom()`
- **No Breaking Changes**: Only visual improvements, existing functionality preserved
- **Performance**: No impact - purely static CSS changes
