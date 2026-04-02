## ADDED Requirements

### Requirement: Match Percentage Display
System SHALL calculate and display match percentage based on candidate position from KanjiCanvas recognition.

#### Scenario: Top 1 match
- **WHEN** user draws and the target kanji is the first candidate
- **THEN** system displays "100% Match" and awards 100% of base points

#### Scenario: Top 2 match
- **WHEN** user draws and the target kanji is the second candidate
- **THEN** system displays "70% Match" and awards 70% of base points

#### Scenario: Top 3 match
- **WHEN** user draws and the target kanji is the third candidate
- **THEN** system displays "50% Match" and awards 50% of base points

#### Scenario: No match
- **WHEN** user draws and target kanji is not in top 3 candidates
- **THEN** system shows typing fallback option

### Requirement: Score Calculation with Percentage
Points awarded SHALL be proportional to match percentage.

#### Scenario: 100% match with combo
- **WHEN** user gets 100% match with combo x2
- **THEN** points = BASE_XP * 2 * 1.5 * (100/100) = BASE_XP * 3

#### Scenario: 70% match with combo
- **WHEN** user gets 70% match with combo x1
- **THEN** points = BASE_XP * 1 * 1.5 * (70/100) = BASE_XP * 1.05

#### Scenario: Skip does not gain points
- **WHEN** user clicks Skip button
- **THEN** no points are awarded and HP is decreased
