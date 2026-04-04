## 1. Data Structure Updates

- [x] 1.1 Add `incorrectHistory: []` field to `initQuestionStats()` in `js/storage.js:162`
- [x] 1.2 Add backward-compatibility seeding logic: if `incorrect > 0` but `incorrectHistory` is empty, seed with `lastSeen` timestamp

## 2. Core Decay Algorithm

- [x] 2.1 Add `DECAY_RATE = 0.85` and `MAX_HISTORY_DAYS = 30` constants in `js/game-utils.js`
- [x] 2.2 Implement `getEffectiveIncorrect(stats)` function: calculate `Σ(0.85^daysSinceEachIncorrect)` from `incorrectHistory`, filter entries >30 days
- [x] 2.3 Implement `cleanIncorrectHistory(history)` function: remove entries older than 30 days
- [x] 2.4 Update `getPriorityScore()` to use `getEffectiveIncorrect()` instead of raw `incorrect`

## 3. Correct Streak Incorrect Reduction

- [x] 3.1 Add logic in `updateQuestionStats()`: when `isCorrect === true` and `correctStreak % 3 === 0`, reduce `incorrect` by 1 (min 0) and remove oldest `incorrectHistory` entry
- [x] 3.2 Add history cleanup call in `updateQuestionStats()`: run `cleanIncorrectHistory()` on every update

## 4. Confidence Scoring

- [x] 4.1 Implement `getConfidenceLevel(correctStreak, effectiveIncorrect)` function returning `"new" | "learning" | "familiar" | "mastered"`
- [x] 4.2 Add `confidence` field to `questionStats` or compute on-demand

## 5. Stats Screen Update

- [x] 5.1 Update `renderStatsScreen()` mastery calculation in `js/main.js` to use `getConfidenceLevel()` instead of raw `incorrect` threshold
- [x] 5.2 Verify mastery categories (Mastered/Learning/New) display correctly with new logic

## 6. Manual Testing

- [x] 6.1 Test new question: priority score with no history
- [x] 6.2 Test recent incorrect: high priority score for today's mistakes
- [x] 6.3 Test old incorrect: decayed priority for 14+ day old mistakes
- [x] 6.4 Test correct streak reduction: incorrect count decreases after 3 correct in a row
- [x] 6.5 Test confidence levels: all 4 categories display correctly in stats screen
- [x] 6.6 Test backward compatibility: existing localStorage data works without errors
- [x] 6.7 Test all 6 game modes: quiz, listen, flash, match, type, write
