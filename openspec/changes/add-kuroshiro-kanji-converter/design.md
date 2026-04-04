## Context

The Japanese Learning Mini-Game uses wanakana library for text conversion in game-type.js. Currently, when displaying falling words in "answer" mode, wanakana cannot convert kanji characters to hiragana - it only handles romaji and katakana. This causes questions with kanji answers (e.g., "会って" should become "あって") to display incorrectly.

## Goals / Non-Goals

**Goals:**
- Convert kanji + katakana + romaji to hiragana accurately for display
- Maintain existing game functionality while improving conversion accuracy
- Use browser-friendly library without complex build requirements

**Non-Goals:**
- Convert to katakana or romaji (only hiragana needed)
- Implement in other games (quiz, flash, match) - only game-type needs this for now

## Decisions

### 1. Library Selection: kuroshiro-browser
**Decision:** Use kuroshiro-browser from jsdelivr CDN

**Alternatives considered:**
- **kuroshiro + kuromoji separately**: Requires loading dictionary files, more complex setup
- **wanakana only**: Cannot convert kanji - current problem
- **其他 libraries**: kuroshiro is the most mature browser solution

**Rationale:** kuroshiro-browser bundles everything (kuroshiro + kuromoji analyzer) in one JS file, works directly in browser without additional dictionary downloads.

### 2. Async Handling Strategy
**Decision:** Cache converted hiragana results and handle async in spawnWord()

**Rationale:** 
- kuroshiro.convert() is async, but game loop runs continuously
- Pre-convert hiragana when spawning words, store in word object
- For input comparison, use cached targetHiragana

### 3. Initialization Order
**Decision:** Initialize kuroshiro after DOMContentLoaded, before first game starts

**Rationale:**
- Need DOM ready before initializing
- kuroshiro init is async, but we can start game even if not ready (fallback to wanakana)

## Risks / Trade-offs

- **[Risk] kuroshiro init time** → If dictionary is large, first conversion might be slow
  - **Mitigation:** Cache results, show loading state during init
  
- **[Risk] CDN dependency** → If CDN is down, conversion fails
  - **Mitigation:** Fallback to wanakana if kuroshiro not initialized

- **[Risk] Async vs Sync API mismatch** → Code was designed for sync wanakana
  - **Mitigation:** Pre-convert on spawn, store hiragana in word object
