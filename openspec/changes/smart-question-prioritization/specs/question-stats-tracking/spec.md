## ADDED Requirements

### Requirement: Initialize question stats structure
The system SHALL initialize and maintain questionStats structure in localStorage when questions are loaded.

#### Scenario: Initialize stats for new questions
- **WHEN** questions are loaded and no questionStats exists in localStorage
- **THEN** the system SHALL create questionStats with gameStats for each question, initialized to { incorrect: 0, lastSeen: null, correctStreak: 0 }

#### Scenario: Migrate stats for new questions added
- **WHEN** new questions are imported but questionStats already exists
- **THEN** the system SHALL add gameStats entries for new questions without losing existing stats

### Requirement: Persist question stats to localStorage
The system SHALL save questionStats to localStorage after each answer and on app load.

#### Scenario: Save stats after answer
- **WHEN** user answers a question in any game
- **THEN** the system SHALL immediately save updated questionStats to localStorage

#### Scenario: Load stats on app start
- **WHEN** app loads and questionStats exists in localStorage
- **THEN** the system SHALL restore questionStats and merge with current questions

### Requirement: Clean up stats for deleted questions
The system SHALL remove stats entries when questions are deleted.

#### Scenario: Remove stats when question deleted
- **WHEN** user deletes a question from the data screen
- **THEN** the system SHALL also remove its entry from questionStats
