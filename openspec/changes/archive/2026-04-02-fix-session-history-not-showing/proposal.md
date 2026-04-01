## Why

Screen-stats hiện tại không hiển thị Session History vì không có cơ chế lưu trữ và hiển thị dữ liệu các phiên chơi game. Người chơi không thể xem lại lịch sử các ván đã chơi, điểm số, độ chính xác theo từng game type.

## What Changes

1. **Thêm sessionHistory global state**: Biến array để lưu danh sách các phiên chơi
2. **Thêm localStorage persistence**: Load/save sessionHistory từ localStorage (key: `jq_session_history`)
3. **Cập nhật gameOver()**: Lưu thông tin phiên mỗi khi kết thúc game (score, combo, game type, timestamp, correct/wrong counts)
4. **Cập nhật renderStatsScreen()**: Đọc sessionHistory từ localStorage và hiển thị danh sách phiên trong `#stats-history`
5. **Giới hạn lịch sử**: Chỉ lưu tối đa 20 phiên gần nhất, xóa phiên cũ nhất khi vượt quá

## Capabilities

### New Capabilities
- `session-history-tracking`: Lưu trữ và hiển thị lịch sử các phiên chơi game trong stats screen

### Modified Capabilities
- (none)

## Impact

- **main.js**: Thêm biến sessionHistory, cập nhật loadFromStorage(), saveToStorage(), gameOver(), renderStatsScreen()
- **index.html**: Không thay đổi (id `#stats-history` đã tồn tại)
- **style.css**: Thêm CSS cho session history display nếu cần