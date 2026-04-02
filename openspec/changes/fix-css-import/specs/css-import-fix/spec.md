## ADDED Requirements

### Requirement: CSS files properly imported in index.html
The system SHALL load all CSS files from the `css/` directory in the correct order to ensure all styles are applied correctly.

#### Scenario: index.html loads CSS in correct order
- **WHEN** index.html is loaded in a browser
- **THEN** all CSS files from `css/` directory SHALL be loaded in the following order:
  1. css/variables.css (CSS variables and reset)
  2. css/base.css (global styles)
  3. css/menu.css (menu and navigation)
  4. css/game-quiz.css (quiz game styles)
  5. css/game-listen.css (listening game styles)
  6. css/game-flash.css (flashcard game styles)
  7. css/game-type.css (typing game styles)
  8. css/game-hud.css (game HUD styles)
  9. css/game-overlays.css (game over and toast overlays)
  10. css/modals.css (modal dialogs)

#### Scenario: Old style.css link is removed
- **WHEN** index.html is updated
- **THEN** the old `<link rel="stylesheet" href="style.css" />` SHALL be removed or replaced

#### Scenario: All visual elements render correctly
- **WHEN** all CSS files are loaded
- **THEN** all UI elements including menu, games, modals, and overlays SHALL render with correct styles

### Requirement: CSS file coverage verification
The system SHALL verify that all styles from the original `style.css` are present in the new modular CSS files.

#### Scenario: No missing styles
- **WHEN** CSS files are organized
- **THEN** all visual styles from the original monolithic CSS SHALL be distributed across the modular CSS files without loss