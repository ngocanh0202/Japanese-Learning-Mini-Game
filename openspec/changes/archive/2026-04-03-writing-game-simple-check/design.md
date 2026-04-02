## Context

Writing game hiện tại sử dụng logic tính % match dựa trên vị trí của kanji trong danh sách candidates:
- matchIndex 0 = 100%, 1 = 90%, 2 = 80%... (mỗi index giảm 10%)
- Điều này gây tranh cãi và phức tạp không cần thiết

Thực tế: KanjiCanvas đã làm việc tốt trong việc nhận diện kanji - nếu nó nhận ra (nằm trong candidates) thì user đã vẽ đúng, không cần phân biệt %.

## Goals / Non-Goals

**Goals:**
- Đơn giản hóa logic kiểm tra kanji
- Pass khi KanjiCanvas nhận ra bất kỳ kanji nào phù hợp
- Feedback rõ ràng: "Correct!" hoặc "Not recognized"

**Non-Goals:**
- Thay đổi cách KanjiCanvas hoạt động
- Thêm tính năng mới cho writing game
- Thay đổi các game khác

## Decisions

### 1. Logic kiểm tra

**Chọn**: Kiểm tra đơn giản - targetKanji có trong candidates không

**Alternatives considered:**
- Giữ nguyên logic % → Phức tạp, gây tranh cãi
- Tính stroke similarity → Cần thêm data

**Rationale**: KanjiCanvas đã nhận diện tốt, chỉ cần biết "có" hoặc "không"

```javascript
const candidatesText = KanjiCanvas.recognize('writeCanvas');
const isRecognized = candidatesText.includes(targetChar);
```

### 2. Feedback messages

**Chọn**: "✓ Correct!" / "✗ Not recognized"

**Rationale**: Ngắn gọn, dễ hiểu, không gây tranh cãi về %

### 3. Xử lý khi fail

**Chọn**: Hiện thông báo fail + cho retry (Try Again)

**Rationale**: User có thể vẽ lại, không trừ HP thêm cho lần retry đầu

## Risks / Trade-offs

- [Risk] User vẽ xấu nhưng vẫn pass → **Mitigation**: Đây là behavior đúng của KanjiCanvas - nó hỗ trợ vẽ sai nét
- [Risk] User không biết mình pass ở vị trí nào → **Mitigation**: Không cần biết, chỉ cần biết "đúng"

## Migration Plan

1. Xóa hàm `calculateMatchScore()` trong game-write.js
2. Sửa `checkWriteAnswer()` - kiểm tra đơn giản: `candidatesText.includes(targetChar)`
3. Sửa feedback: "✓ Correct!" hoặc "✗ Not recognized"
4. Giữ nguyên flow Try Again / Next sau khi check

## Open Questions

- (none)
