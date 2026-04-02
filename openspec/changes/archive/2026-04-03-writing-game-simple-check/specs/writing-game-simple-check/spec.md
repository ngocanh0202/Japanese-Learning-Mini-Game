## ADDED Requirements

### Requirement: Simple Kanji Recognition Check
The system SHALL pass the kanji if KanjiCanvas recognizes it, regardless of position in candidate list.

#### Scenario: Kanji recognized - pass
- **WHEN** user draws a kanji and KanjiCanvas returns candidates containing the target kanji
- **THEN** system displays "✓ Correct!" and awards points

#### Scenario: Kanji not recognized - fail with retry
- **WHEN** user draws a kanji and KanjiCanvas returns candidates NOT containing the target kanji
- **THEN** system displays "✗ Not recognized" and allows retry

### Requirement: No Percentage Calculation
The system SHALL NOT calculate or display percentage match.

#### Scenario: No percentage displayed
- **WHEN** kanji is recognized
- **THEN** feedback shows "✓ Correct!" without any percentage

### Requirement: Simple Feedback Messages
The system SHALL display simple feedback messages.

#### Scenario: Pass feedback
- **WHEN** kanji is recognized
- **THEN** feedback displays: `<span style="color: #30d158">✓ Correct! +${pts} EXP</span>`

#### Scenario: Fail feedback
- **WHEN** kanji is not recognized
- **THEN** feedback displays: `<span style="color: #ff2d55">✗ Not recognized</span><br><span style="color: #30d158">Try again!</span>`

## REMOVED Requirements

### Requirement: Match Percentage Display
**Reason**: Replaced by simple recognition check - no percentage needed
**Migration**: Feedback now shows "✓ Correct!" or "✗ Not recognized" without percentage

### Requirement: Score Calculation with Percentage
**Reason**: Points now calculated at full rate when recognized, no percentage multiplier
**Migration**: Points = BASE_XP * combo * 1.5 (full points when recognized)
