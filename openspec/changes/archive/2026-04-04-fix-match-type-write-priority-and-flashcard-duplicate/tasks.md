## 1. Match game — switch to quiz priority and remove stat tracking

- [x] 1.1 Change `getPrioritizedDeck(questions, 'match')` to `getPrioritizedDeck(questions, 'quiz')` in `startMatch()` (line 79 of game-match.js)
- [x] 1.2 Remove `updateQuestionStats(first.questionId, 'match', true)` from correct match handler (line 121 of game-match.js)
- [x] 1.3 Remove `updateQuestionStats(first.questionId, 'match', false)` from wrong match handler (line 142 of game-match.js)

## 2. Type game — switch to quiz priority and remove stat tracking

- [x] 2.1 Change `getPrioritizedDeck(questions, 'type')` to `getPrioritizedDeck(questions, 'quiz')` in `startTyping()` (line 33 of game-type.js)
- [x] 2.2 Change `getPrioritizedDeck(questions, 'type')` to `getPrioritizedDeck(questions, 'quiz')` in `spawnWord()` (line 68 of game-type.js)
- [x] 2.3 Remove `updateQuestionStats(questionId, 'type', false)` from word-falls-off handler (line 146 of game-type.js)
- [x] 2.4 Remove `updateQuestionStats(questionId, 'type', true)` from correct-typing handler (line 243 of game-type.js)

## 3. Flashcard game — remove duplicate stat call

- [x] 3.1 Remove duplicate `updateQuestionStats(q.questionId, 'flash', true, responseTime)` on line 72 of game-flash.js (keep only line 71)

## 4. Verify correctness

- [x] 4.1 Open `index.html` in browser and play Match, Type, and Flashcard games to confirm no runtime errors
- [x] 4.2 Verify that Match and Type games still select questions correctly (no crashes, deck populates)
- [x] 4.3 Verify that Flashcard 'mastered' no longer double-counts stats
