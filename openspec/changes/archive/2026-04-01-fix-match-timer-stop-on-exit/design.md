## Context

Timer của game match sử dụng `setInterval` trong `game-match.js`. Cách trước (thêm kiểm tra trong callback) không dừng ngay lập tức - timer vẫn chạy thêm 1 tick trước khi dừng. Cần một cách tiếp cận khác để dừng timer NGAY khi người chơi rời khỏi màn hình.

Hàm `showScreen()` trong `main.js` là nơi duy nhất xử lý việc chuyển màn hình - lý tưởng để hook vào và dừng timer.

## Goals / Non-Goals

**Goals:**
- Timer dừng NGAY LẬP TỨC khi người chơi rời khỏi màn hình match
- Không có side effects không mong muốn (toast, game over) khi đã ở menu
- Đơn giản, dễ maintain

**Non-Goals:**
- Không thay đổi behavior của các game khác
- Không thêm tính năng mới cho timer

## Decisions

1. **Thêm biến `currentScreen` để track màn hình hiện tại**
   - **Tại sao**: `showScreen()` hiện không biết màn hình trước đó là gì
   - **Alternative**: Sử dụng `document.querySelector('.screen.active')` - nhưng cách này ít rõ ràng hơn

2. **Hook vào `showScreen()` thay vì sửa timer callback**
   - **Tại sao**: Dừng timer ngay tại thời điểm rời đi, không cần đợi tick kế tiếp
   - **Alternative**: Thêm kiểm tra trong mỗi nút Back - nhưng không exhaustively được

3. **Gọi `stopMatchTimer()` trực tiếp, không qua biến trung gian**
   - **Tại sao**: `stopMatchTimer()` đã có sẵn và an toàn (có null check)

## Risks / Trade-offs

- **[Risk]** Nếu `showScreen()` được gọi trước khi game-match.js loaded
  - **Mitigation**: `stopMatchTimer()` có null check, sẽ không crash
- **[Risk]** Multi-tab scenarios
  - **Mitigation**: Đơn giản app, mỗi tab chạy independent timer