## ADDED Requirements

### Requirement: User can toggle between URL and ID import modes
The system SHALL provide a toggle switch to select between importing from URL or Firestore document ID, with URL mode as default.

#### Scenario: Toggle to URL mode (default)
- **WHEN** user sees the import section
- **THEN** URL mode is selected by default
- **AND** input placeholder shows "Paste JSON URL here..."

#### Scenario: Toggle to ID mode
- **WHEN** user clicks ID radio button
- **THEN** ID mode is selected
- **AND** input placeholder changes to "Paste Firestore document ID here..."

#### Scenario: Toggle changes COPY button behavior
- **WHEN** user is in URL mode
- **AND** clicks COPY button
- **THEN** system copies the URL from input field to clipboard
- **WHEN** user is in ID mode
- **AND** clicks COPY button
- **THEN** system generates Firestore REST URL from firestoreId and copies to clipboard

#### Scenario: Toggle persists across screen visits
- **WHEN** user switches to ID mode
- **AND** leaves the data screen
- **AND** returns to data screen
- **THEN** ID mode is still selected (state not persisted)