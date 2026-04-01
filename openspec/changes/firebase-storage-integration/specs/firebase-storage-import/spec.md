## ADDED Requirements

### Requirement: User can import question set from Firebase URL
The system SHALL allow users to paste a Firebase Storage URL and import the question set from that URL.

#### Scenario: Successful import from valid URL
- **WHEN** user pastes a valid Firebase Storage URL into the import input
- **AND** clicks "GET" button
- **THEN** system fetches the JSON from the URL
- **AND** validates the JSON structure
- **AND** creates a new question set with the imported data
- **AND** switches to the new question set
- **AND** shows success message with toast

#### Scenario: Import with invalid URL format
- **WHEN** user enters a URL that is not a valid Firebase Storage URL
- **AND** clicks "GET"
- **THEN** system shows error message "Invalid Firebase Storage URL"

#### Scenario: Import from URL with invalid JSON
- **WHEN** user enters a valid Firebase URL but the content is not valid question set JSON
- **AND** clicks "GET"
- **THEN** system shows error message describing the JSON validation error

#### Scenario: Import from URL with empty response
- **WHEN** user enters a valid Firebase URL that returns empty content
- **AND** clicks "GET"
- **THEN** system shows error message "Empty response from URL"