## ADDED Requirements

### Requirement: URL import can detect and parse Firestore REST API format
The system SHALL detect when a URL returns Firestore REST format and parse it correctly.

#### Scenario: Import from Firestore REST URL
- **WHEN** user enters Firestore REST URL (https://firestore.googleapis.com/v1/...)
- **AND** clicks GET in URL mode
- **THEN** system detects Firestore REST format
- **AND** parses the nested structure (fields → questions → arrayValue → values)
- **AND** prompts for question set name
- **AND** imports the questions correctly

#### Scenario: Import from plain JSON URL
- **WHEN** user enters a regular JSON URL (plain array format)
- **AND** clicks GET in URL mode
- **THEN** system parses as plain JSON array
- **AND** imports normally

### Requirement: COPY button always copies from active question-set
The system SHALL copy the Firestore REST URL from the active question-set's backup, regardless of import toggle state.

#### Scenario: COPY with backed up question-set
- **WHEN** user clicks COPY button
- **AND** active question-set has been backed up (has firestoreId)
- **AND** Firebase config exists
- **THEN** system generates Firestore REST URL
- **AND** copies to clipboard

#### Scenario: COPY without backup
- **WHEN** user clicks COPY button
- **AND** active question-set has NOT been backed up (no firestoreId)
- **THEN** system shows error "Question set chưa được backup"