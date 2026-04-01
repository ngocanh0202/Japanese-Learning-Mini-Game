## ADDED Requirements

### Requirement: Question limit setting
The system SHALL provide a setting to limit the number of questions displayed per game session. The default limit SHALL be 20 questions. The setting SHALL include a toggle to enable/disable the limit and a numeric input to specify the maximum number of questions.

#### Scenario: Default state on first load
- **WHEN** the user opens settings for the first time
- **THEN** the question limit toggle SHALL be off (disabled) and the numeric input SHALL show 20

#### Scenario: Enable question limit
- **WHEN** the user toggles on the question limit setting
- **THEN** the numeric input SHALL become active and the limit SHALL apply to all subsequent game sessions

#### Scenario: Disable question limit
- **WHEN** the user toggles off the question limit setting
- **THEN** all questions in the pool SHALL be used in game sessions (no limit applied)

#### Scenario: Change question limit value
- **WHEN** the user enters a new number in the question limit input
- **THEN** the new value SHALL be saved and applied to subsequent game sessions

### Requirement: Question limit applies to all game modes
When the question limit is enabled, all game modes (quiz, listen, flash, match, type) SHALL restrict their question deck to the specified maximum number of questions. The limit SHALL be applied after deck prioritization/shuffling.

#### Scenario: Quiz mode with limit enabled
- **WHEN** the user starts quiz mode with question limit enabled (e.g., 20)
- **THEN** the quiz SHALL use at most 20 questions from the deck

#### Scenario: Listen mode with limit enabled
- **WHEN** the user starts listen mode with question limit enabled
- **THEN** the listen game SHALL use at most the specified number of questions

#### Scenario: Flash mode with limit enabled
- **WHEN** the user starts flash mode with question limit enabled
- **THEN** the flashcard deck SHALL contain at most the specified number of cards

#### Scenario: Match mode with limit enabled
- **WHEN** the user starts match mode with question limit enabled
- **THEN** the match pairs SHALL be generated from at most the specified number of questions

#### Scenario: Type mode with limit enabled
- **WHEN** the user starts type mode with question limit enabled
- **THEN** the falling words SHALL come from at most the specified number of questions

### Requirement: Question limit persistence
The question limit setting SHALL be persisted in localStorage and restored on page reload.

#### Scenario: Save and restore settings
- **WHEN** the user changes the question limit setting and reloads the page
- **THEN** the setting SHALL retain its previous value

#### Scenario: Settings sync across sessions
- **WHEN** the user sets question limit to 15, closes browser, and reopens
- **THEN** the question limit SHALL still be 15 and enabled
