## Why

Logic tính % match trong writing game hiện tại phức tạp và gây tranh cãi (matchIndex 0=100%, 1=90%, 2=80%...). Thay vào đó, chỉ cần kiểm tra xem KanjiCanvas có nhận ra kanji đó hay không - nếu có thì pass, không thì fail và cho retry.

## What Changes

1. **Đơn giản hóa logic check**: Thay vì tính % theo vị trí, chỉ kiểm tra xem target kanji có trong danh sách candidates không
2. **Bỏ calculateMatchScore()**: Không cần hàm tính % nữa
3. **Pass khi nhận ra**: targetKanji ∈ candidates → pass
4. **Fail khi không nhận**: targetKanji ∉ candidates → fail + cho retry
5. **Feedback đơn giản**: Hiển thị "✓ Correct!" hoặc "✗ Not recognized"

## Capabilities

### New Capabilities
- `writing-game-simple-check`: Kiểm tra đơn giản - pass nếu KanjiCanvas nhận ra bất kỳ kanji nào phù hợp

### Modified Capabilities
- `writing-game-match-percentage`: Bị loại bỏ vì logic % không còn cần thiết

## Impact

- **Files**: `game-write.js`
- **Logic**: Thay đổi hàm `checkWriteAnswer()` và `checkWritePracticeAnswer()`
- **UI**: Feedback đơn giản hơn (không hiển thị % nữa)
