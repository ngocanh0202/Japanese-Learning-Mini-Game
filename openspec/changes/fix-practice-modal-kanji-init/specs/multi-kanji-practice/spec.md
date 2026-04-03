## MODIFIED Requirements

### Requirement: Practice modal initialization order
The practice modal SHALL initialize the KanjiCanvas before any erase or render operations to prevent undefined context errors.

#### Scenario: Initialize canvas before rendering
- **WHEN** showWritePracticeModal('学生', 'gakusei', 'Student') is called
- **THEN** KanjiCanvas.init('practiceCanvas') is called BEFORE renderPracticeKanjiPage() or any erase operation

### Requirement: Handle words with no kanji characters
The system SHALL display a toast message "No kanji found in this word" when the word contains no kanji characters (only hiragana/katakana).

#### Scenario: Word has no kanji
- **WHEN** showWritePracticeModal('あめ', 'ame', 'Rain') is called (hiragana only)
- **THEN** toast shows "No kanji found in this word"
- **AND** modal displays the word as-is with original romaji and translation

#### Scenario: Word has kanji
- **WHEN** showWritePracticeModal('学生', 'gakusei', 'Student') is called
- **THEN** modal displays first kanji character with readings from API
- **AND** no toast is shown
