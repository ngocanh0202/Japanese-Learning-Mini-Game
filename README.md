# 日本語 QUEST — Japanese Learning Mini-Games

> 🎮 A retro-arcade styled web app for learning Japanese vocabulary. Built with pure HTML/CSS/JavaScript — no frameworks, no build tools.

## ✨ Features

### 🕹️ 5 Mini-Games

| Game | Description |
|------|-------------|
| 📝 **Quiz** | Multiple-choice questions with timer & combo system |
| 🎧 **Listening Quiz** | Hear Japanese words via TTS, pick the correct reading |
| ⌨ **Falling Words** | Type romaji before words hit the ground |
| 🧩 **Match** | Pair Japanese words with correct readings/translations |
| 🃏 **Flashcard** | Flip cards, mark Known/Unknown for spaced review |

### 🧠 Smart Learning System

- **Priority-based question selection** — questions you struggle with appear more often
- **Adjustable weights**: Incorrect Answer, Time Since Seen, Learning Effect
- **Per-game settings override** — customize difficulty per game mode
- **Progress tracking** — HP, EXP, Level, Combo system persisted in localStorage

### 📦 Data Management

- Import/Export question sets as JSON
- Multiple question sets support (create, rename, delete, switch)
- Search & preview questions
- Built-in sample data (Vietnamese → Japanese)
- Bulk replace or append import modes

### ⚙️ Customizable Settings

- Timer options (10s–60s per question)
- Game speed controls (Slow/Medium/Fast)
- Scanlines overlay toggle
- Animation toggle
- HP/Game Over disable option

## 🚀 How to Run

### Option 1: Direct Open

Simply open `index.html` in any modern browser.

### Option 2: Static Server

```bash
python -m http.server
```

Then visit `http://localhost:8000`

**No installation, no dependencies, no build step.**

## 🏗️ Architecture

```
index.html          ← Single-page app, all screens
style.css           ← Retro arcade theme (1190 lines)
main.js             ← Core: state, navigation, storage, utilities
data.js             ← Sample question data
game-quiz.js        ← Multiple choice quiz
game-listen.js      ← TTS-based listening quiz
game-flash.js       ← Flashcard game
game-match.js       ← Match pairs game
game-type.js        ← Falling words typing game
lib/wanakana.min.js ← Japanese input library
```

## 📝 Question Data Format

```json
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

| Field | Description |
|-------|-------------|
| `word` | Japanese word/kanji |
| `romaji` | Reading (hiragana/katakana/romaji) |
| `translation` | Vietnamese translation |
| `q` | Question text |
| `a` | Array of answer options |
| `c` | Correct answer index (0-based) |
| `ex` | Explanation shown after answering |

## 🎨 Design

- **Theme**: Retro arcade with scanlines, neon glow, pixel font
- **Fonts**: Press Start 2P (headers), Noto Sans JP (Japanese text)
- **Background**: Animated starfield (Canvas)
- **Responsive**: Desktop-first with 150% zoom on large screens

## 🌐 Browser Support

- Chrome/Edge (recommended — full TTS support)
- Firefox
- Safari (TTS may vary)

## 📖 Adding Your Own Questions

1. Open the app → **DATA MANAGEMENT**
2. Click **IMPORT** and paste your JSON array
3. Choose **Replace** or **Append**
4. Or load **SAMPLE DATA** to get started

## 🛠️ Tech Stack

- **HTML5** — Semantic structure, Canvas API
- **CSS3** — Custom properties, animations, responsive design
- **Vanilla JavaScript** — No frameworks, no bundlers
- **Web Speech API** — Text-to-Speech for listening quiz
- **WanaKana** — Japanese input/romanization library
- **localStorage** — Persistent player data & settings

## 📄 License

MIT

## 🙏 Credits

- [WanaKana](https://github.com/WaniKani/WanaKana) — Japanese input library
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) — Pixel font
- [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP) — Japanese font
