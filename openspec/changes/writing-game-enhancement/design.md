## Context

Writing game hiện tại trong `game-write.js` sử dụng KanjiCanvas để user vẽ kanji. Khi user submit, hệ thống gọi `KanjiCanvas.recognize()` trả về danh sách candidates (text string). Logic hiện tại chỉ kiểm tra xem ký tự target có trong top 3 candidates không - nếu không thì hiện fallback typing.

Hiện tại:
- Mỗi question chứa một từ kanji (word), có thể có 1-4 kanji
- User phải vẽ toàn bộ từ → khó với từ dài
- Không có % match - chỉ đúng/sai
- Không có cách bỏ qua

## Goals / Non-Goals

**Goals:**
- Tách multi-kanji word thành từng kanji riêng để vẽ
- Hiển thị % match dựa trên candidate position  
- Cộng điểm theo tỷ lệ % match
- Thêm button Skip để bỏ qua khi không biết vẽ

**Non-Goals:**
- Thay đổi KanjiCanvas engine
- Thêm stroke count matching (cần data nét chuẩn cho từng kanji)
- Thay đổi các game khác (quiz, flash, match, type)

## Decisions

### 1. Tách kanji - Cơ chế

**Chọn**: Tách tại thời điểm render, mỗi kanji giữ nguyên data của từ gốc

**Alternatives considered:**
- Tách ngay khi load deck → Cần thay đổi cấu trúc deck
- Tạo kanji queue riêng → Phức tạp hơn

**Rationale**: Đơn giản, không thay đổi cấu trúc question gốc

```javascript
function getKanjiChars(word) {
  return word.split('').filter(c => /[\u4e00-\u9faf]/.test(c));
}
```

### 2. % Match - Cơ chế

**Chọn**: Dựa trên vị trí candidate trong danh sách KanjiCanvas trả về

**Alternatives considered:**
- Stroke count matching → Cần thêm data reference patterns cho mỗi kanji
- Custom confidence score → Không có data từ engine

**Rationale**: Đơn giản, tận dụng data có sẵn từ engine

```javascript
function calculateMatchScore(matchIndex) {
  if (matchIndex === 0) return 100;  // Top 1
  if (matchIndex === 1) return 70;   // Top 2
  if (matchIndex === 2) return 50;   // Top 3
  return 0;
}
```

### 3. Skip Button - UX

**Chọn**: Button nằm cạnh canvas, click = skip kanji hiện tại

**Alternatives considered:**
- Keyboard shortcut (Space/Esc) → User có thể vô tình bấm
- Context menu → Phức tạp hơn

**Rationale**: Rõ ràng, dễ thấy, tránh accidental click

## Risks / Trade-offs

- [Risk] User phải vẽ nhiều lần cho từ dài → **Mitigation**: Vẫn giữ nguyên số điểm, nhưng chia theo từng kanji
- [Risk] KanjiCanvas không chính xác với kanji đơn → **Mitigation**: Có typing fallback
- [Risk] % match dựa trên position có thể không chính xác → **Mitigation**: User có thể vẽ lại nếu không hài lòng

## Migration Plan

1. Thêm button Skip trong HTML (`index.html`)
2. Thêm logic tách kanji trong `renderWrite()` (`game-write.js`)
3. Thêm tính % match trong `checkWriteAnswer()` (`game-write.js`)
4. Thêm `skipWrite()` function (`game-write.js`)
5. Test với các từ multi-kanji (vd: 学生, 先生, 日本語)

## Open Questions

- Có cần hiển thị progress (vd: "2/3 kanji") cho từng từ không?
- Có nên shuffle thứ tự kanji trong từ không?
