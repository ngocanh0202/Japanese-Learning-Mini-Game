## 1. Fix totalWeight recalculation in getPrioritizedDeck

- [x] 1.1 Rename `totalWeight` to `currentTotalWeight` on line 107 of `js/game-utils.js` to clarify it is a mutable running total
- [x] 1.2 After `result.push(questionsArr[selectedIdx])` and before `tempIndices.splice(...)`, subtract the selected item's weight from `currentTotalWeight`: `currentTotalWeight -= (Math.max(0, scored.find(s => s.index === selectedIdx).score) + 1);`
- [x] 1.3 Update line 113 to use `currentTotalWeight` instead of `totalWeight` in the `Math.random()` calculation

## 2. Verify correctness

- [x] 2.1 Open `index.html` in browser and play each game mode (Quiz, Flashcard, Listen, Match, Type, Write) to confirm no runtime errors
- [x] 2.2 Verify that high-priority questions (recent incorrect answers, long time since seen) appear earlier in the deck across multiple game sessions
