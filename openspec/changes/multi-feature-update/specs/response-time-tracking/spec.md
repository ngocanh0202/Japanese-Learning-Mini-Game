## ADDED Requirements

### Requirement: Response time measurement
The system SHALL measure and store the time taken to answer each question in quiz, listen, match, and flash games.

#### Scenario: Timer starts on question render
- **WHEN** a question is displayed to the user
- **THEN** a timestamp is recorded as the question start time

#### Scenario: Response time calculated on answer
- **WHEN** the user submits an answer
- **THEN** the response time is calculated as current time minus question start time in milliseconds

### Requirement: Slow correct answer tracking
The system SHALL track correct answers that took longer than 8 seconds as "slow correct" answers.

#### Scenario: Fast correct answer
- **WHEN** user answers correctly in under 8 seconds
- **THEN** correctStreak increments, slowCorrectCount does not change

#### Scenario: Slow correct answer
- **WHEN** user answers correctly but took 8 seconds or more
- **THEN** correctStreak increments AND slowCorrectCount increments

#### Scenario: Wrong answer
- **WHEN** user answers incorrectly regardless of time
- **THEN** correctStreak resets to 0, slowCorrectCount does not change

### Requirement: Response time in question stats
Each question's stats SHALL include avgResponseTime (running average in ms) and slowCorrectCount fields.

#### Scenario: New question stats initialized
- **WHEN** a question is first encountered
- **THEN** avgResponseTime is 0 and slowCorrectCount is 0

#### Scenario: Running average updated
- **WHEN** a question is answered
- **THEN** avgResponseTime is updated using running average formula: newAvg = oldAvg + (newTime - oldAvg) / totalAttempts
