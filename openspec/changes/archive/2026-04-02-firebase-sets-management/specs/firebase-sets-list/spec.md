## ADDED Requirements

### Requirement: Firebase Sets button appears after config is saved
The system SHALL show a "☁️ FIREBASE SETS" button after Firebase config is successfully saved and initialized.

#### Scenario: Button visible after config saved
- **WHEN** user saves Firebase config successfully
- **AND** clicks collapse on config panel
- **THEN** a "☁️ FIREBASE SETS" button is visible in the question set area

### Requirement: User can view all question sets stored in Firebase
The system SHALL fetch and display all documents from the "question-sets" collection in Firebase.

#### Scenario: View Firebase sets list
- **WHEN** user clicks "☁️ FIREBASE SETS" button
- **THEN** system fetches all documents from question-sets collection
- **AND** displays them in a modal with name and created date
- **AND** shows action buttons for each item

#### Scenario: No sets in Firebase
- **WHEN** user clicks "☁️ FIREBASE SETS" button
- **AND** there are no documents in Firebase
- **THEN** system displays "No question sets found in Firebase"