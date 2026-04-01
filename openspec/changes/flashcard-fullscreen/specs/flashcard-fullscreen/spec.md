## ADDED Requirements

### Requirement: Card scene fills available screen space
The flashcard card-scene SHALL use flexbox to fill the available vertical space within the flash-container, adapting to different screen sizes while maintaining usability constraints.

#### Scenario: Desktop display
- **WHEN** flashcard game is opened on a desktop browser (width >= 1024px)
- **THEN** the card-scene expands to fill available space up to max-height: 450px

#### Scenario: Mobile display
- **WHEN** flashcard game is opened on a mobile device (width <= 480px)
- **THEN** the card-scene expands to fill available space but maintains min-height: 200px

#### Scenario: Tablet display
- **WHEN** flashcard game is opened on a tablet (480px < width < 1024px)
- **THEN** the card-scene expands proportionally between min and max constraints

### Requirement: Flex container expansion
The flash-container SHALL use flex: 1 to expand and fill available vertical space between the game-hud and screen bounds.

#### Scenario: Container fills vertical space
- **WHEN** screen height changes (e.g., window resize, device rotation)
- **THEN** flash-container adjusts to fill available space and card-scene responds accordingly

### Requirement: Card maintains minimum usable size
The card-scene SHALL never shrink below min-height to ensure the card content remains readable and interactive.

#### Scenario: Very small screen
- **WHEN** device has very limited vertical space (e.g., small phone in landscape)
- **THEN** card-scene maintains at least 200px height