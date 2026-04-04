## Context

Hiện tại `questionStats` dùng index mảng làm khóa (`q-0`, `q-1`, ...). Stats được lưu trong localStorage key `jq_question_stats`. Mỗi lần xóa câu hỏi, hàm `cleanupQuestionStats()` cố gắng shift các stats phía sau — nhưng logic này chỉ hoạt động đúng khi xóa ở cuối mảng và không xử lý được trường hợp đổi question set.

Tất cả 6 game modes (quiz, listen, flash, match, type, write) đều gọi `getPrioritizedDeck()` — hàm này dùng `getPriorityScore(questionIndex, gameType)` để tra cứu stats. Nếu index sai → priority sai → game ưu tiên sai câu hỏi.

## Goals / Non-Goals

**Goals:**
- Stats chính xác khi xóa/thêm/đổi question set
- Migration tự động từ format cũ → format mới (không mất dữ liệu)
- Không thay đổi cấu trúc question data (không thêm field `id`)
- Không breaking change — người dùng hiện tại không cần làm gì

**Non-Goals:**
- Không thay đổi công thức tính priority score
- Không thay đổi weighted random selection algorithm
- Không thêm field mới vào question object
- Không thay đổi UI/settings

## Decisions

### Decision 1: Hash algorithm — DJB2-style (bit manipulation)

**Chọn**: Simple string hash dùng DJB2-style bit operations, không cần thư viện ngoài.

```javascript
function hashQuestion(q) {
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

**Alternatives considered:**
- **UUID random**: Không deterministic — re-import cùng câu → mất stats
- **Crypto SHA-256**: Overkill, không có trong vanilla JS browser dễ dàng
- **Thêm field `id` vào question**: Breaking change cho data format, cần migrate tất cả existing data

**Why DJB2**: Đơn giản, deterministic, collision rate thấp cho dataset nhỏ (<10000 câu), không dependency.

### Decision 2: Migration strategy — One-time auto-migrate on load

Khi `loadQuestionStats()` phát hiện stats dùng format cũ (key dạng `q-\d+`):
1. Duyệt tất cả questions hiện tại
2. Generate hash ID cho từng câu
3. Map stats cũ (nếu có) sang ID mới dựa trên index
4. Ghi đè localStorage

**Risk**: Nếu question set đã bị thay đổi (xóa/thêm câu) trước khi migration → stats map sai. **Mitigation**: Migration chỉ chạy 1 lần, sau đó set flag `jq_stats_migrated = true`. Người dùng có thể reset stats nếu thấy bất thường.

### Decision 3: Cleanup stats khi xóa câu — Simple delete

Thay vì shift stats, chỉ cần `delete questionStats[generateQuestionId(question)]`. Không cần reindex.

### Decision 4: Game deck mapping — Store questionId thay vì originalIndex

Mỗi game khi tạo deck sẽ lưu `questionId: generateQuestionId(q)` thay vì `originalIndex: questions.indexOf(q)`. Khi gọi `updateQuestionStats()`, dùng `questionId` trực tiếp.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hash collision (2 câu khác nhau cùng hash) | Stats bị trộn | DJB2 với base36 cho string ~100 chars → collision rate cực thấp. Dataset < 10000 câu gần như không xảy ra |
| Migration map sai nếu set đã bị sửa | Stats sai cho một số câu | Flag `jq_stats_migrated` chỉ chạy 1 lần. Người dùng có thể reset stats trong Settings |
| Performance: hash tính mỗi lần render | Negligible | Hash 100 câu ~<1ms. Chỉ tính 1 lần khi start game |
| Stats cũ bị mất nếu migration fail | Mất lịch sử ôn tập | Backup stats trước khi migrate, rollback nếu error |

## Migration Plan

1. Deploy code mới (thay thế các file JS)
2. Người dùng mở app → `loadQuestionStats()` detect format cũ → tự động migrate
3. Migration hoàn tất → set `localStorage.jq_stats_migrated = "true"`
4. Từ lần sau: load stats mới trực tiếp, không migrate nữa

**Rollback**: Nếu phát hiện vấn đề, xóa `jq_stats_migrated` và `jq_question_stats` → app rebuild stats từ đầu.

## Open Questions

- Có nên thêm validation để detect hash collision không? (thêm Set check khi init)
- Có nên giữ backward compatibility cho `originalIndex` trong một thời gian transition không?
