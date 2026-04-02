## ADDED Requirements

### Requirement: Skip Button UI
System SHALL provide a Skip button in the writing game screen.

#### Scenario: Skip button visible
- **WHEN** writing game is rendered
- **THEN** Skip button is visible and clickable

#### Scenario: Skip button position
- **WHEN** writing game is rendered
- **THEN** Skip button is positioned near the canvas/controls area

### Requirement: Skip Functionality
Clicking Skip SHALL advance to the next kanji without awarding points.

#### Scenario: Skip decrements HP
- **WHEN** user clicks Skip button
- **THEN** player HP decreases by 20 (same as wrong answer)

#### Scenario: Skip resets combo
- **WHEN** user clicks Skip button
- **THEN** combo counter resets to 0

#### Scenario: Skip marks as wrong
- **WHEN** user clicks Skip button
- **THEN** the question is marked as wrong in stats

#### Scenario: Skip advances to next kanji
- **WHEN** user clicks Skip button
- **THEN** system advances to next kanji (or next word if all kanji done)
