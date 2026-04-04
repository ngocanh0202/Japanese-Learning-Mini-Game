## ADDED Requirements

### Requirement: Hash-based question ID generation
The system SHALL generate deterministic unique IDs for each question based on its content, using a hash function. The ID format MUST be `q-{hash}` where `{hash}` is a base36-encoded positive integer derived from the question's `word`, `q`, `romaji`, and `translation` fields.

#### Scenario: Same question produces same ID
- **WHEN** the same question content is hashed twice
- **THEN** the generated ID MUST be identical both times

#### Scenario: Different questions produce different IDs
- **WHEN** two questions with different content are hashed
- **THEN** the generated IDs MUST be different (barring hash collision)

#### Scenario: Translation field is optional
- **WHEN** a question has no `translation` field (undefined or null)
- **THEN** the hash function SHALL treat it as an empty string and still produce a valid ID

### Requirement: Priority scoring uses hash-based IDs
The `getPriorityScore()` function SHALL use the hash-based question ID to look up stats from `questionStats`, instead of using the array index.

#### Scenario: Score lookup with valid stats
- **WHEN** `getPriorityScore(questionIndex, gameType, weights)` is called for a question with existing stats
- **THEN** the system SHALL compute the hash ID from the question at `questions[questionIndex]` and retrieve stats using that ID

#### Scenario: Score lookup with no stats
- **WHEN** `getPriorityScore()` is called for a question with no stats entry
- **THEN** the system SHALL return a score based on default values (effectiveIncorrect=0, correctStreak=0, slowCorrectCount=0, lastSeen=null)

### Requirement: Stats update uses hash-based IDs
The `updateQuestionStats()` function SHALL store and update stats using the hash-based question ID derived from the question content at the given index.

#### Scenario: Recording a correct answer
- **WHEN** `updateQuestionStats(questionIndex, gameType, true, responseTime)` is called
- **THEN** the system SHALL compute the hash ID, increment correctStreak and correctCount, update avgResponseTime, and save to localStorage

#### Scenario: Recording a wrong answer
- **WHEN** `updateQuestionStats(questionIndex, gameType, false, responseTime)` is called
- **THEN** the system SHALL compute the hash ID, increment incorrect, reset correctStreak to 0, add timestamp to incorrectHistory, and save to localStorage

#### Scenario: Slow correct answer tracking
- **WHEN** a correct answer has responseTime >= 8000ms
- **THEN** slowCorrectCount SHALL be incremented for that question's stats

### Requirement: Stats cleanup uses hash-based IDs
When a question is deleted, the system SHALL delete only the stats entry for that specific question using its hash-based ID, without shifting or reindexing other stats.

#### Scenario: Deleting a question removes only its stats
- **WHEN** a question at index N is deleted
- **THEN** only the stats entry with the hash ID of that question SHALL be removed; all other stats entries remain unchanged

### Requirement: Game deck mapping uses questionId
All game modes (quiz, listen, flash, match, type, write) SHALL store `questionId` (hash-based) in their deck objects instead of `originalIndex` when tracking which question was answered.

#### Scenario: Quiz game tracks answers by questionId
- **WHEN** the quiz game creates its deck and records an answer
- **THEN** it SHALL use `questionId` to call `updateQuestionStats()` instead of `originalIndex`

### Requirement: Stats initialization uses hash-based IDs
The `initQuestionStats()` function SHALL initialize stats entries using hash-based IDs for all questions in the provided array.

#### Scenario: Initializing stats for new questions
- **WHEN** `initQuestionStats(questions)` is called with a new question array
- **THEN** each question SHALL receive a stats entry keyed by its hash-based ID with default values for all game types

### Requirement: Collision detection
The system SHALL detect and handle hash collisions when generating question IDs. If two different questions produce the same hash, the system SHALL append a numeric suffix to differentiate them.

#### Scenario: Hash collision detected
- **WHEN** two different questions in the same set produce the same hash value
- **THEN** the second question's ID SHALL be `{hash}-1`, the third `{hash}-2`, etc.
