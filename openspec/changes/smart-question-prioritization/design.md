## Context

Hiện tại tất cả các game (quiz, listen, flash, match, type) đều dùng `shuffle()` để chọn câu hỏi ngẫu nhiên hoàn toàn. Mỗi game độc lập với nhau về mặt câu hỏi - không có tracking lịch sử trả lời.

Project là vanilla HTML/CSS/JS, chạy trực tiếp trên browser, không có build system.

## Goals / Non-Goals

**Goals:**
- Tạo hệ thống ưu tiên câu hỏi thông minh cho từng game
- Ưu tiên câu hay sai và câu lâu chưa ôn
- Hạn chế câu đã thuộc (learning effect)
- Cho phép user cấu hình trọng số ưu tiên (global + per-game)
- Persist dữ liệu qua localStorage

**Non-Goals:**
- Không thay đổi format dữ liệu câu hỏi hiện tại
- Không tạo hệ thống spaced repetition phức tạp (chỉ là weighted shuffle)
- Không ảnh hưởng đến các game khác (stats riêng cho từng game)

## Decisions

### 1. Data Structure cho question stats

```javascript
// Mỗi question có thêm field:
gameStats: {
  quiz: { incorrect: 0, lastSeen: timestamp, correctStreak: 0 },
  listen: { incorrect: 0, lastSeen: timestamp, correctStreak: 0 },
  flash: { incorrect: 0, lastSeen: timestamp, correctStreak: 0 },
  match: { incorrect: 0, lastSeen: timestamp, correctStreak: 0 },
  type: { incorrect: 0, lastSeen: timestamp, correctStreak: 0 }
}
```

**Rationale**: Dùng nested object để tránh phải merge stats khi import/export data (stats nằm riêng).

### 2. Priority Algorithm

```
priority = (incorrect * W_INCORRECT) + timeBonus - learningPenalty

timeBonus = min(daysSinceLastSeen * W_TIME, MAX_TIME_BONUS)
learningPenalty = correctStreak * W_LEARNING
```

**Alternatives considered:**
- Multi-pass filtering: Lọc ra X câu hay sai, rồi shuffle → Phức tạp hơn, khó debug
- Weighted random: Chọn random với weight tỉ lệ priority → Đơn giản, đủ tốt ✓

**Rationale**: Weighted shuffle đơn giản, dễ tune, cho kết quả ngẫu nhiên nhưng có bias hợp lý.

### 3. Storage Strategy

- **Stats**: Lưu riêng trong `localStorage.setItem('jq_question_stats', JSON.stringify(questionStats))`
- **Settings**: Thêm vào object `settings` hiện tại (đã có localStorage)

**Rationale**: Giữ stats tách biệt với questions để khi import questions mới không mất stats cũ.

### 4. Per-game Settings Override

Mỗi game sẽ có object settings riêng trong `settings.priority`:
```javascript
settings.priority = {
  enabled: true,
  global: { incorrect: 5, timeSinceSeen: 3, learning: 2 },
  perGame: {
    quiz: { enabled: true, incorrect: 5, timeSinceSeen: 3, learning: 2 },
    // ... các game khác
  }
}
```

### 5. Integration vào các game files

Thay `shuffle([...questions])` bằng `getPrioritizedDeck(questions, gameType)`.

**Rationale**: Giữ nguyên interface của các game, chỉ thay đổi hàm lấy deck.

## Risks / Trade-offs

- **[Risk] Stats growth**: QuestionStats sẽ grow theo số lượng questions → **Mitigation**: Khi delete questions, cũng delete stats tương ứng
- **[Risk] Edge case - câu mới**: Câu chưa từng ra có lastSeen = null → **Mitigation**: Coi như daysSinceLastSeen = MAX, được ưu tiên cao
- **[Risk] Performance với nhiều câu**: Weighted shuffle O(n) → **Mitigation**: Với <10000 câu không có vấn đề
- **[Trade-off] Complexity vs Simplicity**: Có thể overkill cho use case đơn giản → **Mitigation**: Mặc định weights = 0 (random), user tự bật lên nếu muốn
