## 1. Card Object Structure

- [x] 1.1 Add `animating: false` property to card objects in `startMatch()` function
- [x] 1.2 Update `renderMatchBoard()` template to include `match-animation` class when `card.animating` is true

## 2. Match Animation Logic

- [x] 2.1 Modify `handleMatchCard()` to set `animating: true` on both matched cards when a match is found
- [x] 2.2 Add `renderMatchBoard()` call immediately after setting `animating: true` to show animation
- [x] 2.3 Add `setTimeout` (600ms) to set `animating: false` and call `renderMatchBoard()` again after animation completes

## 3. Verification

- [x] 3.1 Test match game in browser - verify animation plays on successful matches
- [x] 3.2 Verify animation class is removed after 600ms
- [x] 3.3 Verify non-matching cards do not trigger animation
- [x] 3.4 Verify game completion flow still works correctly after all pairs matched
