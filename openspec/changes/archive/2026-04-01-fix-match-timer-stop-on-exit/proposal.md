## Why

Timer trong game-match.js tiếp tục đếm ngược khi người chơi rời khỏi màn hình game (quay về menu). Cách 2 (thêm kiểm tra trong callback) không hiệu quả vì timer vẫn chạy thêm 1 tick trước khi dừng. Cần dừng timer NGAY LẬP TỨC khi rời khỏi màn hình match.

## What Changes

- Thêm biến global `currentScreen` trong `main.js` để track màn hình hiện tại
- Sửa hàm `showScreen()` trong `main.js` để gọi `stopMatchTimer()` khi rời khỏi `screen-match`
- Loại bỏ kiểm tra trong callback timer (cách 2 trước đó) vì không cần thiết nữa

## Capabilities

### New Capabilities

- `match-timer-stop-on-exit`: Timer match game dừng ngay khi người chơi rời khỏi màn hình game

### Modified Capabilities

- (không có)

## Impact

- Files ảnh hưởng: `main.js` (thêm biến + sửa showScreen), `game-match.js` (có thể revert cách 2)
- Hàm cần sửa: `showScreen()` trong `main.js:105-120`