## ADDED Requirements

### Requirement: Daily play tracking
The system SHALL track daily gameplay time and record which days the user played.

#### Scenario: Game session recorded
- **WHEN** a game session ends
- **THEN** elapsed time is added to today's play record in dailyStreak.playDates

#### Scenario: Multiple games per day
- **WHEN** user plays multiple games on the same day
- **THEN** play times are accumulated for that date

### Requirement: Streak calculation
The system SHALL calculate consecutive days of play where each day has at least 5 minutes of gameplay.

#### Scenario: Streak continues
- **WHEN** last play date was yesterday and today reaches 5 minutes
- **THEN** currentStreak increments by 1

#### Scenario: Streak resets
- **WHEN** last play date was more than 1 day ago
- **THEN** currentStreak resets to 1 (starting new streak)

#### Scenario: Same day play
- **WHEN** user already played today
- **THEN** streak value does not change

### Requirement: Streak display
The system SHALL display the current daily streak in the main menu.

#### Scenario: Streak shown in menu
- **WHEN** user views the main menu
- **THEN** a "X day streak" indicator is visible with fire emoji

#### Scenario: Zero streak
- **WHEN** user has never played or streak was reset
- **THEN** streak displays as "0 day streak"

### Requirement: Streak persistence
Daily streak data SHALL persist across browser sessions via localStorage.

#### Scenario: Streak loads on startup
- **WHEN** app initializes
- **THEN** dailyStreak data is loaded from localStorage key 'jq_daily_streak'
