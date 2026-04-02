## ADDED Requirements

### Requirement: Practice writing modal trigger
After answering incorrectly in quiz or listen games, the system SHALL display a "Practice Writing" button.

#### Scenario: Wrong answer in quiz
- **WHEN** user selects wrong answer in quiz game
- **THEN** a "Practice Writing" button appears alongside the explanation

#### Scenario: Wrong answer in listen
- **WHEN** user selects wrong answer in listen game
- **THEN** a "Practice Writing" button appears alongside the explanation

#### Scenario: Correct answer
- **WHEN** user selects correct answer
- **THEN** no practice writing button is shown

### Requirement: Inline writing practice modal
The system SHALL display an inline modal for writing practice without leaving the current game.

#### Scenario: Modal opens
- **WHEN** user clicks "Practice Writing" button
- **THEN** a modal overlay appears showing the target word's translation and romaji as hints, with an input field

#### Scenario: Correct practice answer
- **WHEN** user correctly types the word in the modal
- **THEN** positive feedback is shown and modal closes after 1.5 seconds

#### Scenario: Modal close
- **WHEN** user clicks close button or backdrop
- **THEN** modal closes and user returns to the game
