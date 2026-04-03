## ADDED Requirements

### Requirement: Hint button in Writing game
The Writing game SHALL display a "? Hint" button next to the current kanji character.

#### Scenario: Hint button displayed
- **WHEN** Writing game renders a kanji character
- **THEN** a "? Hint" button is displayed next to the kanji

### Requirement: Show hint on hover
The system SHALL display a popup with word and explanation when user hovers over the hint button.

#### Scenario: Hover to show hint
- **WHEN** user hovers over the "? Hint" button
- **THEN** a popup appears showing:
  - Word: [original word, e.g., "学生"]
  - Explanation: [ex field from question data, e.g., "Student. Học (学) + Sinh (生)"]

#### Scenario: Mouse leaves to hide hint
- **WHEN** user moves mouse away from hint button
- **THEN** the popup disappears

#### Scenario: No explanation available
- **WHEN** question has no ex field
- **THEN** show "No explanation available" in the popup

### Requirement: Store explanation in kanji queue
The system SHALL store the explanation (ex) field in writeKanjiQueue when building the queue.

#### Scenario: Explanation stored
- **WHEN** startWrite() builds writeKanjiQueue
- **THEN** each queue item includes the ex field from the original question
