## Context

The flashcard game currently uses a fixed-height card-scene (260px desktop, 200px mobile) that doesn't adapt to available screen space. The screen uses flexbox layout but the flashcard container doesn't utilize available space efficiently.

Current structure:
```
#screen-flash (flex column)
  └── .game-hud (fixed ~50px)
  └── .flash-container (constrained with max-width: 500px, fixed gap)
        ├── .card-scene (fixed height: 260px)
        ├── .flash-actions (hidden/visible)
        └── .flash-progress (fixed)
```

## Goals / Non-Goals

**Goals:**
- Card-scene fills available vertical space using flexbox
- Responsive behavior: larger on desktop, smaller on mobile
- Maintain minimum card size for usability
- Keep maximum card size to prevent overly large cards on large displays
- No breaking changes to functionality

**Non-Goals:**
- Changing card flip animation or visual design
- Modifying the card content/layout (front/back faces)
- Adding new game features

## Decisions

### Decision 1: Flexbox approach vs calc() with viewport units

**Chosen:** Flexbox approach
- `.flash-container` uses `flex: 1` to fill available space
- `.card-scene` uses `flex: 1` to expand within container
- Relies on parent flex container for natural responsiveness

**Alternative considered:** Use `calc(100vh - Xpx)` with viewport units
- More rigid, harder to maintain when HUD/changes occur
- Flexbox adapts automatically to content changes

### Decision 2: Min/max height constraints

**Chosen:** 
- `min-height: 200px` - ensures card never gets too small
- `max-height: 450px` - prevents card from becoming overly large on big displays

**Rationale:**
- Mobile screens (~360-430px width): 200px min is ~50% of usable height - appropriate
- Desktop: 450px max keeps card readable without excessive scrolling
- The values can be adjusted if user feedback indicates issues

## Risks / Trade-offs

- **Risk:** Card might be too large on tablets in landscape mode
  - **Mitigation:** max-height 450px caps the size

- **Risk:** On very short screens (old phones), card might push other elements off
  - **Mitigation:** min-height provides lower bound; flash-progress and actions have fixed sizes

- **Trade-off:** Removing max-width: 500px means card can be wider on desktop
  - **Benefit:** Better use of wide screens
  - **Consideration:** Could make card awkwardly wide - max-width: 600px might be better (will test in implementation)