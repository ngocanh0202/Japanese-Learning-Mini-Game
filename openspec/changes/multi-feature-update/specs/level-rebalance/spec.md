## ADDED Requirements

### Requirement: Progressive XP curve
The leveling system SHALL use a progressive XP requirement that increases with each level.

#### Scenario: Level 1 XP requirement
- **WHEN** player is at level 1
- **THEN** 500 XP is required to reach level 2

#### Scenario: Higher level XP requirement
- **WHEN** player is at level N (N > 1)
- **THEN** XP required is floor(500 * 1.2^(N-1))

### Requirement: Reduced base XP reward
The base XP reward per correct answer SHALL be reduced from 10 to 5.

#### Scenario: Base correct answer
- **WHEN** user answers correctly with combo of 0
- **THEN** 5 XP is awarded

#### Scenario: Combo bonus
- **WHEN** user answers correctly with combo N
- **THEN** XP awarded is 5 * max(1, N) * 1.5

### Requirement: Level up notification
The system SHALL display a notification when the player levels up.

#### Scenario: Level up occurs
- **WHEN** player EXP meets or exceeds the requirement for current level
- **THEN** playerLevel increments, EXP wraps, and a toast notification shows the new level
