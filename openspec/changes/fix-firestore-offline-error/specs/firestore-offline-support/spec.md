## ADDED Requirements

### Requirement: Firestore handles offline scenarios gracefully
The system SHALL configure Firestore with persistence and handle network issues properly.

#### Scenario: Import with offline client
- **WHEN** user tries to import via Firestore ID
- **AND** client is offline
- **THEN** system should show clear error "No internet connection. Please check your network."
- **AND** not show confusing "client is offline" error

#### Scenario: Import with network restored
- **WHEN** user has internet connection
- **AND** clicks import
- **THEN** system should successfully fetch document

#### Scenario: Firestore persistence enabled
- **WHEN** Firebase is initialized
- **THEN** Firestore persistence should be enabled for offline caching