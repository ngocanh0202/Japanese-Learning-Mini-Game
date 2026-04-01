## ADDED Requirements

### Requirement: User can backup question set to Firestore
The system SHALL allow users to save their current question set to Firestore and receive a shareable document ID.

#### Scenario: Successful backup
- **WHEN** user clicks "☁️ BACKUP" button on a question set
- **AND** Firestore is properly configured
- **THEN** system creates/updates a document in "question-sets" collection
- **AND** saves the document ID to question set's firestoreId field
- **AND** shows success message with toast notification
- **AND** enables the copy button

#### Scenario: Backup without Firestore config
- **WHEN** user clicks "☁️ BACKUP" without configuring Firestore
- **THEN** system shows error message prompting to configure Firestore first

#### Scenario: Backup with empty question set
- **WHEN** user clicks "☁️ BACKUP" on an empty question set
- **THEN** system shows error message "Cannot backup empty question set"

### Requirement: User can copy Firestore document ID
The system SHALL allow users to copy the Firestore document ID for sharing.

#### Scenario: Copy document ID
- **WHEN** user clicks "📋 COPY" button on a question set that has been backed up
- **THEN** system copies the document ID to clipboard
- **AND** shows "ID copied!" toast notification

#### Scenario: Copy button disabled for non-backed up set
- **WHEN** user views a question set without firestoreId
- **THEN** the copy button is disabled/grayed out