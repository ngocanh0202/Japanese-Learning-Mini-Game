## Why

The Japanese QUEST application has accumulated significant technical debt and feature requests. The main.js file has grown to 2000+ lines making maintenance difficult. Players need better learning tools (response time tracking, writing practice, daily streaks) and the leveling system is too fast. Several UI inconsistencies and bugs need fixing.

## What Changes

- **Refactor main.js** into 5 focused modules (storage, settings, game-utils, data-manager, main) reducing main.js from 2000+ to ~400 lines
- **Add response time tracking** to priority system — slow correct answers (8s+) count as "not yet mastered"
- **Fix settings screen UI** — left-align labels, right-align checkboxes, convert all to toggle-switch style
- **Fix scroll/overflow bug** on screen-settings and screen-data where hidden content affects layout
- **Add shuffle answer options** setting (default ON) to prevent memorizing answer positions
- **Add typing game comparison mode** — choose romaji vs Japanese word input (with warning banner)
- **Add new writing practice game** — practice typing Japanese characters from translation hints
- **Add practice writing prompt** after wrong answers in quiz/listen (inline modal)
- **Change game completion messaging** — "Complete" vs "Game Over" based on finish reason
- **Rebalance leveling system** — 5x more XP needed, progressive curve (1.2x per level)
- **Make match game difficulty configurable** — 4-12 pairs (was hardcoded to 6)
- **Fix session history** — only record completed games, not early exits
- **Add daily streak tracking** — 5min+ play per day, display in menu

## Capabilities

### New Capabilities
- `module-architecture`: Split monolithic main.js into focused modules with clear boundaries
- `response-time-tracking`: Track answer response times and use in priority scoring
- `writing-practice-game`: New game mode for practicing Japanese character input
- `inline-writing-modal`: Modal-based writing practice triggered from wrong answers
- `daily-streak`: Track consecutive days of 5min+ gameplay
- `shuffle-answers`: Randomize answer option order with correct index recalculation
- `typing-compare-mode`: Configurable comparison target for falling words game
- `match-difficulty`: Configurable pair count for match game
- `completion-messaging`: Distinguish between completed and failed game endings
- `level-rebalance`: Progressive XP curve for slower leveling
- `session-history-fix`: Only record sessions when games complete

### Modified Capabilities
- `question-priority`: Add `slowResponse` weight and response time data to priority scoring
- `settings-ui`: Convert all settings to toggle-switch style, fix layout issues
- `game-over`: Change modal title and toast messaging based on completion reason

## Impact

**Files modified:** main.js, game-quiz.js, game-listen.js, game-match.js, game-flash.js, game-type.js, index.html, style.css

**Files created:** storage.js, settings.js, game-utils.js, data-manager.js, game-write.js

**Breaking changes:** None — all changes are additive or internal refactoring. Script load order in index.html changes to accommodate new modules.

**LocalStorage:** New keys added (`jq_daily_streak`, `jq_question_stats` gains new fields). Existing keys remain compatible.
