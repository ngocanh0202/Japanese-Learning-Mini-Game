## Context

**Current State:**
- Screen-stats đã có `#stats-history` container nhưng luôn hiển thị "No sessions recorded yet."
- Không có biến `sessionHistory` để lưu dữ liệu phiên chơi
- Không có persistence cho session data trong localStorage
- Hàm `gameOver(score, combo, type)` không lưu thông tin phiên

**Constraints:**
- Vanilla JS project, không có framework
- Dữ liệu lưu trong localStorage với prefix `jq_`
- Giới hạn 20 phiên gần nhất để tránh localStorage overflow

**Stakeholders:**
- Người chơi muốn xem lịch sử các ván đã chơi

## Goals / Non-Goals

**Goals:**
- Lưu thông tin mỗi phiên chơi (game type, score, accuracy, timestamp)
- Hiển thị danh sách phiên trong screen-stats
- Duy trì giới hạn 20 phiên gần nhất
- Đảm bảo dữ liệu persist qua các lần truy cập

**Non-Goals:**
- Không tạo tính năng xóa lịch sử thủ công
- Không tạo tính năng export/import session history
- Không thay đổi UI của stats screen (giữ nguyên layout hiện tại)

## Decisions

**1. Session Data Structure:**
```javascript
{
  id: string,          // unique session ID
  type: string,        // 'quiz' | 'listen' | 'flash' | 'match' | 'type'
  score: number,       // EXP earned
  correct: number,     // correct answers count
  wrong: number,       // wrong answers count
  timestamp: string    // ISO date string
}
```

**2. Storage Key:** `jq_session_history` - array of session objects

**3. When to Save:** Trong hàm `gameOver()` trước khi gọi `saveToStorage()`

**4. Max Sessions:** 20 - xóa phiên cũ nhất khi thêm phiên mới nếu vượt quá

## Risks / Trade-offs

- **[Risk]** localStorage có thể đầy → **Mitigation**: Giới hạn 20 phiên, tự động cleanup
- **[Risk]** Dữ liệu cũ không compatible khi update structure → **Mitigation**: Version check hoặc reset nếu parse fail
- **[Risk]** Người chơi chơi nhiều game cùng lúc → **Mitigation**: Mỗi gameOver là một session riêng biệt

## Migration Plan

1. Thêm biến `sessionHistory = []` trong main.js
2. Thêm `loadSessionHistory()` trong `loadFromStorage()`
3. Thêm `saveSessionHistory()` trong `saveToStorage()`
4. Cập nhật `gameOver()` để tạo và lưu session object
5. Cập nhật `renderStatsScreen()` để hiển thị session history

## Open Questions

- [none]