## ADDED Requirements

### Requirement: Completion vs failure distinction
The game over modal SHALL display different titles based on whether the game was completed or ended due to HP depletion.

#### Scenario: All questions answered
- **WHEN** player answers all questions in the deck
- **THEN** the modal title displays "COMPLETE!" with celebration emoji

#### Scenario: HP depleted
- **WHEN** player HP reaches zero before completing all questions
- **THEN** the modal title displays "GAME OVER"

### Requirement: Completion toast message
The system SHALL show a "Complete" toast message when all questions are answered, not "Game Over".

#### Scenario: Quiz completion
- **WHEN** quizIdx exceeds quizDeck.length
- **THEN** toast shows "Complete! Score: X" message

#### Scenario: Listen completion
- **WHEN** listenIdx exceeds listenDeck.length
- **THEN** toast shows "Complete! Score: X" message

#### Scenario: Match completion
- **WHEN** all pairs are found in match game
- **THEN** toast shows completion message
