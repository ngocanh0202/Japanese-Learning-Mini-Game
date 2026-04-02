## MODIFIED Requirements

### Requirement: Settings label alignment
All setting labels SHALL be left-aligned with checkboxes/toggles positioned on the right side.

#### Scenario: Labels left-aligned
- **WHEN** user views any settings section
- **THEN** all text labels are aligned to the left

#### Scenario: Controls right-aligned
- **WHEN** user views any settings section
- **THEN** checkboxes, toggles, and selects are positioned on the right side

### Requirement: Toggle switch style for all settings
All boolean settings SHALL use the toggle-switch UI pattern (slider with track) instead of native checkboxes.

#### Scenario: Quiz timer toggle
- **WHEN** user views the quiz/listen settings section
- **THEN** "Enable per-question timer" uses a toggle switch, not a native checkbox

#### Scenario: Scanlines toggle
- **WHEN** user views the display settings section
- **THEN** "Show scanlines overlay" uses a toggle switch

#### Scenario: Animations toggle
- **WHEN** user views the display settings section
- **THEN** "Enable animations" uses a toggle switch

### Requirement: Scroll overflow fix
The settings and data screens SHALL properly contain their content without layout artifacts from overflow.

#### Scenario: Settings panel scroll
- **WHEN** settings content exceeds viewport height
- **THEN** the panel scrolls internally without affecting the page layout

#### Scenario: Data panel scroll
- **WHEN** data management content exceeds viewport height
- **THEN** the panel scrolls internally without affecting the page layout
