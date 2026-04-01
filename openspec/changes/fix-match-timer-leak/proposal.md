## Why

Timer trong game-match.js tiếp tục đếm ngược ngay cả khi người chơi đã rời khỏi màn hình game (quay về menu). Điều này gây ra race condition khi `endMatchByTime()` được gọi sau khi người chơi đã thoát game, dẫn đến việc hiển thị toast/game over không đúng context.

## What Changes

- Thêm kiểm tra `matchActive` trong callback của `setInterval` trong hàm `startMatchTimer()`
- Khi `matchActive` là `false`, timer sẽ tự động dừng ở tick kế tiếp thay vì tiếp tục chạy

## Capabilities

### New Capabilities

- `match-timer-safety`: Đảm bảo timer game match chỉ chạy khi game đang active

### Modified Capabilities

- (không có)

## Impact

- File duy nhất ảnh hưởng: `game-match.js`
- Hàm cần sửa: `startMatchTimer()` (dòng 25-35)