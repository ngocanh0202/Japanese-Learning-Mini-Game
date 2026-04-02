## Context

Hiện tại, các nút đáp án trong game quiz và listen sử dụng grid 2 cột với max-width 680px. Trên desktop, điều này hoạt động tốt nhưng trên mobile (max-width: 480px), các nút trở nên quá nhỏ, khó chạm và lãng phí không gian màn hình.

## Goals / Non-Goals

**Goals:**
- Cải thiện UX trên mobile cho quiz và listen game
- Các nút đáp án fill đầy chiều rộng màn hình mobile
- Đảm bảo touch target đủ lớn (ít nhất 44px)

**Non-Goals:**
- Thay đổi layout desktop - giữ nguyên như hiện tại
- Thay đổi logic game hay thêm tính năng mới

## Decisions

1. **Media query breakpoint**: Sử dụng `max-width: 480px` - đây là breakpoint phổ biến cho mobile
2. **Grid columns**: Chuyển từ `1fr 1fr` (2 cột) thành `1fr` (1 cột) trên mobile
3. **Button width**: Sử dụng `width: 100%` để fill đầy container

## Risks / Trade-offs

- [Risk] Nút có thể dài quá màn hình → [Mitigation] Sử dụng `word-wrap: break-word` để xử lý text dài
