## ADDED Requirements

### Requirement: Configurable match pair count
The match game SHALL allow users to configure the number of pairs from 4 to 12.

#### Scenario: Custom pair count used
- **WHEN** match game starts with settings.matchPairCount set
- **THEN** the game uses that many pairs (capped by available questions)

#### Scenario: Default pair count
- **WHEN** settings are initialized
- **THEN** matchPairCount defaults to 6

#### Scenario: Insufficient questions
- **WHEN** available questions are fewer than the configured pair count
- **THEN** pair count is capped at the number of available questions

### Requirement: Match pair count setting UI
The settings screen SHALL provide a dropdown to select match game pair count.

#### Scenario: Pair count options
- **WHEN** user views match settings
- **THEN** options for 4, 6, 8, 10, and 12 pairs are available with difficulty labels
