## ADDED Requirements

### Requirement: Priority system documentation file
The project SHALL include a markdown documentation file at `docs/priority-system.md` that explains the question priority mechanism.

#### Scenario: Documentation file exists
- **WHEN** a developer looks up `docs/priority-system.md`
- **THEN** the file SHALL exist and be readable

### Requirement: Documentation covers priority scoring formula
The documentation SHALL explain the priority scoring formula including all four factors (incorrect, timeSinceSeen, learning, slowResponse), their default weights, and how they combine into a final score.

#### Scenario: Formula is documented
- **WHEN** reading the documentation
- **THEN** the priority score formula SHALL be clearly stated with each factor's contribution

### Requirement: Documentation explains hash-based ID system
The documentation SHALL explain that question stats use hash-based IDs derived from content, not array indices, and why this approach was chosen.

#### Scenario: Hash-based ID rationale is clear
- **WHEN** reading the documentation
- **THEN** it SHALL explain the problem with index-based IDs and how hash-based IDs solve it

### Requirement: Documentation covers weighted random selection
The documentation SHALL explain how the weighted random selection algorithm works, including why it uses probability-based selection instead of simple sorting.

#### Scenario: Selection algorithm is documented
- **WHEN** reading the documentation
- **THEN** it SHALL explain the weighted random selection process with an example

### Requirement: Documentation lists key functions and their locations
The documentation SHALL list all key functions involved in the priority system with their file paths and brief descriptions.

#### Scenario: Function reference is complete
- **WHEN** reading the documentation
- **THEN** it SHALL list: `generateQuestionId()`, `getPriorityScore()`, `getPrioritizedDeck()`, `updateQuestionStats()`, `getEffectiveIncorrect()`, `getConfidenceLevel()`, `getWeights()` with file paths

### Requirement: Documents known issues and limitations
The documentation SHALL document known issues, edge cases, and limitations of the priority system.

#### Scenario: Known issues documented
- **WHEN** reading the documentation
- **THEN** it SHALL cover: hash collision possibility, migration one-time nature, stats behavior when switching sets
