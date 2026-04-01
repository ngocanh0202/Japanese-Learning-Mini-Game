## ADDED Requirements

### Requirement: User can import question set from Firestore document ID
The system SHALL allow users to paste a Firestore document ID and import the question set from Firestore.

#### Scenario: Successful import from valid ID
- **WHEN** user enters a valid Firestore document ID into the import input
- **AND** clicks "GET" button
- **THEN** system queries Firestore for the document
- **AND** retrieves the question set data
- **AND** creates a new question set with the imported data
- **AND** switches to the new question set
- **AND** shows success message with toast

#### Scenario: Import with invalid document ID
- **WHEN** user enters a document ID that doesn't exist in Firestore
- **AND** clicks "GET"
- **THEN** system shows error message "Document not found"

#### Scenario: Import with empty input
- **WHEN** user clicks "GET" with empty input field
- **THEN** system shows error message "Please enter a document ID"

#### Scenario: Import from Firestore with invalid data structure
- **WHEN** user enters a valid document ID but the document has invalid data
- **AND** clicks "GET"
- **THEN** system shows error message describing the data validation error