## ADDED Requirements

### Requirement: User can backup question set to Firebase Storage
The system SHALL allow users to upload their current question set JSON to Firebase Storage and receive a shareable public URL.

#### Scenario: Successful backup
- **WHEN** user clicks "☁️ BACKUP" button on a question set
- **THEN** system uploads the question set JSON to Firebase Storage
- **AND** saves the Firebase URL to the question set's firebaseUrl field
- **AND** shows success message with toast notification
- **AND** enables the copy link button

#### Scenario: Backup without Firebase config
- **WHEN** user clicks "☁️ BACKUP" without configuring Firebase
- **THEN** system shows error message prompting to configure Firebase first

#### Scenario: Backup with empty question set
- **WHEN** user clicks "☁️ BACKUP" on an empty question set
- **THEN** system shows error message "Cannot backup empty question set"

### Requirement: User can copy Firebase URL to clipboard
The system SHALL allow users to copy the Firebase Storage URL of a backed-up question set to clipboard with one click.

#### Scenario: Copy existing URL
- **WHEN** user clicks "📋 COPY" button on a question set that has a firebaseUrl
- **THEN** system copies the URL to clipboard
- **AND** shows "Link copied!" toast notification

#### Scenario: Copy button disabled for non-backed up set
- **WHEN** user views a question set without firebaseUrl
- **THEN** the copy button is disabled/grayed out

### Requirement: Backup uses question set name as file name
The system SHALL use the question set's name (sanitized) as the file name when uploading to Firebase Storage.

#### Scenario: Backup with special characters in name
- **WHEN** user backs up a question set named "JLPT N5 Vocabulary"
- **THEN** the file is stored as "jlpt_n5_vocabulary.json" in Firebase Storage