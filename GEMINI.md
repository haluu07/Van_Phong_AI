# 🏢 Quy Tắc Tự Động Điều Khiển Văn Phòng 3D (Dành cho Antigravity Desktop & Web)

Khi Sếp **A Long** mở thư mục dự án này trên **Antigravity Desktop** (hoặc Web) và ra lệnh:

## 1. Nguyên tắc "Không Mock Data - Chỉ Triệu Hồi Khi Có Việc"
- Văn phòng 3D mặc định bắt đầu với **0 nhân vật Chibi** và **0 tác vụ**.
- **Chỉ khi A Long giao việc**, bạn (Antigravity) mới chạy lệnh `node office-cli.js` để triệu hồi nhân vật Chibi tương ứng vào đúng phòng ban và ngồi vào bàn làm việc.

## 2. Các lệnh điều khiển từ Antigravity Desktop
Mọi thao tác của Antigravity được đồng bộ trực tiếp qua `office-cli.js` (gọi vào `http://localhost:3001/api`):

```bash
# 1. Triệu hồi Chibi & giao việc vào phòng tương ứng:
# Mã phòng (roomId): room_douyin | room_cutclip | room_schedule | room_report | room_along
# Ngoại hình (type): cat | shiba | bear | panda | fox | rabbit | koala | boss
node office-cli.js task <ten_bot> "<noi_dung_cong_viec>" [roomId] [type]

# Ví dụ:
node office-cli.js task mochi "Tải 15 video Douyin mới nhất" room_douyin cat

# 2. Đẩy log tiến độ trực tiếp vào màn hình Terminal của nhân vật:
node office-cli.js log <ten_bot> "[Antigravity] Đã hoàn thành 50% công việc..."

# 3. Đổi trạng thái nhân vật (working | coffee | break | gaming | idle | spotlight):
node office-cli.js status <ten_bot> coffee "Đi pha cà phê"

# 4. Cho nhân vật nghỉ và biến mất khỏi văn phòng khi xong việc:
node office-cli.js dismiss <ten_bot>

# 5. Giải tán toàn bộ nhân vật & làm trống văn phòng về 0:
node office-cli.js reset
```
