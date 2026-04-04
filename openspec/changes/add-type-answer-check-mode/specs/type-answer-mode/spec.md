# Spec: Type Answer Check Mode

## Goal

Add ability to check falling word input against answer options (`word.a[word.c]`) instead of just romaji in game-type.

## Requirements

### 1. Setting Option (HTML)
Add dropdown in Settings screen under "Game 3 - FALLING WORDS":
- ID: `type-compare-mode`
- Options:
  - `romaji` - Check against romaji (default)
  - `answer` - Check against answer from question

### 2. Default Settings (js/main.js)
Add to default settings object:
```javascript
typeAnswerMode: 'romaji'
```

### 3. Settings Load/Save (js/settings.js)
- Load: Set select value from `settings.typeAnswerMode`
- Save: Read select value and save to settings

### 4. Game Logic (js/games/game-type.js)

#### 4.1 Mode Label
Update `getTypeModeLabel()` to show current mode:
- Romaji mode: "Slow (Romaji)"
- Answer mode: "Slow (Answer)"

#### 4.2 Input Check
Modify `onTypeInput()` to check based on mode:

```javascript
const target = fallingWords[0];
let compareValue;

if (settings.typeAnswerMode === 'answer') {
  // Get correct answer from a[c]
  compareValue = target.a && typeof target.c === 'number' 
    ? target.a[target.c] 
    : target.romaji; // Fallback
} else {
  compareValue = target.romaji;
}

// Compare with input
const inputLower = val.trim().toLowerCase();
const compareLower = compareValue.trim().toLowerCase();

if (inputLower === compareLower) {
  // Correct
}
```

## Data Structure

Question object format:
```javascript
{
  "word": "学生",
  "romaji": "がくせい",
  "translation": "Học sinh",
  "q": "Cách đọc của '学生' là gì?",
  "a": ["がくせい", "がくぜい", "がっせい", "かくせい"],
  "c": 0,
  "ex": "学生 (Học sinh). Học (学) + Sinh (生)."
}
```

- `a` = array of answer options
- `c` = index of correct answer
- `a[c]` = correct answer string (e.g., "がくせい")

## Implementation Files

| File | Changes |
|------|---------|
| `index.html` | Add select option in Settings |
| `js/main.js` | Add `typeAnswerMode` to defaults |
| `js/settings.js` | Add load/save for the setting |
| `js/games/game-type.js` | Update mode label and input check logic |

## Acceptance Criteria

1. Setting appears in Settings with two options
2. "Romaji" mode works as before (default)
3. "Answer" mode checks against `word.a[word.c]`
4. If question lacks `a` or `c`, falls back to romaji
5. Mode label updates to show current mode
6. Setting persists across sessions
