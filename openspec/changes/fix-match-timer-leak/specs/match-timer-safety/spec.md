## ADDED Requirements

### Requirement: Match timer stops when game is inactive
The match game timer SHALL automatically stop when `matchActive` flag is set to `false`.

#### Scenario: Player exits game via menu
- **WHEN** player navigates away from match game screen (setting `matchActive = false`)
- **THEN** timer stops at the next tick and no further countdown occurs

#### Scenario: Game completes normally
- **WHEN** player matches all pairs and `matchActive` is set to `false`
- **THEN** timer has already stopped and no callback fires

### Requirement: No side effects when timer stops
The timer callback SHALL NOT trigger game over or toast notifications when `matchActive` is `false`.

#### Scenario: Timer tick after player leaves
- **WHEN** timer fires a tick with `matchActive = false`
- **THEN** callback returns early without calling `endMatchByTime()`