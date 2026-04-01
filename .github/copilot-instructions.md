# GitHub Copilot Workspace Instructions

## Project Overview

Đây là một ứng dụng web học tiếng Nhật nhỏ, viết thuần bằng HTML/CSS/JavaScript.
No build system, no package manager. Chạy trực tiếp bằng trình duyệt hoặc một static server đơn giản.

## Primary app flow

- `index.html`: toàn bộ giao diện, nhiều màn hình (`screen-menu`, `screen-data`, `screen-settings`, `screen-quiz`, `screen-flash`, `screen-match`, `screen-type`).
- `style.css`: toàn bộ kiểu dáng và layout cho từng màn hình.
- `main.js`: trạng thái chung, điều hướng màn hình, localStorage, import/export dữ liệu, `settings` object.
- `game-quiz.js`: logic game quiz.
- `game-flash.js`: logic flashcard.
- `game-match.js`: logic match pair.
- `game-type.js`: logic falling typing.
- `data.js`: sample question/data.

## Important notes for edits

- `main.js` là nguồn sự thật chung cho settings và data.
- `screen-settings` phải chỉ chứa cấu hình difficulty/settings, không dùng để quản lý dữ liệu import/export.
- `screen-data` giữ chức năng import/export và xem/xóa câu hỏi.
- `index.html` đã load game modules theo thứ tự: `data.js`, `main.js`, `game-quiz.js`, `game-flash.js`, `game-match.js`, `game-type.js`.
- `script.js` hiện không được `index.html` include; coi nó là legacy/không phải mã chủ đạo trừ khi xác nhận ngược lại.

## How to run

1. Mở `index.html` trong trình duyệt.
2. Hoặc chạy một static server đơn giản, ví dụ `python -m http.server` trong thư mục project.

## Guiding constraints for Copilot

- Giữ thay đổi nhẹ và rõ ràng; repo này không cần module bundler hay React.
- Ưu tiên sửa trong các file hiện có trước khi thêm file mới.
- Kiểm tra kỹ `index.html` trước khi đổi script load order hoặc xóa file.
- Dữ liệu người chơi và câu hỏi được lưu trong `localStorage`.

## Useful patterns

- `showScreen(id)` để chuyển màn hình.
- `settings` object trong `main.js` để lưu giá trị cài đặt.
- `refreshDataPreview()` để hiển thị danh sách câu hỏi hiện tại.
- `saveToStorage()` / `loadFromStorage()` lưu và nạp dữ liệu.

## If in doubt

- Nếu cần thêm tính năng mới, xác nhận dùng `screen-settings` cho cài đặt và `screen-data` cho dữ liệu.
- Nếu cần điều chỉnh gameplay, hãy đọc game-specific file tương ứng.
- Không phá vỡ flow hiện có: menu → game screens → trở về menu.
