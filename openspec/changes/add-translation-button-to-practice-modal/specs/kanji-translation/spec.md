## ADDED Requirements

### Requirement: Display English meaning from kanjiapi.dev
The practice modal SHALL display the English meaning from kanjiapi.dev API (`data.meanings[0]`) instead of Vietnamese from JSON data.

#### Scenario: Display English meaning
- **WHEN** renderPracticeKanjiPage() is called for kanji '学'
- **THEN** Meaning field displays "learning" (from data.meanings[0]) not Vietnamese from JSON

### Requirement: Translation button to Vietnamese
The practice modal SHALL display a "🌐 VI" button next to the Meaning field that translates English to Vietnamese.

#### Scenario: Translate to Vietnamese
- **WHEN** user clicks "🌐 VI" button
- **THEN** system calls MyMemory API with current English meaning
- **AND** Meaning field updates to Vietnamese translation

#### Scenario: Translation API error
- **WHEN** user clicks "🌐 VI" button but API fails
- **THEN** system shows toast error "Translation failed"
- **AND** English meaning remains displayed

### Requirement: Store current English meaning for translation
The system SHALL store the current English meaning in a variable for use by the translation function.

#### Scenario: English meaning stored
- **WHEN** renderPracticeKanjiPage() displays English meaning
- **THEN** the meaning is stored in practiceEnglishMeaning variable for translation
