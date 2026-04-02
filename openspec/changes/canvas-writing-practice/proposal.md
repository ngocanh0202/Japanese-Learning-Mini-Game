## Why

The current "Writing Practice" game (game-write.js) is a typing-based game where users type Japanese characters on keyboard. The user explicitly requested a **canvas-based drawing practice** where users draw Japanese characters (hiragana, katakana, kanji) using mouse/touch on a canvas, with stroke recognition to validate their drawing. This provides a more authentic handwriting practice experience for learning Japanese characters.

## What Changes

- **Replace** the current typing-based writing game with canvas-based drawing system
- **Add** KanjiCanvas library for stroke recognition
- **Create** new canvas drawing UI with erase/undo/check controls
- **Implement** stroke recognition with flexible matching (top 3 candidates)
- **Add** fallback to typing input when recognition fails
- **Update** practice modal to use canvas drawing instead of text input

## Capabilities

### New Capabilities

- `canvas-drawing`: Canvas-based Japanese character drawing practice with stroke recognition
- `drawing-fallback`: Automatic fallback to typing mode when character is not recognized by the library
- `stroke-recognition`: Real-time stroke analysis using KanjiCanvas library

### Modified Capabilities

- `writing-game`: The existing writing-game capability will be completely reimplemented to use canvas drawing instead of typing

## Impact

- **New Files**: `lib/kanji-canvas.min.js`
- **Modified Files**: `index.html`, `style.css`, `game-write.js`
- **Dependencies**: KanjiCanvas library (client-side only, no server)
- **Breaking**: Current typing-based writing game replaced with canvas version
