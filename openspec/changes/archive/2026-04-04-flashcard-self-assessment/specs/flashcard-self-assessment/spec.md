## ADDED Requirements

### Requirement: 4-level self-assessment UI
After flipping a flashcard, the system SHALL display 4 assessment buttons: New, Learning, Familiar, and Mastered, replacing the previous 2-button Unknown/Known interface.

#### Scenario: Card flipped
- **WHEN** user taps a flashcard to reveal the answer
- **THEN** the system SHALL display 4 color-coded assessment buttons: New (red), Learning (yellow), Familiar (green), Mastered (blue)

#### Scenario: Button selection advances to next card
- **WHEN** user taps any of the 4 assessment buttons
- **THEN** the system SHALL record the assessment, increment the card counter, and display the next card

### Requirement: New assessment tracking
When the user selects "New", the system SHALL record the answer as incorrect: increment `incorrect` by 1, reset `correctStreak` to 0, and add the current timestamp to `incorrectHistory`.

#### Scenario: User selects New
- **WHEN** user taps the "New" button
- **THEN** `updateQuestionStats(originalIndex, 'flash', false, responseTime)` SHALL be called with `isCorrect = false`

### Requirement: Learning assessment tracking
When the user selects "Learning", the system SHALL record the answer as incorrect: increment `incorrect` by 1, reset `correctStreak` to 0, and add the current timestamp to `incorrectHistory`.

#### Scenario: User selects Learning
- **WHEN** user taps the "Learning" button
- **THEN** `updateQuestionStats(originalIndex, 'flash', false, responseTime)` SHALL be called with `isCorrect = false`

### Requirement: Familiar assessment tracking
When the user selects "Familiar", the system SHALL record the answer as correct: increment `correctStreak` by 1, increment `correctCount` by 1, and award 1.5x base XP.

#### Scenario: User selects Familiar
- **WHEN** user taps the "Familiar" button
- **THEN** `updateQuestionStats(originalIndex, 'flash', true, responseTime)` SHALL be called with `isCorrect = true` and player SHALL receive `BASE_XP_REWARD * 1.5` XP

### Requirement: Mastered assessment tracking
When the user selects "Mastered", the system SHALL record the answer as correct with double streak credit: call `updateQuestionStats` twice to increment `correctStreak` by 2, and award 2.5x base XP.

#### Scenario: User selects Mastered
- **WHEN** user taps the "Mastered" button
- **THEN** `updateQuestionStats(originalIndex, 'flash', true, responseTime)` SHALL be called twice and player SHALL receive `BASE_XP_REWARD * 2.5` XP

### Requirement: Original index tracking
The flashcard deck SHALL store the original question index from the `questions` array so that stats are recorded against the correct question.

#### Scenario: Deck creation
- **WHEN** `startFlash()` creates the flash deck
- **THEN** each card in `flashDeck` SHALL have an `originalIndex` property matching its index in the `questions` array

#### Scenario: Stats recording uses original index
- **WHEN** any assessment button is tapped
- **THEN** `updateQuestionStats` SHALL be called with `flashDeck[flashIdx].originalIndex`, not `flashIdx`

## REMOVED Requirements

### Requirement: Binary Unknown/Known assessment
**Reason**: Replaced by 4-level self-assessment for more nuanced spaced repetition learning
**Migration**: No migration needed — UI change only, existing localStorage data remains valid
