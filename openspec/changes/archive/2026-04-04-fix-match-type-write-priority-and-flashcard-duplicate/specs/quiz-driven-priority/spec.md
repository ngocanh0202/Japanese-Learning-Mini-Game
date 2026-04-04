## ADDED Requirements

### Requirement: Match game uses Quiz stats for priority selection
The Match game SHALL call `getPrioritizedDeck(questions, 'quiz')` instead of `getPrioritizedDeck(questions, 'match')` to ensure question selection is driven by Quiz performance statistics.

#### Scenario: Match game starts with quiz-prioritized deck
- **WHEN** the user starts the Match game
- **THEN** the deck is ordered using Quiz stats via `getPrioritizedDeck(questions, 'quiz')`

#### Scenario: Match game does not track its own question stats
- **WHEN** the user correctly or incorrectly matches a pair
- **THEN** no `updateQuestionStats` call is made for the 'match' game type

### Requirement: Type game uses Quiz stats for priority selection
The Type game SHALL call `getPrioritizedDeck(questions, 'quiz')` instead of `getPrioritizedDeck(questions, 'type')` to ensure question selection is driven by Quiz performance statistics.

#### Scenario: Type game starts with quiz-prioritized deck
- **WHEN** the user starts the Type game
- **THEN** the deck is ordered using Quiz stats via `getPrioritizedDeck(questions, 'quiz')`

#### Scenario: Type game does not track its own question stats
- **WHEN** a word falls off screen or the user types it correctly
- **THEN** no `updateQuestionStats` call is made for the 'type' game type

#### Scenario: Type game re-fetches deck with quiz stats
- **WHEN** the type deck runs empty during gameplay and `spawnWord()` re-fetches
- **THEN** the new deck is also ordered using Quiz stats via `getPrioritizedDeck(questions, 'quiz')`

### Requirement: Flashcard mastered case records stats exactly once
The Flashcard game's 'mastered' case SHALL call `updateQuestionStats` exactly once per card review, not twice.

#### Scenario: Mastered card records stats once
- **WHEN** the user marks a flashcard as 'mastered'
- **THEN** `updateQuestionStats` is called exactly one time with `isCorrect: true`
