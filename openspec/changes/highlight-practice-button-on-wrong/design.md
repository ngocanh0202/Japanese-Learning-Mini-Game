## Context

The Practice button (✍️ Practice) exists in both screen-quiz and screen-listen, positioned at the bottom-right corner of the question card. Currently:
- Button is always visible during questions
- When user answers incorrectly, the button remains visible but has no visual distinction from the correct answer state
- No animation or highlight draws attention to it when the user needs to practice

## Goals / Non-Goals

**Goals:**
- Add red highlight with pulse animation to Practice button when user answers incorrectly
- Apply the same behavior to both screen-quiz and screen-listen for consistency
- Ensure highlight is visually prominent but not distracting

**Non-Goals:**
- Change when the Practice button appears (it remains always visible)
- Add this feature to other game screens (flash, match, type, write)
- Modify the Practice modal functionality

## Decisions

### 1. CSS Location
**Decision:** Add styles to `css/base.css` (shared styles)

**Rationale:** Since both quiz and listen use the same Practice button feature, a shared CSS location makes maintenance easier. The base.css file already contains common utility classes.

**Alternative considered:** Adding to individual game CSS files (game-quiz.css, game-listen.css) - rejected because it would duplicate code.

### 2. Highlight Animation Style
**Decision:** Red border with pulse animation using box-shadow

**Rationale:** 
- Red aligns with the "wrong answer" visual language already used (red borders, error toasts)
- Pulse animation draws attention without being overwhelming
- Box-shadow glow effect is more visible than border alone

**Alternative considered:** Background color only - rejected as less visible
**Alternative considered:** Border + background without animation - rejected as less attention-grabbing

### 3. Implementation Approach
**Decision:** Add CSS class via JavaScript when wrong answer is detected

**Rationale:** The existing code already handles wrong answer logic in both games. Adding a single class toggle is minimal and maintainable.

## Risks / Trade-offs

- **Risk:** User might find pulse animation distracting → **Mitigation:** Animation is subtle (1 second cycle) and stops after user clicks Practice
- **Risk:** Highlight might not be visible on all themes → **Mitigation:** Using CSS custom properties (var(--accent)) ensures theme compatibility
