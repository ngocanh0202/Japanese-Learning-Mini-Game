## Context

Timer của game match (game-match.js) sử dụng `setInterval` để đếm ngược. Khi người chơi rời khỏi màn hình `screen-match` mà không dừng timer (ví dụ click nút Back, chuyển sang screen khác), timer tiếp tục chạy ngầm. Khi `matchTimeLeft` về 0, callback gọi `endMatchByTime()` - có thể gây ra:
- Hiển thị toast "Time's up!" khi đã ở màn hình menu
- Gọi `gameOver()` không đúng context

## Goals / Non-Goals

**Goals:**
- Timer tự dừng khi `matchActive` được đặt thành `false`
- Không thay đổi behavior khi game đang hoạt động bình thường
- Đảm bảo callback timer không gây side effects không mong muốn

**Non-Goals:**
- Không thay đổi cách timer được khởi động/dừng thủ công ở các nơi khác
- Không thêm tính năng mới cho timer

## Decisions

1. **Thêm kiểm tra trong callback**: Thêm `if (!matchActive) { stopMatchTimer(); return; }` ở đầu callback của `setInterval`
   - **Tại sao**: Đơn giản, không cần thay đổi ở nơi gọi `showScreen()`, ít rủi ro nhất
   - **Alternative**: Thêm `stopMatchTimer()` vào `showScreen()` khi rời khỏi `screen-match` - nhưng cách này cần modify `main.js` và có thể miss cases khác

2. **Dùng `matchActive` flag**: Kiểm tra biến `matchActive` thay vì tạo biến mới
   - **Tại sao**: `matchActive` đã có ý nghĩa "game đang chơi", tái sử dụng giúp code nhất quán

## Risks / Trade-offs

- **[Risk]** Timer vẫn chạy thêm 1 tick sau khi rời khỏi trước khi dừng
  - **Mitigation**: Tick này chỉ kiểm tra điều kiện và return, không gây side effect
- **[Risk]** Timer callback vẫn được gọi sau khi rời đi
  - **Mitigation**: Callback chỉ gọi `stopMatchTimer()` và return, không gây vấn đề