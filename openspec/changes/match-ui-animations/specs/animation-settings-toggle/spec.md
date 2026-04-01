## ADDED Requirements

### Requirement: Animation toggle in Settings screen
The system SHALL provide a checkbox in Settings screen to enable/disable all animations.

#### Scenario: Animation toggle exists in Settings
- **WHEN** user opens Settings screen
- **THEN** user SHALL see a checkbox labeled "Enable animations" with default checked

#### Scenario: Save animation preference
- **WHEN** user toggles animation checkbox and saves settings
- **THEN** the system SHALL persist the preference to localStorage and apply immediately
