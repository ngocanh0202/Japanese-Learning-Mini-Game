## ADDED Requirements

### Requirement: Desktop flashcard container width constraint
The flashcard container on desktop (min-width: 769px) SHALL have a maximum width of 550px to prevent the card from becoming too large.

#### Scenario: Desktop browser displays flashcard
- **WHEN** flashcard game is opened on a browser with viewport width >= 769px
- **THEN** the flash-container has max-width: 550px

#### Scenario: Mobile browser displays flashcard
- **WHEN** flashcard game is opened on a browser with viewport width <= 480px
- **THEN** the flash-container has no max-width constraint (full-width)

#### Scenario: Tablet browser displays flashcard
- **WHEN** flashcard game is opened on a browser with viewport width between 481px and 768px
- **THEN** the flash-container has no max-width constraint (full-width)

### Requirement: Desktop card-scene height constraint
The flashcard card-scene on desktop (min-width: 769px) SHALL have a maximum height of 380px to prevent layout issues when flipping.

#### Scenario: Desktop card flip animation
- **WHEN** user flips the card on a desktop browser (viewport >= 769px)
- **THEN** the card-scene maintains max-height: 380px, preventing layout shift

#### Scenario: Mobile card flip animation
- **WHEN** user flips the card on a mobile browser (viewport <= 480px)
- **THEN** the card-scene uses min-height constraint (200px) without max-height limit

### Requirement: Desktop-specific media query
The desktop constraints SHALL be applied using @media (min-width: 769px) to ensure tablet and mobile remain unaffected.

#### Scenario: Breakpoint boundary - tablet
- **WHEN** viewport width is exactly 768px
- **THEN** desktop constraints are NOT applied

#### Scenario: Breakpoint boundary - desktop
- **WHEN** viewport width is exactly 769px
- **THEN** desktop constraints ARE applied