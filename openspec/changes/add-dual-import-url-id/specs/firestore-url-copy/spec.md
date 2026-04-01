## ADDED Requirements

### Requirement: User can generate and copy Firestore REST API URL for sharing
The system SHALL generate a complete Firestore REST API URL from the question set's firestoreId and copy it to clipboard.

#### Scenario: Generate Firestore URL with valid config
- **WHEN** user is in ID mode
- **AND** active question set has a firestoreId
- **AND** Firebase config (Project ID) is saved
- **AND** user clicks COPY button
- **THEN** system generates URL in format: `https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/question-sets/{docId}`
- **AND** copies the URL to clipboard
- **AND** shows success toast "URL copied!"

#### Scenario: Copy button disabled without Firebase config in ID mode
- **WHEN** user is in ID mode
- **AND** no Firebase config is saved
- **AND** user clicks COPY button
- **THEN** system shows error "Please configure Firebase first"

#### Scenario: Copy button disabled without firestoreId in ID mode
- **WHEN** user is in ID mode
- **AND** active question set has no firestoreId (not backed up)
- **AND** user clicks COPY button
- **THEN** button is disabled or shows error "No backup available"

#### Scenario: URL mode copies input field content
- **WHEN** user is in URL mode
- **AND** input field has a value
- **AND** user clicks COPY button
- **THEN** system copies the input value to clipboard
- **AND** shows success toast