## Why

Hiện tại hệ thống ưu tiên câu hỏi (Priority System) dùng index mảng (`q-0`, `q-1`, ...) làm khóa thống kê. Điều này gây ra **sai lệch nghiêm trọng** khi:

1. **Xóa câu hỏi** — stats của các câu phía sau bị shift sai, gán nhầm cho câu khác
2. **Đổi question set** — stats từ set cũ áp sai cho set mới (cùng index, khác nội dung)
3. **Thêm câu hỏi** — nếu insert vào giữa, stats phía sau bị lệch
4. **Re-import** — cùng câu hỏi nhưng index mới → mất toàn bộ lịch sử ôn tập

Người chơi không nhận ra nhưng game đang ưu tiên sai câu hỏi — làm giảm hiệu quả học tập.

## What Changes

- Chuyển từ index-based IDs (`q-0`, `q-1`) sang **hash-based IDs** (`q-{hash}`) — deterministic từ nội dung câu hỏi
- Thêm hàm `generateQuestionId(question)` dùng hash của `word + q + romaji + translation`
- Sửa tất cả hàm đọc/ghi stats: `getPriorityScore()`, `updateQuestionStats()`, `initQuestionStats()`, `cleanupQuestionStats()`
- Thêm **migration** tự động khi load data cũ — map `q-{number}` → `q-{hash}` một lần duy nhất
- Xóa logic shift stats khi xóa câu hỏi — giờ chỉ cần `delete questionStats[id]`
- Cập nhật tất cả game files: thay `originalIndex` bằng `questionId` trong deck mapping
- Thêm file tài liệu `docs/priority-system.md` giải thích cơ chế ưu tiên

## Capabilities

### New Capabilities
- `hash-based-question-ids`: Question stats được định danh bằng hash content thay vì index mảng, đảm bảo chính xác khi xóa/thêm/đổi set
- `stats-migration`: Tự động migrate stats từ format cũ (index-based) sang format mới (hash-based) khi load data
- `priority-system-docs`: Tài liệu giải thích cơ chế ưu tiên câu hỏi

### Modified Capabilities
<!-- Không có existing specs để modify — đây là project mới với OpenSpec -->

## Impact

- **Files sửa đổi**: `js/game-utils.js`, `js/storage.js`, `js/games/game-quiz.js`, `js/games/game-listen.js`, `js/games/game-flash.js`, `js/games/game-match.js`, `js/games/game-type.js`, `js/games/game-write.js`
- **Files mới**: `docs/priority-system.md`
- **localStorage**: `jq_question_stats` sẽ được migrate tự động — không mất dữ liệu
- **Không breaking**: Migration chạy một lần khi load, người dùng không cần làm gì
