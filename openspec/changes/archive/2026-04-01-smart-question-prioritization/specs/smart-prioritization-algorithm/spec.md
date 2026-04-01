## ADDED Requirements

### Requirement: Calculate priority score for each question
The system SHALL calculate a priority score for each question based on three factors: incorrect count, time since last seen, and correct streak (learning effect).

#### Scenario: Calculate priority for question with no history
- **WHEN** a question has no gameStats for a specific game
- **THEN** the system SHALL treat it as daysSinceLastSeen = MAX_DAYS and incorrect = 0, giving it high priority

#### Scenario: Calculate priority for frequently wrong question
- **WHEN** a question has incorrect = 5 for game "quiz"
- **THEN** the priority score SHALL increase proportionally with incorrect * W_INCORRECT

#### Scenario: Calculate priority for question not seen recently
- **WHEN** a question was last seen 10 days ago
- **THEN** the priority SHALL include timeBonus = min(10 * W_TIME, MAX_TIME_BONUS)

#### Scenario: Calculate priority reduces with learning effect
- **WHEN** a question has correctStreak = 3 (answered correctly 3 times in a row)
- **THEN** the priority SHALL decrease by correctStreak * W_LEARNING

### Requirement: Generate weighted prioritized deck
The system SHALL generate a deck of questions ordered by priority, where higher priority questions appear more frequently.

#### Scenario: Generate deck with prioritization enabled
- **WHEN** prioritization is enabled and weights are W_INCORRECT=5, W_TIME=3, W_LEARNING=2
- **AND** there are 10 questions with varying stats
- **THEN** the system SHALL return a shuffled deck where questions with higher priority score appear more often

#### Scenario: Generate deck with prioritization disabled
- **WHEN** prioritization is disabled (all weights = 0)
- **THEN** the system SHALL return a uniformly shuffled deck (equivalent to current shuffle())

### Requirement: Update question stats on answer
The system SHALL update question stats (incorrect count, correct streak, last seen timestamp) when user answers a question.

#### Scenario: Update stats on correct answer
- **WHEN** user answers correctly
- **THEN** the system SHALL increment correctStreak by 1 and update lastSeen to current timestamp

#### Scenario: Update stats on incorrect answer
- **WHEN** user answers incorrectly
- **THEN** the system SHALL increment incorrect by 1, reset correctStreak to 0, and update lastSeen to current timestamp
