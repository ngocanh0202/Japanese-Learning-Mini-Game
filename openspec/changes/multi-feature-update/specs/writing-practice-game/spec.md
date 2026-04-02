## ADDED Requirements

### Requirement: Writing game screen
The system SHALL provide a new game screen (screen-write) for practicing Japanese character writing.

#### Scenario: Writing game launches
- **WHEN** user starts the writing game from the menu
- **THEN** screen-write is displayed with HUD showing HP, Score, Combo, and Progress

### Requirement: Writing game input
The system SHALL accept user input for Japanese characters and compare against the question's word property.

#### Scenario: Romaji input mode
- **WHEN** user types romaji in the input field
- **THEN** input is converted to hiragana via wanakana and compared against the target word

#### Scenario: Direct Japanese input mode
- **WHEN** settings.typeCompareMode is 'word' and user types Japanese characters
- **THEN** input is compared directly against the target word string

### Requirement: Writing game feedback
The system SHALL display visual feedback for correct and incorrect writing attempts.

#### Scenario: Correct answer
- **WHEN** user input matches the target word
- **THEN** score increases, combo increments, positive feedback is shown, next question loads

#### Scenario: Incorrect answer
- **WHEN** user input does not match the target word
- **THEN** HP decreases, combo resets, correct answer is displayed, user can retry or skip

### Requirement: Writing game deck
The writing game SHALL use the priority system to select questions, respecting question limit settings.

#### Scenario: Deck generation
- **WHEN** writing game starts
- **THEN** deck is generated via getPrioritizedDeck(questions, 'write') and sliced to questionLimit if enabled
