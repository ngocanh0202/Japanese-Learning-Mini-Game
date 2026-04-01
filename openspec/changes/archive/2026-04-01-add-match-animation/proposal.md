## Why

The match game currently lacks visual feedback when players successfully match two cards. While the CSS defines a `match-animation` class with a success animation (`matchSuccess` keyframe), the game logic never applies this class to matched cards. This creates a disconnect between the visual design and gameplay experience, making successful matches feel less satisfying.

## What Changes

- Modify `game-match.js` to add the `match-animation` class to both cards when a match is found
- Add animation state tracking to card objects to manage when animation is active
- Use `setTimeout` to remove the animation class after the CSS animation duration (600ms)
- Ensure the animation plays before cards are marked as fully matched in the UI

## Capabilities

### New Capabilities
- `match-card-animation`: Visual feedback animation when two cards are successfully matched in the match game

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **game-match.js**: Card object structure (adds `animating` property), `renderMatchBoard()` template, `handleMatchCard()` match logic
- **style.css**: No changes needed - `match-animation` class already exists with `matchSuccess` animation
