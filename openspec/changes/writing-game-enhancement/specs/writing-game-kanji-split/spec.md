## ADDED Requirements

### Requirement: Kanji Splitting
Multi-kanji words SHALL be split into individual kanji characters for drawing practice.

#### Scenario: Split 2-kanji word
- **WHEN** a question with word "学生" (2 kanji) is rendered
- **THEN** system displays "学" first for drawing, then "生" after completion

#### Scenario: Split 3-kanji word
- **WHEN** a question with word "日本語" (3 kanji) is rendered
- **THEN** system displays "日", "本", "語" sequentially for drawing

#### Scenario: Single kanji word
- **WHEN** a question with word "学" (1 kanji) is rendered
- **THEN** system displays "学" normally without splitting

### Requirement: Kanji Data Inheritance
Each split kanji SHALL inherit romaji and translation from the original word.

#### Scenario: Inherit romaji
- **WHEN** "学生" is split to "学"
- **THEN** the kanji "学" uses romaji "がくせい" from original word as fallback

#### Scenario: Inherit translation
- **WHEN** "学生" is split to "学"
- **THEN** the kanji "学" uses translation "Học sinh" from original word as hint
