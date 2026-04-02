## MODIFIED Requirements

### Requirement: Priority score calculation
The priority scoring system SHALL include a slowResponse weight that increases priority for questions answered correctly but slowly.

#### Scenario: Slow correct increases priority
- **WHEN** a question has slowCorrectCount > 0 and slowResponse weight > 0
- **THEN** the priority score includes a bonus of min(slowCorrectCount * slowResponseWeight, 30)

#### Scenario: Default slowResponse weight
- **WHEN** priority settings are initialized
- **THEN** slowResponse weight defaults to 3 in both global and per-game weights

### Requirement: Priority settings UI
The priority settings panel SHALL include a slider for the slowResponse weight.

#### Scenario: Slow response slider displayed
- **WHEN** user views priority settings with smart prioritization enabled
- **THEN** a "Slow Response" slider is shown with range 0-10 and default value 3
