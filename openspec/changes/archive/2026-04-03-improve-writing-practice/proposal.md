## Why

The Writing Practice game currently lacks word count display, uses JSON romaji data (sometimes inaccurate), and the Practice modal doesn't support multi-kanji words. When users answer incorrectly in Quiz/Listen games, they can click "Practice" but it's limited to single-word practice without pagination for words containing multiple kanji.

## What Changes

- **UI Enhancement**: Add word count display to Writing game HUD showing total unique kanji to practice
- **API Integration**: Fetch accurate kanji readings (kun/yomi) from kanjiapi.dev while keeping Vietnamese meaning from JSON data
- **Multi-Kanji Modal**: Support pagination (1/2, 2/2) for words with 2+ kanji, auto-advance after correct answer
- **Improved Practice Flow**: Quiz and Listen games pass full word data to modal, letting it handle kanji extraction and pagination

## Capabilities

### New Capabilities
- **kanji-api-cache**: Fetch kanji readings from kanjiapi.dev with localStorage caching to avoid repeated API calls
- **multi-kanji-practice**: Practice modal supports multiple kanji with navigation (prev/next) and auto-advance after correct answer

### Modified Capabilities
- (none - this is a new feature addition, not changing existing behavior)

## Impact

- **Files modified**: `index.html`, `game-write.js`, `game-quiz.js`, `game-listen.js`
- **External dependencies**: kanjiapi.dev (free API, no key required)
- **Storage**: New localStorage key `jq_kanji_cache` for caching API responses
- **Breaking changes**: None
