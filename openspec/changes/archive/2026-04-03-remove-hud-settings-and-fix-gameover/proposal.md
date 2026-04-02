## Why

Mỗi màn hình game (quiz, listen, flash, match, type, write) đều có button ⚙️ HUD settings không cần thiết - chỉ cần một chỗ settings chung ở menu chính. Thêm vào đó, khi người chơi hoàn thành tất cả câu hỏi, hệ thống vẫn hiện modal game-over trong khi chỉ cần hiện toast thông báo hoàn thành.

## What Changes

1. **Xoá 6 button hud-settings**: Xoá button ⚙️ trong các màn hình: screen-listen, screen-quiz, screen-flash, screen-match, screen-type, screen-write
2. **Xoá CSS không dùng**: Xoá class `.hud-settings` trong style.css
3. **Sửa logic gameOver() trong main.js**: Khi `completed = true` (hoàn thành tất cả câu hỏi):
   - KHÔNG hiện modal game-over
   - CHỈ lưu data, cập nhật combo/EXP, save storage rồi return sớm

## Capabilities

### New Capabilities
- Không có capability mới

### Modified Capabilities
- `game-flow`: Thay đổi behavior khi hoàn thành game - không hiện modal mà chỉ toast

## Impact

- **Affected files**:
  - `index.html`: Xoá 6 button
  - `style.css`: Xoá CSS `.hud-settings`
  - `main.js`: Sửa hàm `gameOver()`
- **No breaking changes**: Chỉ xoá UI thừa và cải thiện UX