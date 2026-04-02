## Why

Trên thiết bị di động, các nút đáp án (choice-btn) trong màn hình quiz và listen chỉ hiển thị với chiều rộng tối đa 680px và xếp theo grid 2 cột. Điều này gây ra trải nghiệm kém trên mobile - các nút quá nhỏ và không tận dụng hết chiều rộng màn hình.

## What Changes

- Thêm media query CSS cho mobile (max-width: 480px) cho cả screen-quiz và screen-listen
- Chuyển `.choices-grid` từ 2 cột thành 1 cột trên mobile
- Mở rộng `.choice-btn` fill đầy chiều rộng màn hình trên mobile
- Đảm bảo khoảng cách (gap) phù hợp với touch target

## Capabilities

### New Capabilities
- `quiz-mobile-responsive`: Cải thiện UI quiz trên mobile - full width buttons
- `listen-mobile-responsive`: Cải thiện UI listen trên mobile - full width buttons

### Modified Capabilities
- Không có thay đổi về requirement - chỉ là UI improvement

## Impact

- File duy nhất: `style.css` - thêm responsive CSS rules
- Không ảnh hưởng đến logic game hay data
- Tương thích ngược với desktop
