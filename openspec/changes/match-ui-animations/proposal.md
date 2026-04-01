## Why

Game Match hiện tại thiếu animations và visual feedback. UI còn đơn giản, chưa có hiệu ứng flip, match đúng/sai. Web cũng thiếu các animations toàn cục như screen transitions, button hovers. Cần cải thiện trải nghiệm người dùng với phong cách retro/arcade.

## What Changes

- Sửa favicon trong index.html (type="images/icon.jpg" → type="image/jpeg")
- Cải thiện Game Match UI: cards với flip animation (3D transform), match đúng có green glow + pulse, match sai có red shake
- Thêm entrance animation cho cards khi bắt đầu game
- Thêm global animations: screen transitions, button hover effects, toast slide-in
- Thêm toggle "Enable animations" trong Settings screen

## Capabilities

### New Capabilities

- `match-card-animations`: Flip, match success/fail animations cho game Match
- `global-animations`: Screen transitions, hover effects, toast animations với toggle
- `animation-settings-toggle`: Checkbox bật/tắt animations trong Settings

### Modified Capabilities

- (không có - đây là tính năng mới hoàn toàn)

## Impact

- **index.html**: Sửa favicon link, thêm animation toggle vào Settings
- **style.css**: Thêm CSS animations cho match cards, global transitions, button hovers
- **main.js**: Thêm animationEnabled vào settings, xử lý toggle
- **game-match.js**: Thêm animation classes khi flip/match
