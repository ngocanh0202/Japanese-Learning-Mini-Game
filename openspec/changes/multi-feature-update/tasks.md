## 1. Module Architecture — Create new files

- [x] 1.1 Create `storage.js` with all localStorage read/write functions extracted from main.js
- [x] 1.2 Create `settings.js` with settings render/update/priority functions extracted from main.js
- [x] 1.3 Create `game-utils.js` with priority scoring, question stats, session history, level system extracted from main.js
- [x] 1.4 Create `data-manager.js` with import/export, Firebase operations extracted from main.js
- [x] 1.5 Reduce `main.js` to globals, init, screen nav, game router, and utility functions only
- [x] 1.6 Update `index.html` script load order: data.js → main.js → storage.js → settings.js → game-utils.js → data-manager.js → game files
- [ ] 1.7 Verify app loads and all games function after refactoring

## 2. Settings UI Fixes

- [x] 2.1 Update CSS: left-align all `.setting-row` labels, right-align controls
- [x] 2.2 Convert checkbox settings to toggle-switch style (quiz-timer, scanlines, type-hints, disable-gameover, animation)
- [x] 2.3 Add `scrollbar-gutter: stable` and `max-height` to `.panel` on settings and data screens
- [x] 2.4 Add `overflow-y: auto` to settings/data panels for internal scrolling
- [ ] 2.5 Verify settings screen displays correctly with toggle switches and no scroll artifacts

## 3. Level Rebalance

- [x] 3.1 Change `XP_PER_LEVEL` from 100 to 500 in main.js (or game-utils.js after refactor)
- [x] 3.2 Implement `getXpForLevel(level)` function with progressive curve: `500 * 1.2^(level-1)`
- [x] 3.3 Update `normalizePlayerProgress()` to use `getXpForLevel()` instead of constant
- [x] 3.4 Reduce base XP reward from 10 to 5 in all game files
- [x] 3.5 Add combo multiplier of 1.5x to XP calculations in all games
- [x] 3.6 Update menu HUD to show `playerEXP / getXpForLevel(playerLevel)` format
- [x] 3.7 Add level-up toast notification in `normalizePlayerProgress()`

## 4. Response Time Tracking

- [x] 4.1 Add `avgResponseTime` and `slowCorrectCount` fields to question stats initialization
- [x] 4.2 Add `SLOW_RESPONSE_THRESHOLD = 8000` constant
- [x] 4.3 Add `questionStartTime` global variable and set it on question render in quiz/listen/flash/match
- [x] 4.4 Update `updateQuestionStats()` to accept responseTime parameter and update running averages
- [x] 4.5 Add `slowResponse` weight to priority settings (default: 3) in global and per-game weights
- [x] 4.6 Update `getPriorityScore()` to include slowCorrectCount bonus in calculation
- [x] 4.7 Add "Slow Response" slider to priority panel in settings UI
- [x] 4.8 Pass response time from quiz/listen/flash/match answer handlers to `updateQuestionStats()`

## 5. Shuffle Answer Options

- [x] 5.1 Add `settings.shuffleAnswers = true` to default settings object
- [x] 5.2 Create `shuffleAnswerOptions(question)` utility function that shuffles `q.a` and recalculates correct index
- [x] 5.3 Add shuffle toggle to settings UI in "Game 1 + 5" section
- [x] 5.4 Update `renderQuiz()` to use shuffled options when setting is enabled
- [x] 5.5 Update `renderListen()` to use shuffled options when setting is enabled
- [x] 5.6 Verify correct answer validation works with shuffled options in both games

## 6. Typing Game Comparison Mode

- [x] 6.1 Add `settings.typeCompareMode = 'romaji'` to default settings
- [x] 6.2 Add comparison mode dropdown to settings UI in "Game 3 - Falling Words" section
- [x] 6.3 Add warning banner HTML that shows when 'word' mode is selected
- [x] 6.4 Update `updateSettingsFromUI()` to read typeCompareMode value
- [x] 6.5 Create `getTypeTarget(word)` function in game-type.js that returns correct comparison target
- [x] 6.6 Update `onTypeInput()` to use different comparison logic based on mode
- [x] 6.7 Update `drawWord()` to show appropriate hint text based on comparison mode
- [ ] 6.8 Test both romaji and word modes in falling words game

## 7. Writing Practice Game

