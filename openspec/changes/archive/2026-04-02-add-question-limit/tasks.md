## 1. Add settings structure

- [x] 1.1 Add `questionLimitEnabled: false` and `questionLimit: 20` to settings object in main.js
- [x] 1.2 Update `renderSettingsScreen()` to restore question limit toggle and input values
- [x] 1.3 Update `updateSettingsFromUI()` to read question limit toggle and input values

## 2. Add UI in screen-settings

- [x] 2.1 Add new setting block for question limit in index.html (after Smart Prioritization, before BACK TO MENU)
- [x] 2.2 Add toggle checkbox with id `question-limit-enabled`
- [x] 2.3 Add number input with id `question-limit-value` (min: 5, max: 200, default: 20)

## 3. Apply limit to game modes

- [x] 3.1 Update `startQuiz()` in game-quiz.js to slice deck when limit enabled
- [x] 3.2 Update `startListen()` in game-listen.js to slice deck when limit enabled
- [x] 3.3 Update `startFlash()` in game-flash.js to slice deck when limit enabled
- [x] 3.4 Update `startMatch()` in game-match.js to slice deck when limit enabled
- [x] 3.5 Update `startTyping()` in game-type.js to slice deck when limit enabled

## 4. Test and verify

- [x] 4.1 Verify default state: limit disabled, value shows 20
- [x] 4.2 Verify enabling limit applies to all game modes
- [x] 4.3 Verify disabling limit uses all questions
- [x] 4.4 Verify settings persist after page reload
