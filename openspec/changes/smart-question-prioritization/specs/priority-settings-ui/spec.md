## ADDED Requirements

### Requirement: Global priority settings in Settings screen
The system SHALL provide global priority settings in the Settings screen that control weighting factors for all games.

#### Scenario: Toggle prioritization on/off
- **WHEN** user toggles "Priority Algorithm" switch in Settings
- **THEN** the system SHALL enable/disable smart prioritization for all games

#### Scenario: Adjust incorrect weight slider
- **WHEN** user adjusts "Incorrect Weight" slider from 0 to 10
- **THEN** the system SHALL update settings.priority.global.incorrect to the selected value

#### Scenario: Adjust time since seen weight slider
- **WHEN** user adjusts "Time Weight" slider from 0 to 10
- **THEN** the system SHALL update settings.priority.global.timeSinceSeen to the selected value

#### Scenario: Adjust learning effect weight slider
- **WHEN** user adjusts "Learning Weight" slider from 0 to 10
- **THEN** the system SHALL update settings.priority.global.learning to the selected value

### Requirement: Per-game priority settings
The system SHALL provide per-game settings that allow overriding global weights for each game type.

#### Scenario: Access per-game settings
- **WHEN** user clicks settings icon/button within a game
- **THEN** the system SHALL show a modal/panel with game-specific priority settings

#### Scenario: Override weights for specific game
- **WHEN** user enables per-game override and adjusts weights
- **THEN** the system SHALL save to settings.priority.perGame[gameType] and use those weights instead of global

#### Scenario: Reset per-game to global defaults
- **WHEN** user clicks "Use Global" button in per-game settings
- **THEN** the system SHALL clear per-game override and revert to using global weights
