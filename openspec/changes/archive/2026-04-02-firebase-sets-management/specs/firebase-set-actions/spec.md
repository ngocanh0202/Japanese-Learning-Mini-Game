## ADDED Requirements

### Requirement: User can copy shareable URL from Firebase set list
The system SHALL generate and copy the Firestore REST URL for a question set.

#### Scenario: Copy URL from list
- **WHEN** user clicks "📋 Copy" button on a Firebase set
- **THEN** system generates the Firestore REST URL
- **AND** copies to clipboard
- **AND** shows success toast

### Requirement: User can import a question set from Firebase list
The system SHALL import a question set from Firebase to local storage.

#### Scenario: Import from list
- **WHEN** user clicks "📥 Import" button on a Firebase set
- **THEN** system fetches the question set data
- **AND** prompts for name (pre-filled with original name)
- **AND** creates a new local question set with the data

### Requirement: User can delete a question set from Firebase
The system SHALL delete a document from Firestore after user confirmation.

#### Scenario: Delete from list
- **WHEN** user clicks "🗑 Delete" button on a Firebase set
- **AND** confirms the deletion
- **THEN** system deletes the document from Firestore
- **AND** refreshes the list
- **AND** shows success toast

#### Scenario: Delete cancelled
- **WHEN** user clicks "🗑 Delete" button
- **AND** cancels the confirmation
- **THEN** no action is taken