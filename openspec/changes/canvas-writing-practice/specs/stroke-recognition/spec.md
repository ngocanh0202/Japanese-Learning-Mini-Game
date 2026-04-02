## ADDED Requirements

### Requirement: Stroke Recognition via KanjiCanvas
The system SHALL use the KanjiCanvas library to analyze drawn strokes and return recognition candidates.

#### Scenario: Recognition returns candidates
- **WHEN** user clicks Check button with strokes on canvas
- **THEN** KanjiCanvas.recognize() is called and returns an array of candidate characters

#### Scenario: Recognition handles empty canvas
- **WHEN** user clicks Check button with empty canvas
- **THEN** system displays "Please draw something first!" message

#### Scenario: Recognition handles no matches
- **WHEN** KanjiCanvas cannot match the drawing to any known character
- **THEN** system shows "No matches found" message

### Requirement: Flexible Matching (Top 3)
The system SHALL accept a drawing as correct if the target character appears in any of the top 3 recognition candidates.

#### Scenario: Top 1 match is correct
- **WHEN** target character is the #1 candidate
- **THEN** drawing is marked as correct immediately

#### Scenario: Top 2 match is correct
- **WHEN** target character is the #2 candidate
- **THEN** drawing is marked as correct (flexible matching)

#### Scenario: Top 3 match is correct
- **WHEN** target character is the #3 candidate
- **THEN** drawing is marked as correct (flexible matching)

#### Scenario: No match in top 3
- **WHEN** target character is not in top 3 candidates
- **THEN** drawing is marked as incorrect and fallback mode is offered

### Requirement: Recognition Result Display
The system SHALL display the top recognition candidates to the user after they submit their drawing.

#### Scenario: Show top candidates
- **WHEN** user clicks Check button
- **THEN** the top 3 candidates are displayed with their confidence

#### Scenario: Highlight correct answer
- **WHEN** target character is in the candidate list
- **THEN** the target character is highlighted/identified in the results
