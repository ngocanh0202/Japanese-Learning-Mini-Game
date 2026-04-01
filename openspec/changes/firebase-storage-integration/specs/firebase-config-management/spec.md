## ADDED Requirements

### Requirement: User can configure Firebase credentials
The system SHALL provide a UI for users to enter their Firebase Project ID and Storage Bucket, and save these credentials.

#### Scenario: Save Firebase config
- **WHEN** user enters Project ID and Storage Bucket
- **AND** clicks "SAVE CONFIG"
- **THEN** system validates that both fields are filled
- **AND** saves the config to localStorage (jq_firebase_config)
- **AND** shows success message with toast
- **AND** hides the config form (collapses)

#### Scenario: Save config with empty fields
- **WHEN** user clicks "SAVE CONFIG" with empty Project ID or Storage Bucket
- **THEN** system shows error message "Please fill in all fields"

### Requirement: User can test Firebase connection
The system SHALL allow users to verify their Firebase configuration is working before attempting backup.

#### Scenario: Test connection with valid config
- **WHEN** user has saved Firebase config
- **AND** clicks "TEST CONNECTION"
- **THEN** system attempts to list files from Firebase Storage
- **AND** shows success message "Connection successful!" if working
- **AND** shows error message if connection fails

#### Scenario: Test connection without config
- **WHEN** user clicks "TEST CONNECTION" without saved config
- **THEN** system shows error message "Please configure Firebase first"

### Requirement: Firebase config persists across sessions
The system SHALL load Firebase configuration from localStorage on page load.

#### Scenario: Config loaded on app start
- **WHEN** user opens the app with previously saved Firebase config
- **THEN** system loads the Project ID and Storage Bucket
- **AND** the config form shows the saved values
- **AND** backup/copy buttons are enabled