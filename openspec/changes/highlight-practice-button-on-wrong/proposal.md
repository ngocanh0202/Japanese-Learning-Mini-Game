## Why

The Practice button (✍️ Practice) in screen-quiz and screen-listen needs to be visually highlighted when the user answers incorrectly. Currently, the button appears but there's no visual indication to draw attention to it when the user needs it most - after making a mistake.

## What Changes

- Add `.practice-highlight` CSS class with red color and pulse animation to both quiz and listen screens
- Apply the highlight class to the Practice button in `game-quiz.js` when answer is wrong
- Apply the highlight class to the Practice button in `game-listen.js` when answer is wrong
- Ensure both screens remain synchronized in behavior

## Capabilities

### New Capabilities

- `practice-button-highlight`: Visual feedback mechanism for Practice button when user answers incorrectly

### Modified Capabilities

None - this is a pure UI enhancement with no requirement changes.

## Impact

- **CSS**: Add new highlight styles to `css/base.css` (shared styles)
- **JavaScript**: 
  - `game-quiz.js`: Add highlight class when wrong answer
  - `game-listen.js`: Add highlight class when wrong answer
