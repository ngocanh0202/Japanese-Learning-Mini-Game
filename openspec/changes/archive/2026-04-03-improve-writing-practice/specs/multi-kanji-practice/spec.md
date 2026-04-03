## ADDED Requirements

### Requirement: Extract multiple kanji from word
The system SHALL extract all kanji characters from a word using Unicode range U+4E00-U+9FAF.

#### Scenario: Word with multiple kanji
- **WHEN** getKanjiChars('学生') is called
- **THEN** system returns array ['学', '生']

#### Scenario: Word with no kanji
- **WHEN** getKanjiChars('あめ') is called (hiragana only)
- **THEN** system returns empty array []

### Requirement: Practice modal pagination for multi-kanji words
The system SHALL display pagination controls (1/2, 2/2) when a word contains 2 or more kanji characters.

#### Scenario: Two kanji word
- **WHEN** showWritePracticeModal('学生', 'gakusei', 'Học sinh') is called
- **THEN** pagination shows "1 / 2" with prev/next buttons

#### Scenario: Single kanji word
- **WHEN** showWritePracticeModal('学', 'gaku', 'Học') is called
- **THEN** pagination is hidden, modal shows single kanji

### Requirement: Navigate between kanji in practice modal
The system SHALL allow user to navigate between kanji using prev/next buttons.

#### Scenario: Navigate to next kanji
- **WHEN** user clicks next button when on page 1/2
- **THEN** modal displays next kanji, canvas is cleared, page updates to 2/2

#### Scenario: Navigate to previous kanji
- **WHEN** user clicks prev button when on page 2/2
- **THEN** modal displays previous kanji, canvas is cleared, page updates to 1/2

### Requirement: Auto-advance after correct answer
The system SHALL automatically advance to the next kanji after user correctly writes the current kanji.

#### Scenario: Correct answer on non-last kanji
- **WHEN** user correctly writes kanji and modal has more kanji remaining
- **THEN** system shows success toast, waits 1 second, then loads next kanji

#### Scenario: Correct answer on last kanji
- **WHEN** user correctly writes last kanji in the queue
- **THEN** system shows success toast, waits 1.5 seconds, then closes modal
