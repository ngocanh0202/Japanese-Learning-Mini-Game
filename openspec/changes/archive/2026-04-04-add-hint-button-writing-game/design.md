## Context

The Writing Practice game displays individual kanji characters for users to practice writing. Currently, there is no way for users to see:
- The original word that contains the kanji (e.g., "学生" contains "学" and "生")
- The explanation of the word (e.g., "Student: Học (学) + Sinh (生)")

Users need this context to better understand and remember the kanji.

## Goals / Non-Goals

**Goals:**
- Add "? Hint" button near the displayed kanji
- Show popup on hover (not click) with:
  - Original word (e.g., "学生")
  - Explanation (e.g., "Student. Học (学) + Sinh (生)")
- Store explanation data in writeKanjiQueue

**Non-Goals:**
- Change main game flow
- Add hint to other games (quiz, listen, etc.)
- Make hint available on mobile (touch doesn't have hover)

## Decisions

### 1. Hover vs Click
**Decision**: Hover only (no click)

**Rationale**: Simpler UX, users can quickly preview without clicking. Touch devices will show hint on tap (browser default behavior).

### 2. Data Storage
**Decision**: Add `ex` field to writeKanjiQueue

**Rationale**: Current queue structure:
```javascript
{
  kanji: '学',
  word: '学生',
  romaji: 'gakusei',
  translation: 'Học sinh'
}
```

Need to add: `ex: 'Student. Học (学) + Sinh (生)'`

### 3. HTML Structure
**Decision**: Use inline hint with CSS positioning

**Layout**:
```
┌──────────────────────────┐
│    学    [? Hint]        │  ← button triggers popup
│                          │
│  Meaning: learning      │
│  Read: まな.ぶ, ガク      │
└──────────────────────────┘
```

The hint popup appears below the button with absolute positioning.

### 4. CSS Styling
**Decision**: Dark background with border to match game theme

**Style**: 
- Background: var(--panel) or var(--bg2)
- Border: 1px solid var(--border)
- Border-radius: var(--radius)
- Font: var(--font-jp) for content, var(--font-px) for labels

## Risks / Trade-offs

- **[Risk] Mobile users** → No hover on mobile, but browsers typically show hover state on tap. Acceptable.
- **[Risk] Long explanation text** → May overflow. Set max-width and allow text wrap.
- **[Risk] Missing ex data** → Some questions may not have ex field. Show fallback text.

## Open Questions

- None - all decisions are clear
