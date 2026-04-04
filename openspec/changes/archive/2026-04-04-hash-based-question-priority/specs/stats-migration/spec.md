## ADDED Requirements

### Requirement: Auto-detect legacy stats format
On application load, the system SHALL detect whether `jq_question_stats` uses the legacy index-based format (keys matching `q-\d+`) or the new hash-based format (keys matching `q-[a-z0-9]+`).

#### Scenario: Legacy format detected
- **WHEN** `loadQuestionStats()` finds stats keys matching the pattern `q-\d+`
- **THEN** the system SHALL trigger the migration process

#### Scenario: New format detected
- **WHEN** `loadQuestionStats()` finds stats keys matching the pattern `q-[a-z0-9]+` (non-numeric)
- **THEN** the system SHALL load stats directly without migration

#### Scenario: No existing stats
- **WHEN** `jq_question_stats` does not exist in localStorage
- **THEN** the system SHALL initialize an empty stats object without migration

### Requirement: One-time migration from index-based to hash-based IDs
The migration process SHALL map legacy stats (keyed by `q-{index}`) to new hash-based IDs by computing the hash for each question at the corresponding index in the current `questions` array.

#### Scenario: Successful migration
- **WHEN** migration runs with a valid questions array and legacy stats
- **THEN** each legacy stat entry `q-{N}` SHALL be moved to `q-{hash(questions[N])}` and the localStorage SHALL be updated

#### Scenario: Legacy key references out-of-bounds index
- **WHEN** a legacy stats key `q-{N}` exists but `N >= questions.length`
- **THEN** that stats entry SHALL be discarded (orphaned data from deleted questions)

#### Scenario: Migration sets completion flag
- **WHEN** migration completes successfully
- **THEN** the system SHALL set `localStorage.jq_stats_migrated = "true"`

### Requirement: Migration skip flag
If `localStorage.jq_stats_migrated` is set to `"true"`, the system SHALL skip the migration process on subsequent loads.

#### Scenario: Migration already completed
- **WHEN** `loadQuestionStats()` finds `jq_stats_migrated = "true"` in localStorage
- **THEN** the system SHALL load stats directly without checking format or running migration

### Requirement: Migration error handling
If migration fails (e.g., invalid data, JSON parse error), the system SHALL discard the corrupted stats, initialize fresh stats, and log a warning to the console.

#### Scenario: Migration throws error
- **WHEN** an error occurs during migration
- **THEN** the system SHALL catch the error, log it to console, initialize empty stats, set `jq_stats_migrated = "true"`, and continue normal operation

#### Scenario: Questions array is empty during migration
- **WHEN** migration runs but `questions` array is empty
- **THEN** the system SHALL initialize empty stats and set `jq_stats_migrated = "true"`

### Requirement: Stats preserved after migration
After migration, all stats data (incorrect, correctCount, totalAttempts, lastSeen, correctStreak, avgResponseTime, slowCorrectCount, incorrectHistory) SHALL be preserved for each question that still exists in the current questions array.

#### Scenario: All stats fields preserved
- **WHEN** a question at index N is migrated from `q-N` to `q-{hash}`
- **THEN** all stat fields for all game types SHALL be copied to the new key without modification
