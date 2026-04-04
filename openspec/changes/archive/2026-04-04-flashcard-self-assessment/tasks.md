## 1. HTML UI Update

- [x] 1.1 Replace 2-button (Unknown/Known) with 4-button (New/Learning/Familiar/Mastered) in `index.html` flash screen
- [x] 1.2 Update button onclick handlers to call `markCard('new')`, `markCard('learning')`, `markCard('familiar')`, `markCard('mastered')`

## 2. CSS Styling

- [x] 2.1 Add color styles for 4 new button classes: `.btn-new`, `.btn-learning`, `.btn-familiar`, `.btn-mastered` in `css/game-flash.css`
- [x] 2.2 Remove old `.btn-known` and `.btn-unknown` styles
- [x] 2.3 Add responsive 2x2 grid layout for mobile screens

## 3. JavaScript Logic

- [x] 3.1 Fix `startFlash()` to store `originalIndex` in each deck card via `.map(q => ({ ...q, originalIndex: questions.indexOf(q) }))`
- [x] 3.2 Rewrite `markCard(level)` to handle 4 levels with switch statement
- [x] 3.3 Map New/Learning to `updateQuestionStats(origIdx, 'flash', false, responseTime)`
- [x] 3.4 Map Familiar to `updateQuestionStats(origIdx, 'flash', true, responseTime)` with 1.5x XP
- [x] 3.5 Map Mastered to double `updateQuestionStats` call with 2.5x XP
- [x] 3.6 Update HUD counters to reflect 4-level assessment (known/unknown counts)

## 4. Manual Testing

- [x] 4.1 Test all 4 buttons record correct stats (verify in localStorage)
- [x] 4.2 Test Mastered gives +2 correctStreak vs Familiar +1
- [x] 4.3 Test originalIndex fix: stats tracked against correct question
- [x] 4.4 Test XP rewards: Familiar = 1.5x, Mastered = 2.5x
- [x] 4.5 Test responsive layout on narrow viewport
- [x] 4.6 Test full flashcard session completes without errors
