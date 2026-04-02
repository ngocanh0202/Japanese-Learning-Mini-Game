## ADDED Requirements

### Requirement: Canvas Drawing Area
The system SHALL provide a 256x256 pixel canvas element where users can draw Japanese characters using mouse or touch input.

#### Scenario: Canvas renders correctly
- **WHEN** the user navigates to the writing practice game screen
- **THEN** a 256x256 canvas element is displayed with a visible border

#### Scenario: Touch drawing works
- **WHEN** user touches the canvas on a touch-enabled device
- **THEN** the touch gesture is captured and rendered as a stroke on the canvas

#### Scenario: Mouse drawing works
- **WHEN** user clicks and drags on the canvas with a mouse
- **THEN** the mouse movement is captured and rendered as a stroke on the canvas

### Requirement: Drawing Controls
The system SHALL provide three control buttons: Erase (clear all), Undo (remove last stroke), and Check (submit for recognition).

#### Scenario: Erase clears canvas
- **WHEN** user clicks the Erase button
- **THEN** all strokes on the canvas are removed instantly

#### Scenario: Undo removes last stroke
- **WHEN** user clicks the Undo button
- **THEN** the most recently drawn stroke is removed

#### Scenario: Check triggers recognition
- **WHEN** user clicks the Check button
- **THEN** the KanjiCanvas recognition algorithm analyzes the strokes

### Requirement: Reference Character Display
The system SHALL display the target Japanese character prominently above the canvas as a reference for the user to draw.

#### Scenario: Target character shown
- **WHEN** a new question is displayed in writing practice
- **THEN** the target character (word property) is displayed in large font above the canvas

#### Scenario: Translation hint shown
- **WHEN** a new question is displayed
- **THEN** the translation is shown below the reference character as a hint

### Requirement: Game Flow Integration
The system SHALL integrate canvas drawing into the existing game flow with question progression, scoring, and combo system.

#### Scenario: New question displays
- **WHEN** the user completes a drawing and gets feedback
- **THEN** clicking "Next" loads the next question with a blank canvas

#### Scenario: Score increases on correct answer
- **WHEN** the user's drawing is recognized as correct
- **THEN** the score increases by the base XP amount multiplied by combo

#### Scenario: HP decreases on wrong answer
- **WHEN** the user's drawing is not in the top 3 candidates
- **THEN** HP decreases by 20 points (or game over if HP reaches 0)
