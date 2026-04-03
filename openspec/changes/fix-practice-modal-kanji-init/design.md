## Context

The Practice Writing Modal (`showWritePracticeModal`) is used when users want to practice writing kanji after answering incorrectly in Quiz or Listen games. The function extracts kanji characters from a word and allows the user to practice writing them on a canvas.

Current problematic flow:
1. Extract kanji from word → `practiceKanjiList`
2. Call `renderPracticeKanjiPage()` which calls `KanjiCanvas.erase()` 
3. `KanjiCanvas.erase()` tries to access canvas context which hasn't been initialized yet
4. Result: TypeError: Cannot read properties of undefined (reading 'clearRect')

## Goals / Non-Goals

**Goals:**
- Fix the initialization order so canvas is ready before any erase operation
- Show user-friendly toast message when word contains no kanji
- Maintain existing functionality for words with kanji

**Non-Goals:**
- Change core canvas functionality (KanjiCanvas library)
- Add new kanji recognition features

## Decisions

### 1. Initialize Canvas First
**Decision**: Call `KanjiCanvas.init('practiceCanvas')` before processing kanji list

**Rationale**: The canvas must be initialized (setting up context, event listeners, etc.) before any draw/erase operation. Moving init before the kanji processing ensures the canvas is ready.

**Alternative considered**: Call erase() only after init - but this requires tracking init state. Moving init earlier is cleaner.

### 2. Toast Message for No Kanji
**Decision**: Show toast "No kanji found in this word" when `practiceKanjiList.length === 0`

**Rationale**: User should know why the modal isn't working as expected. Provides feedback instead of silent failure.

## Risks / Trade-offs

- **Risk**: Breaking change to existing flow → **Mitigation**: Minimal change, only reorders existing calls
- **Risk**: API call failing for kanji → **Mitigation**: Already handled with fallback to original romaji

## Open Questions

- None - the fix is straightforward
