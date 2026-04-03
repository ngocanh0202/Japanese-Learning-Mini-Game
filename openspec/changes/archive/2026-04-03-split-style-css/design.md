## Context

The project has a single `style.css` file (1712 lines) containing all styles. This includes:
- CSS variables and global resets
- Animations and transitions
- Background effects (stars, scanlines)
- Screen base styles
- Menu, settings, modal, data-table styles
- Game-specific styles (quiz, flashcard, typing, match)
- Game over, toast, combo popup styles
- Stats screen, firebase config, import section
- Responsive media queries

## Goals / Non-Goals

**Goals:**
- Split style.css into modular files by functional area
- Create a main style.css that imports all modular files
- Maintain identical visual output - no CSS changes, only file organization
- Keep all CSS files in project root (not subdirectories)

**Non-Goals:**
- Add any new CSS features or fix bugs
- Change the visual design
- Add CSS preprocessor (Sass, Less) - keep plain CSS
- Optimize CSS delivery (keep simple @import for now)

## Decisions

### 1. File Splitting Strategy
Decision: Split by functional area/game component rather than alphabetical or arbitrary划分.

Rationale: Makes it easy to find styles for a specific feature. Developers working on "typing game" know to look in `game-type.css`.

### 2. Main File Approach
Decision: Replace original style.css with a file containing only @import statements.

Rationale: Maintains backward compatibility - `index.html` still references `style.css`. No changes needed to HTML.

### 3. Import Order
Decision: Import in this order: variables → reset → base → animations → components → screens → games → responsive

Rationale: CSS cascade - variables first, then base, then specific components. Responsive last so it can override.

### 4. File List
| File | Content |
|------|---------|
| `variables.css` | :root CSS custom properties |
| `reset.css` | Global reset, scrollbar styles |
| `animations.css` | Keyframes and transitions |
| `background.css` | Stars background, scanlines |
| `screens.css` | Base .screen class |
| `menu.css` | Main menu styles |
| `settings.css` | Panel, settings, forms |
| `modal.css` | Modal overlays |
| `data-table.css` | Question list table |
| `game-hud.css` | Game HUD, HP bar |
| `game-quiz.css` | Quiz game |
| `game-flash.css` | Flashcard game |
| `game-type.css` | Typing + Match game |
| `game-over.css` | Game over overlay |
| `toast.css` | Toast notifications, combo popup |
| `stats.css` | Stats screen |
| `firebase.css` | Firebase config section |
| `import.css` | Import section |
| `responsive.css` | All media queries |

## Risks / Trade-offs

- **Risk**: Accidentally breaking CSS during split
  - **Mitigation**: Verify visually after implementation - compare before/after screenshots if needed
  
- **Risk**: Import order causing style conflicts
  - **Mitigation**: Follow established CSS cascade; test in multiple browsers

- **Risk**: Long-term - too many small files
  - **Mitigation**: Re-evaluate if file count grows beyond 25; can always merge adjacent files later

## Migration Plan

1. Create all 19 new CSS files in project root
2. Copy content from original style.css to appropriate new files
3. Replace original style.css with @import statements
4. Test in browser - verify no visual changes
5. Remove original monolithic file after verification

## Open Questions

- None - the splitting strategy is clear and straightforward