## ADDED Requirements

### Requirement: Kuroshiro library initialization
The system SHALL initialize kuroshiro library on page load to enable kanji-to-hiragana conversion.

#### Scenario: Successful initialization
- **WHEN** page loads with kuroshiro-browser script included
- **THEN** kuroshiro instance is created and initialized with KuromojiAnalyzer

#### Scenario: CDN failure fallback
- **WHEN** kuroshiro-browser script fails to load
- **THEN** system falls back to wanakana for conversion

### Requirement: Convert kanji to hiragana
The system SHALL convert Japanese text (kanji, katakana, romaji) to hiragana using kuroshiro library.

#### Scenario: Convert kanji + katakana answer
- **WHEN** answer text is "会って" (kanji + katakana)
- **THEN** conversion returns "あって" (hiragana)

#### Scenario: Convert romaji answer
- **WHEN** answer text is "naosu" (romaji)
- **THEN** conversion returns "なおす" (hiragana)

#### Scenario: Convert mixed content
- **WHEN** answer text contains both kanji and kana
- **THEN** all kanji characters are converted to hiragana while kana remains unchanged

### Requirement: Display hiragana in game-type answer mode
The system SHALL display converted hiragana text on falling words canvas when answer mode is enabled.

#### Scenario: Canvas displays hiragana
- **WHEN** game-type runs in answer mode with kanji answer
- **THEN** falling word displays hiragana (e.g., "あって") instead of original kanji (e.g., "会って")

#### Scenario: HUD displays hiragana
- **WHEN** target word is displayed in HUD
- **THEN** hiragana version is shown for user to type

### Requirement: Validate input against hiragana
The system SHALL compare user input against converted hiragana text for accurate validation.

#### Scenario: Correct input validation
- **WHEN** user types "あって" and target hiragana is "あって"
- **THEN** input is marked as correct

#### Scenario: Partial input handling
- **WHEN** user types partial input that matches prefix of target hiragana
- **THEN** input is accepted without error until complete match or mismatch
