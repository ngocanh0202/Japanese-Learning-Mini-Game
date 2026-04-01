## ADDED Requirements

### Requirement: User can import question set from any public JSON URL
The system SHALL allow users to enter a public JSON URL and import the question set without any Firebase configuration.

#### Scenario: Successful import from valid URL
- **WHEN** user enters a valid HTTP/HTTPS URL ending with .json
- **AND** URL mode is selected in toggle
- **AND** clicks "GET"
- **THEN** system fetches JSON from the URL
- **AND** validates the JSON structure
- **AND** prompts user for question set name
- **AND** creates new question set with imported data

#### Scenario: Import with invalid URL format
- **WHEN** user enters URL that doesn't start with http:// or https://
- **AND** clicks "GET"
- **THEN** system shows error message "Invalid URL format"

#### Scenario: Import from URL with CORS blocking
- **WHEN** user enters URL but server doesn't allow cross-origin requests
- **AND** clicks "GET"
- **THEN** system shows error message "Cannot fetch URL - CORS policy blocked"

#### Scenario: Import from URL with invalid JSON
- **WHEN** user enters valid URL but content is not valid question set JSON
- **AND** clicks "GET"
- **THEN** system shows error message describing the JSON validation error

#### Scenario: User cancels name prompt
- **WHEN** system successfully fetches and validates JSON
- **AND** prompts for question set name
- **AND** user clicks Cancel or enters empty name
- **THEN** system cancels import
- **AND** does NOT create new question set