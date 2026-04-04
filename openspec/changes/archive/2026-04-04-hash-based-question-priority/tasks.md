## 1. Core: Hash-based ID system (js/game-utils.js)

- [x] 1.1 Add `generateQuestionId(q)` function — DJB2-style hash from `word + q + romaji + translation`, return `q-{base36}`
- [x] 1.2 Add collision detection: track used hashes in `initQuestionStats()`, append `-1`, `-2` suffix on collision
- [x] 1.3 Update `getPriorityScore(questionIndex, gameType, weights)` — compute hash ID from `questionsArr[questionIndex]` instead of using `q-{index}` directly
- [x] 1.4 Update `updateQuestionStats(questionIndex, gameType, isCorrect, responseTime)` — compute hash ID from `questions[questionIndex]` before storing
- [x] 1.5 Update `initQuestionStats(questionsArr)` — generate hash IDs for all questions, handle collisions
- [x] 1.6 Simplify `cleanupQuestionStats(deletedIndex)` — compute hash ID for the deleted question, `delete questionStats[id]`, remove all shift/reindex logic
- [x] 1.7 Update `computeGameTypeStats()` — iterate questions and use hash IDs for stats lookup

## 2. Migration: Legacy stats conversion (js/storage.js)

- [x] 2.1 Add `detectLegacyStats()` — check if any key in `questionStats` matches `q-\d+` pattern
- [x] 2.2 Add `migrateStatsToHashBased()` — iterate legacy keys, map `q-{N}` → `q-{hash(questions[N])}`, discard out-of-bounds indices
- [x] 2.3 Update `loadQuestionStats()` — check `jq_stats_migrated` flag, if not set run detection + migration, set flag after success
- [x] 2.4 Add error handling: if migration fails, catch error, log warning, initialize empty stats, set migration flag

## 3. Game: Quiz (js/games/game-quiz.js)

- [x] 3.1 Update `startQuiz()` — replace `originalIndex: questions.indexOf(q)` with `questionId: generateQuestionId(q)`
- [x] 3.2 Update `answerQuiz()` — use `quizDeck[quizIdx].questionId` instead of `quizDeck[quizIdx].originalIndex` in `updateQuestionStats()` calls
- [x] 3.3 Update `handleQuizTimeout()` — use `quizDeck[quizIdx].questionId` in `updateQuestionStats()` call

## 4. Game: Listen (js/games/game-listen.js)

- [x] 4.1 Update `startListen()` — replace `originalIndex: questions.indexOf(q)` with `questionId: generateQuestionId(q)`
- [x] 4.2 Update `answerListen()` — use `listenDeck[listenIdx].questionId` instead of `.originalIndex` in `updateQuestionStats()` calls
- [x] 4.3 Update `handleListenTimeout()` — use `listenDeck[listenIdx].questionId` in `updateQuestionStats()` call

## 5. Game: Flashcard (js/games/game-flash.js)

- [x] 5.1 Update `startFlash()` — replace `originalIndex: questions.indexOf(q)` with `questionId: generateQuestionId(q)`
- [x] 5.2 Update `markCard()` — use `q.questionId` instead of `origIdx` in all `updateQuestionStats()` calls

## 6. Game: Match (js/games/game-match.js)

- [x] 6.1 Update `startMatch()` — replace `originalIndex: questions.indexOf(item)` with `questionId: generateQuestionId(item)` in both card types
- [x] 6.2 Update `handleMatchCard()` — use `first.questionId` instead of `first.originalIndex` in `updateQuestionStats()` calls

## 7. Game: Type (js/games/game-type.js)

- [x] 7.1 Update `startTyping()` — replace `originalIndex: questions.indexOf(q)` with `questionId: generateQuestionId(q)`
- [x] 7.2 Update `spawnWord()` — replace `originalIndex: questions.indexOf(q)` with `questionId: generateQuestionId(q)`
- [x] 7.3 Update `typeGameLoop()` — use `w.questionId` instead of `w.originalIndex` in `updateQuestionStats()` call
- [x] 7.4 Update `onTypeInput()` — use `target.questionId` instead of `target.originalIndex` in `updateQuestionStats()` call

## 8. Game: Write (js/games/game-write.js)

- [x] 8.1 Update `startWrite()` — replace `originalIndex: questions.indexOf(q)` with `questionId: generateQuestionId(q)` in `writeKanjiQueue` items
- [x] 8.2 Update `checkWriteAnswer()` — use `writeKanjiQueue[writeCurrentKanjiIdx].questionId` in `updateQuestionStats()` calls
- [x] 8.3 Update `skipWrite()` — use `writeKanjiQueue[writeCurrentKanjiIdx].questionId` in `updateQuestionStats()` call

## 9. Documentation (docs/priority-system.md)

- [x] 9.1 Create `docs/priority-system.md` with: overview, scoring formula, hash-based ID explanation, weighted random selection, key functions reference, known issues
- [x] 9.2 Include migration strategy explanation and constants reference table

## 10. Verification (manual browser testing required)

- [ ] 10.1 Open `index.html` in browser — verify app loads without errors
- [ ] 10.2 Verify migration runs: check `localStorage.jq_stats_migrated = "true"` after first load
- [ ] 10.3 Play each game mode (quiz, listen, flash, match, type, write) — verify no console errors
- [ ] 10.4 Delete a question from a set — verify only that question's stats are removed
- [ ] 10.5 Switch between question sets — verify priority works correctly for each set
- [ ] 10.6 Re-import a previously deleted question — verify its old stats are restored (same hash ID)
