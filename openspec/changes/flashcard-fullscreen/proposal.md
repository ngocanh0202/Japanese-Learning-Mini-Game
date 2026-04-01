## Why

The flashcard card-scene has a fixed height (260px desktop, 200px mobile) that doesn't utilize available screen space. Users want the card to fill the full available screen area for better visibility and interaction, especially on larger displays.

## What Changes

- Update `.flash-container` to use flexbox with `flex: 1` to fill available vertical space
- Update `.card-scene` to use `flex: 1` instead of fixed height, with min/max constraints
- Remove fixed height from `.card-scene` and rely on flexbox for responsive sizing
- Adjust media queries for better mobile responsiveness

## Capabilities

### New Capabilities
- `flashcard-fullscreen`: Card scene now fills available screen space using flexbox

### Modified Capabilities
- None (existing functionality unchanged, only CSS layout improvement)

## Impact

- **Files Modified**: `style.css` (lines 812-822, media queries)
- **No breaking changes**: Purely visual/layout improvement
- **Mobile**: Better utilization of limited screen space
- **Desktop**: Card can expand appropriately on larger displays