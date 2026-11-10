# 🏢 Antigravity AI Office 3D (Văn Phòng Tác Vụ AI)

Giao diện văn phòng ảo 3D tương tác mô phỏng các Subagents / Tác vụ tự động hóa của **Google Antigravity AI**, mang phong cách Cute Low-poly Isometric.

![Preview]


---

## ✨ Điểm nổi bật & Tính năng

1. **Không gian 3D Isometric chuẩn Studio**:
   - Dựng bằng Three.js với ánh sáng ấm cúng, bóng đổ mềm mại, đèn neon hắt sáng.
   - Các phòng ban chuyên trách:
     - 👑 **Phòng A Long**: Khu vực điều hành & chỉ huy AI với bàn làm việc VIP.
     - 🐶 **Phòng Báo Cáo**: Bục thuyết trình trung tâm rọi Spotlight hồng rực rỡ, biển neon phát sáng `BÁO CÁO`, chú cún **Tôm** đứng thuyết trình.
     - 🐻 **Phòng Douyin**: Bot Dũng, Mochi, Bơ chuyên cào & xử lý video.
     - 🦊 **Phòng Cắt Clip**: Bot Cường, Na, Mít cắt ghép highlight livestream tự động.
     - 🐨 **Phòng Lên Lịch**: Bot Lâm, Sữa, Bống, Cốm tự động hóa đăng bài.
     - ☕ **Khu Pantry & Giải Trí**: Bàn bóng bàn, máy pha cà phê, bánh kẹo.
2. **Nhân vật 3D Chibi siêu Cute**:
   - Tạo hình ngộ nghĩnh (Shiba, Mèo con, Cáo, Gấu trúc, Thỏ hồng, Koala...).
   - Hiệu ứng nhịp thở (Breathing), nhún nhảy (Bouncing), cử động gõ phím khi làm việc.
   - Bảng tên 3D và trạng thái lơ lửng trên đầu.
3. **Điều khiển & Tương tác thông minh**:
   - Click vào bất kỳ nhân vật nào: Camera tự động lướt lại gần, mở cửa sổ chi tiết xem suy nghĩ nội tâm, nhật ký Terminal và form giao việc mới.
   - Chế độ **"🎥 Tham quan" (Cinematic Tour)**: Camera tự động bay lướt qua từng phòng ban.
   - Nút chuyển góc nhìn nhanh từng phòng ở thanh dưới cùng.
   - Hiệu ứng âm thanh Pop & Chime cute qua Web Audio API.
   - Pháo hoa giấy (Confetti) bay tung tóe khi giao việc thành công!

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Trình duyệt sẽ tự động mở tại `http://localhost:3000`.

### 3. Build đóng gói sản phẩm
```bash
npm run build
```

---

## 🔌 Tích hợp với Antigravity AI (Backend Bridge)

Văn phòng 3D có thể kết nối trực tiếp với các Subagents của Antigravity thông qua WebSocket hoặc REST API:
- Khi một Agent của Antigravity bắt đầu nhận task $\rightarrow$ Gửi event về web client để nhân vật bước vào bàn làm việc, màn hình sáng đèn.
- Khi Agent hoàn thành $\rightarrow$ Nhân vật gửi báo cáo sang phòng Báo Cáo.
- Khi Agent rảnh $\rightarrow$ Nhân vật đi uống cà phê hoặc chơi bóng bàn.

---
© 2026 A Long & Antigravity AI. Crafted with ❤️.
