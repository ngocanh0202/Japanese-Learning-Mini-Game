## Why

Sau khi tách CSS thành các file nhỏ trong thư mục `css/`, giao diện app bị vỡ layout vì `index.html` vẫn chỉ load `style.css` (file cũ, không còn đủ styles). Các file CSS mới trong `css/` không được import vào HTML dẫn đến giao diện bị lõi hoàn toàn.

## What Changes

- Thay thế `<link rel="stylesheet" href="style.css" />` trong `index.html` bằng danh sách các file CSS mới trong thư mục `css/`
- Import đủ các file CSS theo đúng thứ tự dependency: variables → base → menu → game modules → modals
- Đảm bảo tất cả styles từ `style.css` gốc đều được chuyển sang các file trong `css/`

## Capabilities

### New Capabilities
- `css-import-fix`: Sửa việc import CSS trong index.html để khôi phục giao diện

### Modified Capabilities
- Không có spec nào bị ảnh hưởng về mặt requirement

## Impact

- File `index.html`: Cập nhật thẻ `<link>` CSS
- Thư mục `css/`: Đã có sẵn các file CSS tách biệt
- Không ảnh hưởng đến logic JavaScript hay chức năng game