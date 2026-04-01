## Why

Hiện tại, các game mode (quiz, listen, flash, match, type) luôn chạy hết toàn bộ câu hỏi trong pool, không có tùy chọn giới hạn số câu hỏi mỗi ván. Điều này khiến người chơi không thể chơi nhanh hoặc giới hạn thời gian học. Cần thêm tính năng giới hạn số câu hỏi mỗi ván với giá trị mặc định là 20 câu.

## What Changes

- Thêm setting `questionLimit` với giá trị mặc định `20`
- Thêm toggle bật/tắt giới hạn câu hỏi trong screen-settings
- Thêm input number để nhập số câu tối đa (mặc định 20)
- Cập nhật tất cả game modes (quiz, listen, flash, match, type) để áp dụng giới hạn khi khởi tạo deck
- Xử lý load/save settings qua localStorage

## Capabilities

### New Capabilities
- `question-limit`: Giới hạn số câu hỏi hiển thị mỗi ván chơi. Người dùng có thể bật/tắt và tùy chỉnh số câu tối đa trong settings.

### Modified Capabilities
<!-- Không có capability nào bị sửa đổi -->

## Impact

- `main.js`: Thêm `questionLimit` vào settings object, cập nhật load/save logic
- `index.html`: Thêm UI setting trong screen-settings
- `game-quiz.js`, `game-listen.js`, `game-flash.js`, `game-match.js`, `game-type.js`: Cắt deck theo limit khi khởi tạo game
