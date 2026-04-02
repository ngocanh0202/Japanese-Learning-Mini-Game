## ADDED Requirements

### Requirement: Practice button displays highlight on wrong answer
When a user answers incorrectly in quiz or listening mode, the Practice button SHALL display a red highlight with pulse animation to draw attention to the user.

#### Scenario: Quiz wrong answer
- **WHEN** user selects an incorrect answer in quiz mode
- **THEN** the Practice button displays a red border with pulsing glow animation
- **AND** the animation continues until user clicks the Practice button or proceeds to next question

#### Scenario: Listen wrong answer
- **WHEN** user selects an incorrect answer in listening mode
- **THEN** the Practice button displays a red border with pulsing glow animation
- **AND** the animation continues until user clicks the Practice button or proceeds to next question

### Requirement: Highlight uses consistent visual language
The highlight SHALL use the application's accent color for red tones to maintain visual consistency with other error states in the application.

#### Scenario: Visual consistency check
- **WHEN** highlight is displayed
- **THEN** it uses CSS custom property var(--accent) for red color
- **AND** it includes a subtle pulse animation at 1 second interval
