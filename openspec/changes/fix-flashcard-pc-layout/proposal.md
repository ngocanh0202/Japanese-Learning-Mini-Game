## Why

The flashcard card-scene becomes too large on PC (desktop) screens without width constraints. After the previous fullscreen flexbox change, the card can expand to fill the entire available space, which causes layout issues when flipping the card on larger displays.

## What Changes

- Add desktop-specific max-width constraint to `.flash-container` using `@media (min-width: 769px)`
- Add desktop-specific max-height adjustment to `.card-scene` within the same media query
- Mobile (≤480px) and tablet (481-768px) remain unaffected with full-width behavior

## Capabilities

### New Capabilities
- `flashcard-pc-constraints`: Desktop-specific layout constraints for flashcard component

### Modified Capabilities
- None (existing flashcard-fullscreen capability behavior unchanged, only adds constraints for desktop)

## Impact

- **Files Modified**: `style.css` (add new @media query)
- **No breaking changes**: Pure layout fix for desktop only
- **Mobile/Tablet**: Unaffected, continue using full-width flex layout
- **Desktop**: Card width limited to max 550px, height limited to max 380px