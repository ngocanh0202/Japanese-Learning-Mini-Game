## Context

The Japanese Learning Mini-Game currently has a typing-based "Writing Practice" game (game-write.js) where users type Japanese characters on keyboard. The user requested replacing this with a canvas-based drawing practice using stroke recognition.

### Current State
- game-write.js: Typing-based game where user types the Japanese word
- Input: Text field with keyboard input
- No canvas drawing support

### Target State
- Canvas-based drawing where users draw characters using mouse/touch
- Stroke recognition using KanjiCanvas library
- Fallback to typing when recognition fails

### Constraints
- Vanilla HTML/CSS/JS project (no build system)
- Client-side only (no server)
- Must support hiragana, katakana, and kanji
- Mobile touch support needed

## Goals / Non-Goals

**Goals:**
- Implement canvas-based Japanese character drawing practice
- Use KanjiCanvas library for stroke recognition
- Support flexible matching (top 3 candidates = correct)
- Add automatic fallback to typing mode when character not recognized
- Maintain same game flow and scoring system

**Non-Goals:**
- Complex stroke order validation (KanjiCanvas handles this)
- Server-side recognition
- Offline support (requires cached library)

## Decisions

### 1. Library Selection: KanjiCanvas

**Decision:** Use KanjiCanvas (https://github.com/asdfjkl/kanjicanvas) for stroke recognition

**Alternatives Considered:**
- **Hanzi Writer** (Chinese-focused, less suitable for Japanese)
- **Custom stroke matching** (too complex to implement from scratch)
- **TensorFlow.js** (overkill for this use case, requires model files)

**Rationale:** KanjiCanvas is:
- Client-side only (no server needed)
- Already supports hiragana, katakana, and kanji
- Tolerant of wrong stroke order (great for beginners)
- Lightweight (~200KB with reference patterns)

### 2. Recognition Mode: Top 3 Candidates

**Decision:** Accept if target character appears in top 3 recognition candidates

**Alternatives:**
- Top 1 only (too strict, frustrating for users)
- Top 5 (too lenient, incorrect matches possible)

**Rationale:** Balance between accuracy and user experience. Top 3 is flexible enough for beginners while still requiring a reasonable drawing.

### 3. Fallback Strategy: Typing Input

**Decision:** Show typing input when KanjiCanvas cannot recognize the character or returns no candidates

**Implementation:**
- After user draws and clicks "Check"
- If no match in top 3 → show "Not recognized? Type answer instead"
- Display typing input alongside canvas
- User can switch between drawing and typing

### 4. Canvas Size: 256x256

**Decision:** Use 256x256 pixel canvas

**Alternatives:**
- 128x128 (too small for detailed kanji)
- 512x512 (too large, impacts performance)

**Rationale:** Standard size used by KanjiCanvas demo, good balance of detail and performance.

### 5. Drawing Tools: Erase + Undo + Check

**Decision:** Provide three controls

**Rationale:**
- **Erase**: Clear entire canvas (common action)
- **Undo**: Remove last stroke (fix mistakes without clearing all)
- **Check**: Submit drawing for recognition (main action)

## Risks / Trade-offs

### Risk: Limited Character Coverage
**[Problem]** KanjiCanvas has pre-built patterns for ~300 characters. Custom words in user's data.js may not be recognized.

**Mitigation:** Implement fallback to typing mode automatically when target character is not in the library's reference patterns. Check if character is supported before showing canvas-only mode.

### Risk: Mobile Touch Support
**[Problem]** Canvas drawing may not work on touch devices without specific event handling.

**Mitigation:** KanjiCanvas handles touch events natively. Test on mobile browsers. Add touch-action: none CSS to prevent scrolling while drawing.

### Risk: Drawing Quality Recognition
**[Problem]** Users may draw poorly and get incorrect recognition, leading to frustration.

**Mitigation:** 
- Use top 3 matching (flexible)
- Show reference character prominently as guide
- Clear visual feedback on recognition results
- Easy fallback to typing

### Risk: Library Not Loading
**[Problem]** External CDN or local library file may fail to load.

**Mitigation:** 
- Bundle kanji-canvas.min.js locally in lib/ folder
- Add error handling with user-friendly message
- Fallback to typing-only mode if library fails to load

### Trade-off: Scoring Balance
**[Problem]** Drawing is harder than typing, but we don't want to make it too easy with low XP.

**Mitigation:** 
- Base XP: 8 (vs typing's 5) - higher difficulty
- Combo multiplier: 1.5x (same as other games)
- Recognition tolerance: Top 3 candidates = correct (not just top 1)

## Migration Plan

1. **Phase 1: Library Integration**
   - Download kanji-canvas.min.js to lib/
   - Add script to index.html
   - Verify library loads correctly

2. **Phase 2: UI Implementation**
   - Add canvas element to screen-write
   - Add control buttons (erase, undo, check)
   - Style canvas and controls

3. **Phase 3: Game Logic**
   - Rewrite game-write.js with canvas logic
   - Implement recognition flow
   - Add fallback to typing

4. **Phase 4: Testing**
   - Test with various characters
   - Test fallback mechanism
   - Test mobile touch

5. **Phase 5: Polish**
   - Update practice modal
   - Add instructions for users
   - Verify scoring is balanced

## Open Questions

1. **Character Coverage Check**: Should we pre-check if all words in data.js are supported by KanjiCanvas, or discover at runtime?

2. **Practice Modal vs Full Game**: Should both the full writing game AND the practice modal use canvas, or just one?

3. **Stroke Animation**: Should we show stroke order animation as reference before user draws? (Using animCJK library)
