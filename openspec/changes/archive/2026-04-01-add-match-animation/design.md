## Context

The match game (`game-match.js`) is a vanilla JavaScript card matching game where players flip cards to find matching pairs. Each card has a `matched` state and a `revealed` state. The CSS already defines a `.match-animation` class with a `matchSuccess` keyframe animation (0.6s duration), but the game logic never applies this class.

Current card object structure:
```javascript
{
  cardId: string,
  pairId: number,
  kind: 'word' | 'label',
  text: string,
  revealed: boolean,
  matched: boolean
}
```

The `renderMatchBoard()` function re-renders all cards from the `matchCards` array on each state change.

## Goals / Non-Goals

**Goals:**
- Add visual feedback animation when two cards are successfully matched
- Use existing CSS `match-animation` class (no CSS changes needed)
- Animation should play for 600ms then be removed
- Cards should remain visually "matched" after animation completes

**Non-Goals:**
- No changes to CSS animations or keyframes
- No changes to mismatch/wrong animation behavior
- No changes to card data structure beyond adding `animating` flag
- No changes to game logic, scoring, or timer

## Decisions

**1. Add `animating` boolean property to card objects**
- Rationale: Simple state tracking that integrates with existing render cycle
- Alternative: Track animating cards in a separate array → More complex, unnecessary
- Alternative: Use DOM classList directly → Breaks single-source-of-truth pattern

**2. Use setTimeout matching CSS animation duration (600ms)**
- Rationale: Matches existing CSS `matchSuccess` animation timing
- Alternative: Listen for `animationend` event → More complex, potential cross-browser issues
- Alternative: Fixed delay then re-render → Simple and reliable

**3. Apply animation before marking cards as matched in UI**
- Rationale: Animation provides visual feedback, then cards settle into matched state
- Flow: Match found → Set `animating=true` → Re-render → setTimeout → Set `animating=false` → Re-render

## Risks / Trade-offs

**[Risk]** Animation re-render might cause flicker if setTimeout fires during user interaction
→ **Mitigation:** Animation only plays on matched cards which are immediately disabled; no user interaction possible on those cards

**[Risk]** setTimeout timing might drift if game is under heavy load
→ **Mitigation:** 600ms is short enough that drift is imperceptible; animation CSS already handles the visual timing

**[Trade-off]** Adding `animating` property increases card object size slightly
→ **Acceptable:** Negligible memory impact for 12 cards max (6 pairs × 2 cards)
