## Why

Hiện tại tất cả các game (quiz, listen, flash, match, type) đều chọn câu hỏi ngẫu nhiên hoàn toàn, không có cơ chế ưu tiên. Người học có thể gặp đi gặp lại những câu đã thuộc hoặc ít khi được ôn lại những câu hay sai. Cần một hệ thống smart prioritization để tối ưu việc học.

## What Changes

- Thêm `gameStats` vào mỗi question object để track lịch sử trả lời cho từng game
- Thay đổi cách shuffle thành weighted shuffle dựa trên priority score
- Thêm global settings để điều chỉnh trọng số (incorrect, time since seen, learning effect)
- Thêm per-game settings cho phép override global weights
- Lưu stats vào localStorage để persist qua sessions
- Khi trả lời đúng: tăng correctStreak → giảm priority (learning effect)
- Khi trả lời sai: reset correctStreak → tăng priority

## Capabilities

### New Capabilities

- `smart-prioritization-algorithm`: Hệ thống tính độ ưu tiên cho câu hỏi dựa trên incorrect count, thời gian chưa ôn, và learning effect
- `priority-settings-ui`: Giao diện cấu hình trọng số ưu tiên (global + per-game)
- `question-stats-tracking`: Lưu trữ và cập nhật stats cho từng câu hỏi theo từng game

### Modified Capabilities

- (không có - đây là tính năng mới hoàn toàn)

## Impact

- **main.js**: Thêm priority calculation function, storage handling cho question stats
- **game-quiz.js, game-listen.js, game-flash.js, game-match.js, game-type.js**: Thay đổi từ shuffle() thuần sang weighted shuffle
- **index.html**: Thêm UI settings cho prioritization
- **style.css**: Thêm styling cho settings UI
- **localStorage**: Thêm key `jq_question_stats`