- [x] 7.1 Create `game-write.js` with game state variables (writeDeck, writeIdx, writeHP, writeScore, writeCombo)
- [x] 7.2 Create `screen-write` HTML section in index.html with HUD, input area, and feedback display
- [x] 7.3 Implement `startWrite()` function with deck generation via getPrioritizedDeck(questions, 'write')
- [x] 7.4 Implement `renderWrite()` showing translation/romaji hints and input field
- [x] 7.5 Implement `checkWriteAnswer()` comparing input against word property via wanakana
- [x] 7.6 Implement `nextWrite()` and `writeComplete()` functions
- [x] 7.7 Add writing game button to main menu in index.html
- [x] 7.8 Add 'write' game type to `startGame()` router in main.js
- [x] 7.9 Add 'write' to game type arrays in stats computation and priority settings
- [x] 7.10 Add CSS styles for writing game screen and input area
- [x] 7.11 Add `game-write.js` to script load order in index.html

## 8. Inline Writing Practice Modal

- [x] 8.1 Create `write-practice-modal` HTML in index.html with overlay, input, hints, and close button
- [x] 8.2 Add CSS styles for the writing practice modal overlay and content
- [x] 8.3 Create `showWritePracticeModal(question)` function to display modal with current question data
- [x] 8.4 Create `checkWritePracticeAnswer()` function for modal input validation
- [x] 8.5 Add "Practice Writing" button to quiz explanation area after wrong answer
- [x] 8.6 Add "Practice Writing" button to listen explanation area after wrong answer
- [x] 8.7 Wire up modal close on backdrop click and close button
- [ ] 8.8 Test modal opens, validates input, and closes correctly from both quiz and listen

## 9. Completion Messaging

- [x] 9.1 Update `gameOver()` to accept `completed` boolean parameter
- [x] 9.2 Update modal title element to show "COMPLETE!" when completed=true, "GAME OVER" when false
- [x] 9.3 Update `quizComplete()` to pass `completed=true` to `gameOver()`
- [x] 9.4 Update `listenComplete()` to pass `completed=true` to `gameOver()`
- [x] 9.5 Update match game completion to pass `completed=true` to `gameOver()`
- [x] 9.6 Update `flashComplete()` to pass `completed=true` to `gameOver()`
- [x] 9.7 Update `gameOverTyping()` to pass `completed=true` to `gameOver()`
- [x] 9.8 Update HP-based game over calls to pass `completed=false`
- [x] 9.9 Verify toast messages say "Complete" not "Game Over" for completed games

## 10. Session History Fix

- [x] 10.1 Update `gameOver()` to only record session when `completed=true` parameter is passed
- [x] 10.2 Verify all completion paths pass `completed=true` (from task group 9)
- [x] 10.3 Verify HP depletion paths pass `completed=false`
- [ ] 10.4 Test that exiting game early does not create session history entry
- [ ] 10.5 Test that completing all questions creates session history entry

## 11. Match Game Difficulty

- [x] 11.1 Add `settings.matchPairCount = 6` to default settings object
- [x] 11.2 Add pair count dropdown to settings UI in "Game 4 - Match" section (4, 6, 8, 10, 12 options)
- [x] 11.3 Update `updateSettingsFromUI()` to read matchPairCount value
- [x] 11.4 Update `startMatch()` to use `settings.matchPairCount` instead of hardcoded 6
- [ ] 11.5 Test match game with different pair counts

## 12. Daily Streak Tracking

- [x] 12.1 Add `dailyStreak` object to global state with currentStreak, lastPlayDate, longestStreak, playDates
- [x] 12.2 Create `loadDailyStreak()` and `saveDailyStreak()` functions
- [x] 12.3 Create `getTodayDate()` helper returning 'YYYY-MM-DD' format string
- [x] 12.4 Add `gameStartTime` global set on `startGame()` call
- [x] 12.5 Update `exitGame()` and game completion functions to record elapsed time in playDates
- [x] 12.6 Create `updateDailyStreak()` function with streak calculation logic (5min threshold)
- [x] 12.7 Create `checkDailyStreak()` function called on app initialization
- [x] 12.8 Add streak display to menu UI HTML with `menu-streak` element
- [x] 12.9 Update `updateMenuUI()` to display current streak value
- [ ] 12.10 Test streak increments correctly across days and resets after gap

## 13. Final Integration & Testing

- [ ] 13.1 Open index.html in browser and verify all screens load without errors
- [ ] 13.2 Test all 6 games (quiz, listen, flash, match, type, write) launch and function
- [ ] 13.3 Test settings toggles persist across page reload
- [ ] 13.4 Test shuffle answers setting works in quiz and listen
- [ ] 13.5 Test typing game comparison modes
- [ ] 13.6 Test writing practice modal appears after wrong answers
- [ ] 13.7 Test level progression with new XP curve
- [ ] 13.8 Test daily streak tracking
- [ ] 13.9 Test session history only records completed games
- [ ] 13.10 Test match game with different pair counts
- [ ] 13.11 Verify no console errors in browser developer tools
- [ ] 13.12 Verify localStorage data is backward compatible (load existing save)
