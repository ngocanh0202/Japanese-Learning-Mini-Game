## Why

During the CSS file restructuring (splitting style.css into multiple modular files), many CSS classes were accidentally deleted. This caused the UI to break - missing styles for select dropdowns, animations, quiz layout, flashcard components, match game, and many more.

## What Changes

- Create `css/animations.css` containing all 13 lost keyframe animations
- Update `css/extra.css` with all missing CSS classes (select, settings, priority, stats, quiz, flashcard, match, data table, etc.)
- Add CSS links to `index.html` for animations and extra styles

## Capabilities

### New Capabilities

- `css-recovery`: Restore all lost CSS classes from the old monolithic style.css

### Modified Capabilities

- None - this is purely a CSS restoration, no behavioral changes

## Impact

- `css/animations.css` - new file with keyframe animations
- `css/extra.css` - updated with missing classes
- `index.html` - added 2 CSS link tags