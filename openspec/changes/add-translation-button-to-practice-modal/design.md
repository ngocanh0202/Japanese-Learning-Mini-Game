## Context

The Practice Writing Modal (`renderPracticeKanjiPage()`) currently:
1. Fetches kanji data from kanjiapi.dev API (includes `meanings` array with English definitions)
2. But displays `practiceWriteTranslation` (Vietnamese from JSON) instead of English from API

The kanjiapi.dev response includes:
```json
{
  "meanings": ["learning", "science", "study"],
  "kun_readings": ["まな.ぶ"],
  "on_readings": ["ガク"]
}
```

## Goals / Non-Goals

**Goals:**
- Display English meaning from kanjiapi.dev (`data.meanings[0]`) in the Meaning field
- Add "🌐 VI" button next to Meaning label
- Translate to Vietnamese when button is clicked using MyMemory API

**Non-Goals:**
- Change Readings display (already working correctly from API)
- Add translation for main Writing game (only practice modal)
- Add offline translation cache

## Decisions

### 1. MyMemory API for Translation
**Decision**: Use MyMemory Translation API

**Rationale**:
- Free, no API key required
- Simple GET request: `https://api.mymemory.translated.net/get?q={text}&langpair=en|vi`
- Returns JSON with `responseData.translatedText`
- 5000 chars/day limit is sufficient for this use case

**Alternative considered**: Google Translate API - requires API key, not suitable

### 2. Button Placement
**Decision**: Add button inline next to "Meaning" label

**UI Layout**:
```
┌─────────────────────────────────┐
│  Meaning    [English] [🌐 VI]  │
│  Read       kun, on             │
└─────────────────────────────────┘
```

### 3. Error Handling
**Decision**: Show toast error if translation fails, keep English meaning

**Rationale**: User can still see English meaning even if translation API fails

## Risks / Trade-offs

- **[Risk] API rate limit** → MyMemory has 5000 chars/day limit, should be fine for typical usage
- **[Risk] Translation quality** → MyMemory is decent for basic translations, but not perfect
- **[Risk] Network failure** → Show error toast, keep English meaning visible

## Open Questions

- None - all implementation details are clear
