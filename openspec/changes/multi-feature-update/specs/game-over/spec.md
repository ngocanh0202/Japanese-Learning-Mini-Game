## MODIFIED Requirements

### Requirement: Game over modal title
The game over modal SHALL display context-appropriate titles based on how the game ended.

#### Scenario: Completed all questions
- **WHEN** the game ends because all questions were answered
- **THEN** the modal title shows "COMPLETE!" instead of "GAME OVER"

#### Scenario: HP depleted
- **WHEN** the game ends because player HP reached zero
- **THEN** the modal title shows "GAME OVER"
