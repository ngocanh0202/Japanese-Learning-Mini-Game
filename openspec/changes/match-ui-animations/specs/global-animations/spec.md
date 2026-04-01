## ADDED Requirements

### Requirement: Screen transition animations
The system SHALL animate screen transitions when navigating between screens.

#### Scenario: Screen transition fade
- **WHEN** user navigates from one screen to another
- **THEN** the new screen SHALL fade in with a smooth opacity transition over 0.3s

### Requirement: Button hover effects
The system SHALL display visual feedback when user hovers over interactive buttons.

#### Scenario: Button hover scale
- **WHEN** user hovers over any button with class .action-btn, .menu-btn, or .choice-btn
- **THEN** the button SHALL scale up to 1.05x with box-shadow glow over 0.2s

### Requirement: Toast notification slide animation
The system SHALL animate toast notifications sliding in from the top.

#### Scenario: Toast slide in
- **WHEN** a toast notification is triggered
- **THEN** the toast SHALL slide down from top with fade-in over 0.3s

### Requirement: Global animation toggle
The system SHALL allow users to enable/disable all animations from Settings.

#### Scenario: Toggle animations off
- **WHEN** user unchecks "Enable animations" in Settings
- **THEN** all CSS transitions and animations SHALL be disabled across the app

#### Scenario: Toggle animations on
- **WHEN** user checks "Enable animations" in Settings
- **THEN** all CSS transitions and animations SHALL be enabled across the app
