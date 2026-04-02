## ADDED Requirements

### Requirement: Shuffle answer options setting
The system SHALL provide a setting to randomize the order of answer options in quiz and listen games.

#### Scenario: Shuffle enabled
- **WHEN** settings.shuffleAnswers is true
- **THEN** answer options are randomized before rendering in quiz and listen games

#### Scenario: Shuffle disabled
- **WHEN** settings.shuffleAnswers is false
- **THEN** answer options appear in their original order

#### Scenario: Default state
- **WHEN** settings are initialized for the first time
- **THEN** shuffleAnswers defaults to true

### Requirement: Correct index recalculation
When shuffling answer options, the system SHALL correctly recalculate the correct answer index.

#### Scenario: Index tracked after shuffle
- **WHEN** options array is shuffled
- **THEN** the correct answer index is updated to point to the same answer in the new position

#### Scenario: Original question not mutated
- **WHEN** shuffling occurs
- **THEN** the original question object's 'a' and 'c' properties remain unchanged
