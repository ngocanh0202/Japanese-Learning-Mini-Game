## Context

Hiện tại, tất cả game modes (quiz, listen, flash, match, type) sử dụng toàn bộ pool câu hỏi (`questions`) khi khởi tạo game. Không có cơ chế giới hạn số câu hỏi mỗi ván.

Settings được lưu trong `localStorage` với prefix `jq_`, load/save qua `loadSettingsFromStorage()` và `saveToStorage()` trong main.js.

Mỗi game mode có hàm `start*()` riêng, gọi `getPrioritizedDeck()` hoặc xử lý deck tương tự.

## Goals / Non-Goals

**Goals:**
- Thêm setting `questionLimit` (default: 20) để giới hạn số câu hỏi mỗi ván
- Toggle bật/tắt giới hạn trong screen-settings
- Input number để nhập số câu tối đa
- Áp dụng limit cho tất cả game modes: quiz, listen, flash, match, type
- Lưu/load setting qua localStorage

**Non-Goals:**
- Không thay đổi logic prioritization hiện tại
- Không thay đổi UI/UX của game screens
- Không thêm giới hạn theo category/topic

## Decisions

### 1. Settings structure
Thêm `questionLimitEnabled: false` và `questionLimit: 20` vào settings object trong main.js. Khi disabled, games sẽ chạy hết pool (behavior cũ).

### 2. Where to apply limit
Áp dụng limit ngay sau khi tạo deck trong mỗi game's `start*()` function, trước khi render. Dùng `slice(0, settings.questionLimit)` để cắt deck.

### 3. UI placement
Thêm setting block mới trong screen-settings, đặt sau "Smart Prioritization" section, trước "BACK TO MENU" button. Gồm:
- Toggle checkbox để bật/tắt
- Number input (min: 5, max: 200) để nhập số câu

### 4. Default value
Mặc định 20 câu, phù hợp cho session học ngắn. Người dùng có thể tăng/giảm tùy nhu cầu.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Limit quá nhỏ (< total questions) khiến một số câu không bao giờ xuất hiện | Smart prioritization vẫn hoạt động, câu khó sẽ được ưu tiên |
| Người dùng nhập số quá lớn | Giới hạn input max 200, validation trong UI |
| Break existing behavior nếu setting bị null/undefined | Default value 20 trong settings object, fallback an toàn |
