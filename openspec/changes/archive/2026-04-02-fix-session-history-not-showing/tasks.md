## 1. Add sessionHistory global state and storage functions

- [x] 1.1 Add `let sessionHistory = []` global variable in main.js
- [x] 1.2 Add `loadSessionHistory()` function in loadFromStorage()
- [x] 1.3 Add `saveSessionHistory()` function in saveToStorage()

## 2. Update gameOver() to save session

- [x] 2.1 Modify gameOver() to accept correct/wrong counts as parameters
- [x] 2.2 Create session object with id, type, score, correct, wrong, timestamp
- [x] 2.3 Add session to sessionHistory array
- [x] 2.4 Enforce 20 session limit (remove oldest if exceeded)

## 3. Update renderStatsScreen() to display session history

- [x] 3.1 Read sessionHistory from localStorage in renderStatsScreen()
- [x] 3.2 Sort sessions by timestamp (newest first)
- [x] 3.3 Render each session with game type icon, score, accuracy, date
- [x] 3.4 Display "No sessions recorded yet." when empty

## 4. Update game files to pass correct/wrong to gameOver

- [x] 4.1 Update game-quiz.js to pass correct/wrong counts to gameOver()
- [x] 4.2 Update game-listen.js to pass correct/wrong counts to gameOver()
- [x] 4.3 Update game-flash.js to pass correct/wrong counts to gameOver()
- [x] 4.4 Update game-match.js to pass correct/wrong counts to gameOver()
- [x] 4.5 Update game-type.js to pass correct/wrong counts to gameOver()

## 5. Verify and test

- [ ] 5.1 Test by playing a game and checking stats screen shows session
- [ ] 5.2 Test that multiple sessions appear in history
- [ ] 5.3 Test that oldest session is removed after 20 sessions