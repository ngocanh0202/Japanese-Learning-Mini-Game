## Context

The Japanese Learning Mini-Game app has a UI designed primarily for mobile screens. On desktop screens (≥1024px), the UI appears too small, making it difficult to use. 

The app previously used CSS `zoom: 150%` on desktop to scale up the entire page, but this broke the KanjiCanvas drawing functionality because the canvas event coordinates became misaligned with the actual drawing surface.

## Goals / Non-Goals

**Goals:**
- Scale all UI elements (fonts, widths, spacing) by 125% on desktop screens
- Maintain mobile responsiveness (no changes on screens < 768px)
- Preserve all existing functionality (especially KanjiCanvas)
- Improve readability and usability on desktop

**Non-Goals:**
- Add new game features
- Change color scheme or visual design
- Improve canvas drawing (handled separately)
- Add accessibility features (future work)

## Decisions

### Decision 1: Scale Factor
**Choice:** 125% scale (not 150%)
**Rationale:** 125% provides a good balance between readability and fitting content on screen. 150% was too aggressive and contributed to the zoom issue.

### Decision 2: Implementation Method
**Choice:** Direct CSS value increases, not CSS scale/transform
**Rationale:** 
- Simpler than transform:scale() which has overflow issues
- More reliable than zoom which breaks canvas coordinate calculation
- Each element scales proportionally

### Decision 3: Scaling Targets
**Choice:** Scale fonts, max-widths, and padding together
**Rationale:** Proportional scaling ensures visual harmony. Scaling only fonts would create mismatched layouts.

## Risks / Trade-offs

### Risk: Mobile Layout Breakage
**Mitigation:** Use `@media (min-width: 1024px)` to only apply scaling on desktop. Mobile remains unchanged.

### Risk: Inconsistent Scaling
**Mitigation:** Use CSS variables for base values where possible, apply consistent multipliers.

### Risk: Performance Impact
**Mitigation:** None - purely static CSS changes, no runtime performance impact.

## Migration Plan

1. Modify `css/variables.css` - adjust base font sizes
2. Update all CSS files with new font-size values
3. Update max-width values in all containers
4. Adjust padding where needed for visual balance
5. Remove/adjust zoom logic in `js/main.js`
6. Test on both desktop and mobile

## Open Questions

1. Should we keep the zoom option in settings? - No, remove completely for simplicity
2. What about very large screens (≥1440px)? - Use same 125% scaling, sufficient for most displays
