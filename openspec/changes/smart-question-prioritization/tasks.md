## 1. Core Data Structure

- [x] 1.1 Add questionStats to main.js (global variable, defaults to {})
- [x] 1.2 Add loadQuestionStats() function to load from localStorage jq_question_stats
- [x] 1.3 Add saveQuestionStats() function to save to localStorage
- [x] 1.4 Add initQuestionStats(questions) to initialize stats for new questions
- [x] 1.5 Add questionStats to saveToStorage() and loadFromStorage()

## 2. Priority Algorithm

- [x] 2.1 Add priority constants: MAX_DAYS=30, MAX_TIME_BONUS=50
- [x] 2.2 Add getPriorityScore(question, gameType, weights) function
- [x] 2.3 Add getWeights(gameType) to get effective weights (global or per-game)
- [x] 2.4 Add getPrioritizedDeck(questions, gameType) function using weighted shuffle
- [x] 2.5 Add updateQuestionStats(questionIndex, gameType, isCorrect) function

## 3. Settings Integration

- [x] 3.1 Add default priority settings to settings object in main.js
- [x] 3.2 Add priority settings UI section in index.html (within screen-settings)
- [x] 3.3 Add renderPrioritySettings() function to render settings UI
- [x] 3.4 Add event handlers for priority settings sliders/toggles

## 4. Game Integration

- [x] 4.1 Update game-quiz.js: use getPrioritizedDeck() instead of shuffle()
- [x] 4.2 Update game-listen.js: use getPrioritizedDeck() instead of shuffle()
- [x] 4.3 Update game-flash.js: use getPrioritizedDeck() instead of shuffle()
- [x] 4.4 Update game-match.js: use getPrioritizedDeck() instead of shuffle()
- [x] 4.5 Update game-type.js: use getPrioritizedDeck() instead of shuffle()
- [ ] 4.6 Add per-game settings button/modal to each game

## 5. Stats Cleanup

- [x] 5.1 Add cleanupQuestionStats(deletedIndex) function when question is deleted
- [x] 5.2 Hook into existing question deletion logic in main.js
