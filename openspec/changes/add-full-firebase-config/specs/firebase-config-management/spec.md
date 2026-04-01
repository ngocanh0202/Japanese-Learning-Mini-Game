## MODIFIED Requirements

### Requirement: User can configure Firebase credentials
The system SHALL provide a UI for users to enter all 7 Firebase config fields (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId) and save these credentials.

#### Scenario: Save full Firebase config
- **WHEN** user enters at least Project ID and Storage Bucket
- **AND** clicks "SAVE CONFIG"
- **THEN** system validates that Project ID and Storage Bucket are filled
- **AND** saves the config to localStorage (jq_firebase_config) with all provided fields
- **AND** shows success message with toast
- **AND** hides the config form (collapses)

#### Scenario: Save config with empty optional fields
- **WHEN** user clicks "SAVE CONFIG" with only Project ID and Storage Bucket filled
- **AND** leaves other fields (apiKey, authDomain, etc.) empty
- **THEN** system saves the config with empty strings for missing fields
- **AND** shows success message

#### Scenario: Save config with only required fields empty
- **WHEN** user clicks "SAVE CONFIG" with empty Project ID or Storage Bucket
- **THEN** system shows error message "Please fill in Project ID and Storage Bucket"

#### Scenario: Load existing partial config
- **WHEN** user has a saved config with only Project ID and Storage Bucket
- **AND** opens the Firebase config panel
- **THEN** system populates Project ID and Storage Bucket fields
- **AND** leaves other fields empty
- **AND** allows user to add more fields

### Requirement: User can test Firebase connection
The system SHALL allow users to verify their Firebase configuration is working before attempting backup.

#### Scenario: Test connection with valid config
- **WHEN** user has saved Firebase config with Project ID and Storage Bucket
- **AND** clicks "TEST CONNECTION"
- **THEN** system attempts to list files from Firebase Storage using the saved config
- **AND** shows success message "Connection successful!" if working
- **AND** shows error message if connection fails

#### Scenario: Test connection without config
- **WHEN** user clicks "TEST CONNECTION" without saved config
- **THEN** system shows error message "Please configure Firebase first"

### Requirement: Firebase config persists across sessions
The system SHALL load Firebase configuration from localStorage on page load, including all 7 fields.

#### Scenario: Config loaded on app start
- **WHEN** user opens the app with previously saved Firebase config
- **THEN** system loads all saved config fields
- **AND** the config form shows the saved values
- **AND** backup/copy buttons are enabled if config is valid

#### Scenario: Config with all 7 fields loaded
- **WHEN** user opens the app with a previously saved config containing all 7 fields
- **THEN** system populates all 7 input fields with saved values
- **AND** initializeFirebase() is called with full config