## ADDED Requirements

### Requirement: Incorrect answer history tracking
The system SHALL store an `incorrectHistory` array of ISO 8601 timestamp strings for each question per game type, recording every incorrect answer event.

#### Scenario: First incorrect answer
- **WHEN** a user answers a question incorrectly for the first time
- **THEN** the system SHALL add the current ISO timestamp to `incorrectHistory` for that question and game type

#### Scenario: Subsequent incorrect answers
- **WHEN** a user answers a question incorrectly again
- **THEN** the system SHALL append another timestamp to `incorrectHistory`

#### Scenario: Backward compatibility for existing data
- **WHEN** a question has `incorrect > 0` but no `incorrectHistory` field
- **THEN** the system SHALL initialize `incorrectHistory` as an empty array and seed it with one entry at the `lastSeen` timestamp if available

### Requirement: Exponential decay calculation
The system SHALL calculate `effectiveIncorrect` using the formula: `Σ(0.85^daysSinceEachIncorrect)` for all entries in `incorrectHistory`, capped at 30 days maximum age.

#### Scenario: Recent incorrect answer
- **WHEN** an incorrect answer was recorded today (0 days ago)
- **THEN** its contribution to `effectiveIncorrect` SHALL be 1.0 (0.85^0)

#### Scenario: Week-old incorrect answer
- **WHEN** an incorrect answer was recorded 7 days ago
- **THEN** its contribution to `effectiveIncorrect` SHALL be approximately 0.32 (0.85^7)

#### Scenario: Month-old incorrect answer
- **WHEN** an incorrect answer was recorded 30+ days ago
- **THEN** its contribution to `effectiveIncorrect` SHALL be excluded from the calculation

#### Scenario: Multiple incorrect answers at different times
- **WHEN** a question has incorrect answers at 1 day ago, 5 days ago, and 20 days ago
- **THEN** `effectiveIncorrect` SHALL equal 0.85^1 + 0.85^5 + 0.85^20

### Requirement: Priority score uses effectiveIncorrect
The `getPriorityScore()` function SHALL use `effectiveIncorrect` instead of the raw `incorrect` count when calculating priority scores.

#### Scenario: Priority score with decayed incorrect
- **WHEN** calculating priority score for a question with 5 incorrect answers all from 14+ days ago
- **THEN** the incorrect component SHALL contribute significantly less than 5 × weight.incorrect

#### Scenario: Priority score with recent incorrect
- **WHEN** calculating priority score for a question with 5 incorrect answers all from today
- **THEN** the incorrect component SHALL equal 5 × weight.incorrect

### Requirement: Incorrect reduction on correct streaks
The system SHALL reduce the `incorrect` count by 1 (minimum 0) for every 3 consecutive correct answers, and remove the oldest entry from `incorrectHistory`.

#### Scenario: Streak reaches multiple of 3
- **WHEN** a user answers a question correctly and `correctStreak` becomes a multiple of 3
- **THEN** `incorrect` SHALL decrease by 1 (minimum 0) and the oldest timestamp SHALL be removed from `incorrectHistory`

#### Scenario: Streak not at multiple of 3
- **WHEN** a user answers a question correctly and `correctStreak` is not a multiple of 3
- **THEN** `incorrect` SHALL remain unchanged

#### Scenario: Incorrect already at zero
- **WHEN** `incorrect` is 0 and correct streak reaches a multiple of 3
- **THEN** `incorrect` SHALL remain 0 and no history entry SHALL be removed

### Requirement: History cleanup on update
The system SHALL remove entries from `incorrectHistory` that are older than 30 days on every `updateQuestionStats()` call.

#### Scenario: Old entries exist
- **WHEN** `updateQuestionStats()` is called and `incorrectHistory` contains entries older than 30 days
- **THEN** those entries SHALL be removed before any other calculations

#### Scenario: No old entries
- **WHEN** all entries in `incorrectHistory` are within 30 days
- **THEN** no entries SHALL be removed
