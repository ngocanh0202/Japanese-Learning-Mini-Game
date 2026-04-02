## Why

Writing game hiện tại yêu cầu user vẽ toàn bộ từ kanji (vd: 学生), nhưng nhiều user mới bắt đầu gặp khó khăn khi vẽ từ phức tạp. Ngoài ra, không có cơ chế feedback phần trăm match để user biết mình vẽ "gần đúng" hay "sai hoàn toàn", và cũng không có cách bỏ qua khi không biết vẽ.

## What Changes

1. **Tách kanji**: Multi-kanji word (vd: 学生 = 学 + 生) sẽ được tách thành từng kanji riêng để user vẽ từng ký tự thay vì cả từ
2. **Phần trăm match**: Sau khi vẽ, hiển thị % match dựa trên vị trí candidate:
   - Top 1 = 100% điểm
   - Top 2 = 70% điểm
   - Top 3 = 50% điểm
   - Không match = hiện typing fallback
3. **Skip button**: Thêm button để bỏ qua kanji hiện tại khi không biết vẽ
4. **Cộng điểm theo %**: Điểm thưởng được tính theo tỷ lệ % match (100% = full điểm, 70% = 70% điểm)

## Capabilities

### New Capabilities
- `writing-game-kanji-split`: Tách multi-kanji word thành từng kanji riêng để vẽ
- `writing-game-match-percentage`: Tính và hiển thị % match dựa trên candidate position
- `writing-game-skip-button`: Cho phép user bỏ qua kanji không biết vẽ

### Modified Capabilities
- (none)

## Impact

- **Files**: `game-write.js`, `index.html`
- **UI**: Thêm button Skip trong màn hình writing
- **Logic**: Thay đổi cách spawn question và tính điểm
