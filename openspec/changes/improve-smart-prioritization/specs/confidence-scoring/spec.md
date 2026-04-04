## ADDED Requirements

### Requirement: Confidence level calculation
The system SHALL calculate a confidence score for each question using the formula: `confidence = correctStreak / (correctStreak + effectiveIncorrect + 1)`.

#### Scenario: No attempts yet
- **WHEN** a question has never been attempted (correctStreak = 0, effectiveIncorrect = 0)
- **THEN** confidence SHALL be 0 / (0 + 0 + 1) = 0.0

#### Scenario: Strong mastery
- **WHEN** a question has correctStreak = 7 and effectiveIncorrect = 0
- **THEN** confidence SHALL be 7 / (7 + 0 + 1) = 0.875

#### Scenario: Struggling learner
- **WHEN** a question has correctStreak = 1 and effectiveIncorrect = 5
- **THEN** confidence SHALL be 1 / (1 + 5 + 1) ≈ 0.143

#### Scenario: Mixed performance
- **WHEN** a question has correctStreak = 3 and effectiveIncorrect = 3
- **THEN** confidence SHALL be 3 / (3 + 3 + 1) ≈ 0.429

### Requirement: Confidence level classification
The system SHALL classify each question into one of four confidence levels based on the confidence score.

#### Scenario: New question
- **WHEN** confidence score is less than 0.1
- **THEN** the confidence level SHALL be classified as "new"

#### Scenario: Learning question
- **WHEN** confidence score is >= 0.1 and < 0.4
- **THEN** the confidence level SHALL be classified as "learning"

#### Scenario: Familiar question
- **WHEN** confidence score is >= 0.4 and < 0.7
- **THEN** the confidence level SHALL be classified as "familiar"

#### Scenario: Mastered question
- **WHEN** confidence score is >= 0.7
- **THEN** the confidence level SHALL be classified as "mastered"

### Requirement: Stats screen uses confidence for mastery display
The mastery calculation in the stats screen SHALL use the confidence level instead of the raw `incorrect` count to classify questions as mastered, learning, or new.

#### Scenario: Question classified as mastered
- **WHEN** a question has confidence level "mastered" across all game types with attempts
- **THEN** it SHALL be counted in the "Mastered" category

#### Scenario: Question classified as learning
- **WHEN** a question has confidence level "learning" or "familiar" in any game type with attempts
- **THEN** it SHALL be counted in the "Learning" category

#### Scenario: Question classified as new
- **WHEN** a question has no attempts in any game type
- **THEN** it SHALL be counted in the "New" category
