## ADDED Requirements

### Requirement: Session history storage
The system SHALL store each game session's information including game type, score, correct/wrong counts, and timestamp in localStorage.

#### Scenario: Save session on game over
- **WHEN** a game ends and gameOver() is called
- **THEN** a new session object SHALL be created with type, score, correct, wrong, and timestamp
- **AND** the session SHALL be saved to localStorage
- **AND** if there are more than 20 sessions, the oldest session SHALL be removed

#### Scenario: Load session history on app start
- **WHEN** the app loads and localStorage contains session history
- **THEN** the sessionHistory array SHALL be restored from localStorage

#### Scenario: Empty session history
- **WHEN** there is no session history in localStorage
- **THEN** sessionHistory SHALL be initialized as an empty array

### Requirement: Session history display in stats screen
The system SHALL display the list of recent game sessions in the stats screen's Session History section.

#### Scenario: Render sessions in stats screen
- **WHEN** the user navigates to screen-stats
- **THEN** renderStatsScreen() SHALL read sessionHistory from localStorage
- **AND** SHALL display each session with game type icon, score, accuracy, and formatted date
- **AND** if sessionHistory is empty, display "No sessions recorded yet."

#### Scenario: Session list sorted by most recent
- **WHEN** sessions are displayed in stats screen
- **THEN** sessions SHALL be sorted in descending order by timestamp (newest first)

### Requirement: Session data structure
Each session object SHALL contain the following fields: id, type, score, correct, wrong, timestamp.

#### Scenario: Valid session object
- **WHEN** a session is created
- **THEN** it SHALL have:
  - id: unique string (generated from Date.now() + random)
  - type: one of 'quiz', 'listen', 'flash', 'match', 'type'
  - score: number (EXP earned)
  - correct: number (correct answers count)
  - wrong: number (wrong answers count)
  - timestamp: ISO date string