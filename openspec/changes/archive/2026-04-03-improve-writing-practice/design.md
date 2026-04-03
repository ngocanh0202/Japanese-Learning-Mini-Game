## Context

The Writing Practice feature in this Japanese learning mini-game needs improvements:
1. **No word count** - Users don't see how many kanji they'll practice
2. **Inaccurate readings** - JSON data has romaji field which may be inaccurate
3. **Single kanji limitation** - Practice modal only handles one word at a time

Current flow: Quiz/Listen → Wrong answer → Click "Practice" → Modal opens for that word

## Goals / Non-Goals

**Goals:**
- Display kanji count in Writing game HUD
- Fetch accurate readings from kanjiapi.dev API
- Support multi-kanji words with pagination in Practice modal
- Auto-advance to next kanji after correct answer

**Non-Goals:**
- Change Writing game core gameplay
- Add offline support for API (cache is already planned)
- Support other languages (keep Vietnamese meaning from JSON)

## Decisions

### 1. API Choice: kanjiapi.dev over jisho.org
- **Rationale**: kanjiapi.dev is simpler, no API key needed, returns structured JSON with kun/yomi readings
- **Alternative considered**: jisho.org - more comprehensive but rate-limited and more complex response

### 2. Caching Strategy: localStorage with key prefix
- **Rationale**: Simple, persistent across sessions, no external dependencies
- **Key**: `jq_kanji_cache` - stores `{ "学": { data }, "生": { data } }`
- **Alternative considered**: sessionStorage - would lose cache on tab close

### 3. Multi-Kanji Modal: Pagination over scroll
- **Rationale**: Clear UX, user controls pace, easier to implement
- **Alternative considered**: Scroll - harder to handle canvas state between kanji

### 4. Auto-Advance: 1 second delay then next kanji
- **Rationale**: Allows user to see the success feedback before moving on
- **Alternative considered**: Immediate - too jarring, no closure on correct answer

## Risks / Trade-offs

- **[Risk] API unavailable** → Use fallback: show original romaji from JSON if API fails
- **[Risk] Cache size** → localStorage limited to ~5MB, each kanji ~500 bytes, can cache ~10,000 kanji - acceptable
- **[Risk] Rate limiting** → kanjiapi.dev has no documented rate limit, but we cache to minimize requests

## Open Questions

- None - all decisions are clear based on requirements
