## ADDED Requirements

### Requirement: Typing comparison mode setting
The falling words game SHALL provide a setting to choose between romaji and Japanese word comparison.

#### Scenario: Romaji mode selected
- **WHEN** settings.typeCompareMode is 'romaji'
- **THEN** user input is compared against the question's romaji property using wanakana conversion

#### Scenario: Word mode selected
- **WHEN** settings.typeCompareMode is 'word'
- **THEN** user input is compared directly against the question's word property

#### Scenario: Default mode
- **WHEN** settings are initialized
- **THEN** typeCompareMode defaults to 'romaji'

### Requirement: Warning for word mode
The system SHALL display a warning when the user selects Japanese word comparison mode.

#### Scenario: Warning displayed
- **WHEN** user selects 'word' mode in settings
- **THEN** a warning message appears stating that Japanese IME input is required

### Requirement: Input validation per mode
The typing game SHALL validate input differently based on the selected comparison mode.

#### Scenario: Romaji validation
- **WHEN** typeCompareMode is 'romaji'
- **THEN** input is converted to hiragana via wanakana before comparison

#### Scenario: Word validation
- **WHEN** typeCompareMode is 'word'
- **THEN** input is compared as-is against the target word string
