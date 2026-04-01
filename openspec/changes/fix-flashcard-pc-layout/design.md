## Context

After implementing the flashcard-fullscreen change (using flexbox to expand card-scene), the flashcard component on PC displays with an overly large card that causes layout issues when flipping. The container has no max-width constraint on desktop, allowing the card to expand to fill the entire screen width.

Current state:
- Mobile: Works well with full-width flex layout
- Tablet: Works reasonably
- Desktop: Card too large, causes flip animation/layout issues

## Goals / Non-Goals

**Goals:**
- Constrain flashcard width on desktop (PC) screens to max 550px
- Constrain flashcard height on desktop to max 380px
- Maintain full-width behavior on mobile and tablet
- Fix flip card layout issue on PC

**Non-Goals:**
- Changing visual design or colors
- Modifying card content/layout (front/back faces)
- Adding new functionality
- Affecting mobile/tablet behavior

## Decisions

### Decision 1: Breakpoint selection

**Chosen:** min-width: 769px for desktop

**Rationale:**
- Existing breakpoints: 480px (mobile), 768px (tablet)
- Using 769px ensures tablet (481-768px) gets mobile behavior
- Standard desktop range starts at 1024px, but many laptops are 1366px - 769px covers both

### Decision 2: max-width: 550px for container

**Chosen:** 550px width constraint

**Rationale:**
- Previous max was 500px - slight increase for better UX
- 550px fits comfortably on most laptop screens (1366px width)
- Leaves padding room on both sides
- Maintains readability of card content

### Decision 3: max-height: 380px for card-scene

**Chosen:** 380px height constraint

**Rationale:**
- Previous desktop height was 260px (fixed)
- 380px provides more space than before while preventing overflow
- Leaves room for flash-actions buttons below
- Balances between usable card size and preventing over-expansion

## Risks / Trade-offs

- **Risk:** Users with very large monitors (4K, ultra-wide) might want wider cards
  - **Mitigation:** 550px is reasonable for readability; users can zoom if needed

- **Risk:** Laptop in landscape mode (e.g., 1366x768) might have different effective height
  - **Mitigation:** min-height: 200px ensures minimum usable size

- **Trade-off:** Slight inconsistency between mobile/tablet and desktop behavior
  - **Benefit:** Optimized experience for each form factor
  - **Consideration:** Standard practice in responsive design