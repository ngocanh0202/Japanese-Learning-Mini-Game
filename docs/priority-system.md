# Cơ Chế Ưu Tiên Câu Hỏi — 日本語 QUEST

## Tổng Quan

Hệ thống ưu tiên câu hỏi (Priority System) giúp game tự động ưu tiên những câu hỏi người chơi **chưa thuộc**, **trả lời sai nhiều**, hoặc **lâu không gặp**. Các câu đã thuộc lòng sẽ xuất hiện ít hơn.

---

## 1. Hash-Based Question ID

### Vấn đề với index-based ID (cũ)

Trước đây, stats được lưu theo index mảng: `q-0`, `q-1`, `q-2`... Điều này gây sai lệch khi:
- **Xóa câu hỏi** — stats của các câu phía sau bị shift sai
- **Đổi question set** — stats từ set cũ áp sai cho set mới (cùng index, khác nội dung)
- **Thêm câu hỏi** — nếu insert vào giữa, stats phía sau bị lệch

### Giải pháp: Hash từ content

Mỗi câu hỏi được sinh ID deterministically từ nội dung:

```javascript
function generateQuestionId(q) {
  const str = `${q.word}||${q.q}||${q.romaji}||${q.translation || ''}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `q-${Math.abs(hash).toString(36)}`;
}
```

**Ưu điểm:**
- Cùng nội dung → cùng ID (re-import vẫn giữ stats)
- Khác nội dung → khác ID (đổi set không bị ảnh hưởng)
- Không cần thêm field vào question object
- Không cần thư viện ngoài

### Collision handling

Nếu 2 câu khác nhau trùng hash (rất hiếm), hệ thống tự động thêm suffix: `q-abc123-1`, `q-abc123-2`.

---

## 2. Công Thức Tính Điểm Ưu Tiên

### Hàm: `getPriorityScore(questionIndex, gameType, weights)`

```
score = (effectiveIncorrect × incorrect_weight)
      + (daysSinceSeen × timeSinceSeen_weight)    // capped at 50
      - (correctStreak × learning_weight)
      + (slowCorrectCount × slowResponse_weight)  // capped at 30
```

### 4 yếu tố

| Yếu tố | Ý nghĩa | Mặc định | Ảnh hưởng |
|--------|---------|----------|-----------|
| **Incorrect** | Số lần sai (có decay theo thời gian) | 8 | Càng sai nhiều → điểm càng cao → xuất hiện nhiều hơn |
| **Time Since Seen** | Số ngày từ lần cuối gặp | 3 | Càng lâu không gặp → điểm càng cao |
| **Learning** | Penalty cho câu đã thuộc | 2 | Càng trả lời đúng liên tiếp → điểm càng GIẢM |
| **Slow Response** | Số lần đúng nhưng chậm (>8s) | 3 | Đúng mà chậm → điểm tăng → cần ôn thêm |

### Effective Incorrect (Decay)

Không đếm tổng số lần sai, mà dùng decay: `Σ(0.85^daysSinceError)`
- Sai hôm nay: `1.0`
- Sai 3 ngày trước: `0.61`
- Sai 10 ngày trước: `0.20`
- Sai quá 30 ngày: **bị loại bỏ**

### Confidence Level

```
score = correctStreak / (correctStreak + effectiveIncorrect + 1)
```

| Score | Level |
|-------|-------|
| ≥ 0.7 | **Mastered** |
| ≥ 0.4 | **Familiar** |
| ≥ 0.1 | **Learning** |
| < 0.1 | **New** |

---

## 3. Weighted Random Selection

KHÔNG phải sort theo điểm rồi lấy. Hệ thống dùng **weighted random selection**:

- Mỗi câu có `weight = max(0, score) + 1`
- Weight càng cao → xác suất được chọn càng lớn
- Câu điểm thấp VẪN có cơ hội xuất hiện

→ Đảm bảo **spaced repetition**: câu khó xuất hiện thường xuyên, câu dễ vẫn thỉnh thoảng ôn.

---

## 4. Cấu Hình Priority

### Global + Per-Game Override

```javascript
settings.priority = {
  enabled: true,
  global: { incorrect: 8, timeSinceSeen: 3, learning: 2, slowResponse: 3 },
  perGame: {
    quiz: { enabled: true, incorrect: 10, ... },  // override riêng
    listen: { enabled: null, ... },               // null = dùng global
  }
}
```

Khi priority bị tắt → `shuffle([...questionsArr])` thuần túy.

---

## 5. Migration Strategy

Khi app load lần đầu sau update:
1. Detect stats cũ (key dạng `q-\d+`)
2. Map `q-{N}` → `q-{hash(questions[N])}`
3. Set flag `jq_stats_migrated = true`
4. Chạy 1 lần duy nhất

Nếu migration fail → initialize stats mới, không crash app.

---

## 6. Key Functions

| Hàm | File | Mô tả |
|-----|------|-------|
| `generateQuestionId(q)` | `js/game-utils.js` | Sinh hash ID từ content |
| `getPriorityScore(idx, type, weights)` | `js/game-utils.js` | Tính điểm ưu tiên |
| `getPrioritizedDeck(arr, type)` | `js/game-utils.js` | Tạo deck đã xáo trộn theo priority |
| `updateQuestionStats(id, type, correct, time)` | `js/game-utils.js` | Cập nhật stats (nhận string ID hoặc number index) |
| `getEffectiveIncorrect(stats)` | `js/game-utils.js` | Tính số sai hiệu dụng (decay) |
| `getConfidenceLevel(streak, incorrect)` | `js/game-utils.js` | Phân loại mức độ thuộc |
| `getWeights(type)` | `js/game-utils.js` | Lấy trọng số (global hoặc per-game) |
| `detectLegacyStats()` | `js/storage.js` | Detect format cũ |
| `migrateStatsToHashBased()` | `js/storage.js` | Migration từ index → hash |
| `initQuestionStats(arr)` | `js/storage.js` | Khởi tạo stats với collision detection |
| `cleanupQuestionStats(idx)` | `js/storage.js` | Xóa stats khi delete question |

---

## 7. Hằng Số

| Hằng số | Giá trị | Ý nghĩa |
|---------|---------|---------|
| `SLOW_RESPONSE_THRESHOLD` | 8000ms | Ngưỡng "trả lời chậm" |
| `MAX_DAYS` | 30 | Số ngày tối đa cho time bonus |
| `MAX_TIME_BONUS` | 50 | Điểm tối đa cho "lâu không gặp" |
| `DECAY_RATE` | 0.85 | Tốc độ giảm ảnh hưởng của lỗi |
| `MAX_HISTORY_DAYS` | 30 | Số ngày lưu lịch sử sai |
| `BASE_XP_REWARD` | 5 | EXP cơ bản mỗi câu đúng |
| `LEVEL_XP_CURVE` | 1.2 | Hệ số tăng EXP theo level |

---

## 8. Known Issues & Limitations

- **Hash collision**: Rất hiếm với dataset < 10000 câu. Hệ thống tự xử lý bằng suffix.
- **Migration one-time**: Sau khi migrate, không thể rollback về format cũ.
- **Stats không chia sẻ giữa sets**: Mỗi câu trong set khác nhau có stats riêng (do hash khác nhau).
- **Không có stats cross-game**: Stats được lưu per game type, không tổng hợp chung.
