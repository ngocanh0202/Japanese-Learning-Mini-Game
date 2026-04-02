## Context

Sau khi CSS được tách thành các file nhỏ trong thư mục `css/`, `index.html` vẫn chỉ load file `style.css` cũ. Điều này khiến giao diện bị vỡ hoàn toàn vì các styles mới không được apply. Các file CSS mới đã được tạo:
- css/variables.css (biến CSS và reset)
- css/base.css (styles cơ bản)
- css/menu.css (menu và navigation)
- css/game-quiz.css, css/game-listen.css, css/game-flash.css, css/game-type.css (từng game)
- css/game-hud.css, css/game-overlays.css, css/modals.css (UI components)

## Goals / Non-Goals

**Goals:**
- Khôi phục giao diện app bằng cách import đúng các file CSS mới
- Đảm bảo thứ tự load CSS đúng để tránh override không mong muốn
- Loại bỏ hoặc thay thế link đến style.css cũ

**Non-Goals:**
- Không thay đổi cấu trúc HTML hay JavaScript
- Không tạo thêm file CSS mới (giả định các file trong css/ đã đầy đủ)
- Không refactor CSS nội dung

## Decisions

1. **Thay thế style.css bằng danh sách file CSS mới**
   - Alternative considered: Giữ style.css và @import các file mới
   - Decision: Thay thế hoàn toàn vì @import chậm hơn và không cần thiết

2. **Thứ tự import CSS**
   - Thứ tự phải đảm bảo: variables → base → components → games
   - Đảm bảo game-specific styles override base styles nếu cần

## Risks / Trade-offs

- [Risk] Nếu có file CSS nào đó bị thiếu hoặc chưa được tạo → Mitigation: Kiểm tra trước khi deploy, bổ sung nếu cần
- [Risk] Thứ tự sai có thể gây override styles không đúng → Mitigation: Tuân thủ thứ tự đã xác định