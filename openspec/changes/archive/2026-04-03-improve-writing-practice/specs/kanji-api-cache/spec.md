## ADDED Requirements

### Requirement: Fetch kanji readings from kanjiapi.dev
The system SHALL fetch kanji reading data from kanjiapi.dev API endpoint `https://kanjiapi.dev/v1/kanji/{character}` and return kun_readings and on_readings.

#### Scenario: Successful API response
- **WHEN** fetchKanjiData('学') is called with valid kanji character
- **THEN** system returns object with kun_readings and on_readings from API

#### Scenario: API error or unavailable
- **WHEN** fetchKanjiData('学') is called but API returns error
- **THEN** system returns null and logs error to console

### Requirement: Cache API responses in localStorage
The system SHALL cache kanji API responses in localStorage with key 'jq_kanji_cache' to avoid repeated API calls.

#### Scenario: Cache hit
- **WHEN** fetchKanjiData('学') is called for previously fetched kanji
- **THEN** system returns cached data without making API request

#### Scenario: Cache miss
- **WHEN** fetchKanjiData('学') is called for new kanji not in cache
- **THEN** system makes API request and stores result in cache

### Requirement: Combine API readings with JSON translation
The system SHALL use Vietnamese meaning from JSON data and readings from kanjiapi.dev for display.

#### Scenario: Display kanji practice
- **WHEN** practice modal shows kanji '学'
- **THEN** Meaning field shows translation from JSON (tiếng Việt), Reading field shows readings from API (kun + on)
