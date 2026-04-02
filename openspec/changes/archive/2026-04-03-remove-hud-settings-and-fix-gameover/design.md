## Context

Hiện tại ứng dụng Japanese Learning Mini-Game có 2 vấn đề nhỏ:

1. **HUD settings button thừa**: Mỗi game screen (quiz, listen, flash, match, type, write) đều có button ⚙️ trong HUD - nhưng settings đã có trong menu chính, không cần thiết phải có ở mỗi game.

2. **Game-over modal không đúng khi hoàn thành**: Khi người chơi trả lời hết tất cả câu hỏi mà không bị thua (HP > 0), hệ thống vẫn hiện modal game-over thay vì chỉ hiện toast thông báo hoàn thành. Logic hiện tại trong `main.js:gameOver()` luôn hiện modal bất kể `completed` parameter.

## Goals / Non-Goals

**Goals:**
- Xoá 6 button ⚙️ thừa trong các game screens
- Xoá CSS `.hud-settings` không còn dùng
- Sửa logic để khi hoàn thành game (completed=true) KHÔNG hiện modal game-over

**Non-Goals:**
- Không thay đổi behavior khi người chơi bị thua (HP = 0) - modal vẫn hiện đúng
- Không thêm feature mới

## Decisions

### 1. Sửa logic trong main.js thay vì từng game file

**Decision**: Sửa hàm `gameOver()` trong main.js một lần thay vì sửa 6 game riêng lẻ.

**Rationale**: Tất cả 6 games (quiz, listen, flash, match, type, write) đều gọi chung hàm `gameOver(score, combo, type, correct, wrong, completed)`. Sửa một chỗ sẽ fix tất cả.

**Alternative considered**: Sửa từng game-complete function - tốn công hơn, dễ miss.

### 2. Xoá CSS class thay vì comment

**Decision**: Xoá hoàn toàn class `.hud-settings` trong style.css thay vì chỉ comment.

**Rationale**: Class này không được dùng ở bất kỳ đâu sau khi xoá buttons.

## Risks / Trade-offs

- **Risk thấp**: Thay đổi đơn giản, chỉ xoá code và thêm return sớm
- **No migration needed**: Không có data migration
- **Rollback dễ dàng**: Nếu có lỗi, chỉ cần undo thay đổi