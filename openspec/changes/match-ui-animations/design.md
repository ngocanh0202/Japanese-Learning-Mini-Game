## Context

Game Match hiện tại dùng grid đơn giản, không có animations. Khi click cards chỉ hiện nội dung, không có flip effect. Khi match đúng/sai không có visual feedback rõ ràng. Toàn bộ web cũng thiếu animations cho screen transitions và button interactions.

Project là vanilla HTML/CSS/JS, chạy trực tiếp trên browser.

## Goals / Non-Goals

**Goals:**
- Sửa favicon icon trong index.html
- Thêm flip animation (3D rotate) cho match cards
- Thêm visual feedback khi match đúng (green glow + pulse)
- Thêm visual feedback khi match sai (red shake)
- Thêm entrance animation khi bắt đầu game
- Thêm global screen transitions
- Thêm button hover effects
- Thêm animation toggle trong Settings

**Non-Goals:**
- Không thay đổi gameplay logic
- Không thêm JavaScript animations phức tạp (dùng CSS)
- Không thay đổi cấu trúc DOM cơ bản

## Decisions

### 1. CSS Animations vs JavaScript Animations

**Decision**: Dùng hoàn toàn CSS animations

**Rationale**: 
- Performance tốt hơn (GPU-accelerated)
- Code đơn giản hơn
- Dễ toggle on/off bằng class
- Retro/arcade style dễ làm với CSS keyframes

### 2. Animation Toggle Implementation

**Decision**: Thêm `animationEnabled: true` vào settings object, dùng CSS class `.animations-enabled` trên body để enable/disable

**Rationale**: 
- Khi toggle off: thêm class `.animations-disabled` → tắt tất cả transition/transform
- Đơn giản, không cần thay đổi JavaScript logic
- CSS-only solution

### 3. Match Card Flip Implementation

**Decision**: Dùng `transform: rotateY(180deg)` với `transform-style: preserve-3d`

**Rationale**: 
- Tạo hiệu ứng flip thật sự
- Có thể show/hide content bằng backface-visibility
- Smooth performance

## Risks / Trade-offs

- **[Risk] Browser compatibility**: transform-3d có thể không supported trên very old browsers → **Mitigation**: Thêm fallback cho IE11, nhưng project này target modern browsers
- **[Risk] Animation lag trên mobile**: CSS animations vẫn có thể lag → **Mitigation**: Toggle để user có thể tắt nếu cần
- **[Trade-off] Performance vs Visual**: Nhiều animations có thể gây lag → **Mitigation**: Mặc định bật, nhưng user có thể tắt
