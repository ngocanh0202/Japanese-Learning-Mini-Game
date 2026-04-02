## ADDED Requirements

### Requirement: Automatic Typing Fallback
The system SHALL automatically show a typing input field when stroke recognition fails or when the target character is not in the KanjiCanvas reference patterns.

#### Scenario: Fallback on recognition failure
- **WHEN** target character is not in top 3 candidates
- **THEN** system shows "Not recognized? Try typing instead" message

#### Scenario: Typing input appears
- **WHEN** fallback is triggered
- **THEN** a text input field appears alongside the canvas

#### Scenario: Typing answer validates
- **WHEN** user types the answer and presses Enter
- **THEN** the input is validated against the target character (using wanakana for romaji comparison)

### Requirement: Seamless Mode Switching
The system SHALL allow users to switch between drawing and typing modes freely.

#### Scenario: Toggle to typing mode
- **WHEN** user clicks "Type instead" button
- **THEN** the canvas is hidden and typing input is shown

#### Scenario: Toggle back to drawing mode
- **WHEN** user clicks "Draw instead" button
- **THEN** the typing input is hidden and canvas is shown again

### Requirement: Fallback Scoring
The system SHALL award the same XP for correct answers via fallback mode as via drawing mode.

#### Scenario: Fallback correct answer
- **WHEN** user types the correct answer in fallback mode
- **THEN** XP is awarded same as if drawing was recognized

#### Scenario: Fallback wrong answer
- **WHEN** user types incorrect answer in fallback mode
- **THEN** HP decreases same as if drawing was wrong
