## ADDED Requirements

### Requirement: Session recording condition
The system SHALL only record session history entries when a game is completed (all questions answered), not when the player exits early or runs out of HP.

#### Scenario: Completed game recorded
- **WHEN** player answers all questions in a game
- **THEN** a session entry is added to sessionHistory

#### Scenario: HP depletion not recorded
- **WHEN** player HP reaches zero before completing all questions
- **THEN** no session entry is added to sessionHistory

#### Scenario: Early exit not recorded
- **WHEN** player exits a game via the back button
- **THEN** no session entry is added to sessionHistory

### Requirement: GameOver completed parameter
The gameOver function SHALL accept a boolean parameter indicating whether the game was completed.

#### Scenario: Completed flag true
- **WHEN** gameOver is called with completed=true
- **THEN** session history is recorded

#### Scenario: Completed flag false or omitted
- **WHEN** gameOver is called with completed=false or no completed parameter
- **THEN** session history is NOT recorded
