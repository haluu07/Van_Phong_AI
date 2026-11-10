# 🔌 Hướng Dẫn Kết Nối API Backend Thật (Antigravity AI Office 3D)

Hệ thống Văn Phòng Tác Vụ AI hiện đã được trang bị **Backend REST API + WebSocket Real-time** hoàn chỉnh, hỗ trợ lưu trữ trạng thái bền vững (Persistence) và kết nối với các AI Agents, Python Workers, Bot Telegram hoặc hệ thống tự động hóa bên ngoài.

---

## 🚀 Khởi chạy Server

### 1. Chạy Backend API (Port 3001)
```bash
npm run server
```

### 2. Chạy Fullstack (Cả Backend & Frontend Vite)
```bash
npm run dev:all
```
* **Frontend UI**: `http://localhost:3000` (đã cấu hình Proxy tự động chuyển `/api` và `/ws` sang backend).
* **Backend REST API**: `http://localhost:3001/api`
* **Realtime WebSocket**: `ws://localhost:3001/ws`

---

## 📡 Danh sách REST API Endpoints

### 1. Kiểm tra trạng thái máy chủ
```http
GET /api/health
```
**Response mẫu:**
```json
{
  "status": "ok",
  "name": "Antigravity AI Office 3D Backend",
  "version": "1.0.0",
  "uptime": 120,
  "activeWebSocketClients": 1,
  "timestamp": "2026-11-10T09:26:13.533Z"
}
```

---

### 2. Lấy toàn bộ trạng thái văn phòng (State)
```http
GET /api/office/state
```
Trả về toàn bộ danh sách phòng ban, trạng thái các bot, log terminal, danh sách tasks và thống kê metrics.

---

### 3. Giao việc cho một Agent cụ thể
```http
POST /api/agents/:agentId/task
Content-Type: application/json

{
  "task": "Tải 20 video Douyin 4K ngách AI Visual"
}
```
* **Tác động:** 
  - Đổi trạng thái bot sang `working` ("Đang làm việc").
  - Thêm log nhận việc vào Terminal của bot.
  - Tự động tạo task mới trong danh sách tasks.
  - Bắn sự kiện WebSocket real-time đến tất cả trình duyệt đang mở 3D.
  - (Tùy chọn) Kích hoạt mô phỏng tiến độ 35% -> 80% -> Hoàn thành.

---

### 4. Đổi trạng thái nhân sự AI
```http
POST /api/agents/:agentId/status
Content-Type: application/json

{
  "status": "break",
  "statusText": "Chơi bóng bàn"
}
```
* **Các status hỗ trợ:**
  - `working`: Đang làm việc tại bàn
  - `break`: Giải lao / chơi bóng bàn
  - `gaming`: Chơi máy game arcade
  - `coffee`: Đi pha cà phê
  - `chat`: Ra pantry trò chuyện
  - `idle`: Nghỉ máy, chờ giờ chạy
  - `spotlight`: Đứng thuyết trình tại bục báo cáo hồng neon

---

### 5. Thêm log trực tiếp vào Terminal Agent
```http
POST /api/agents/:agentId/log
Content-Type: application/json

{
  "log": "[Worker-01] Đang khử nhiễu watermark khung hình 1080p..."
}
```

---

### 6. Webhook nhận sự kiện từ Agent / Worker bên ngoài
```http
POST /api/webhook/agent-event
Content-Type: application/json

{
  "agentId": "mochi",
  "event": "TASK_START",
  "data": {
    "task": "Tải 50 video Douyin"
  }
}
```

**Các event hỗ trợ:**
* `TASK_START`: Bắt đầu nhận task mới (`data: { task: "..." }`)
* `LOG`: Ghi nhật ký vào terminal của bot (`data: { message: "..." }`)
* `TASK_COMPLETE`: Hoàn thành task (`data: { taskId: "..." }`)
* `STATUS_CHANGE`: Thay đổi trạng thái (`data: { status: "coffee", statusText: "Đi pha cà phê" }`)
* `THOUGHT`: Cập nhật suy nghĩ nội tâm của bot (`data: { thought: "Đoạn video này triệu view chắc luôn!" }`)

---

## 🐍 Ví dụ tích hợp Python (cho Bot / Worker của anh)

```python
import requests

API_URL = "http://localhost:3001/api"

# 1. Giao task cho bot Mochi
res = requests.post(f"{API_URL}/agents/mochi/task", json={
    "task": "Cào 10 video Douyin ngách AI Coding"
})
print("Giao việc:", res.json())

# 2. Bắn log tiến độ theo thời gian thực vào 3D
requests.post(f"{API_URL}/agents/mochi/log", json={
    "log": "[DouyinBot] Đã tải xong video ID #884912"
})

# 3. Khi hoàn tất, đổi trạng thái đi uống cà phê
requests.post(f"{API_URL}/agents/mochi/status", json={
    "status": "coffee",
    "statusText": "Uống cà phê giải lao"
})
```

---

## ⚡ WebSocket Real-time Protocol

* **URL kết nối:** `ws://localhost:3001/ws`
* Khi kết nối thành công, Server gửi ngay:
  ```json
  {
    "type": "INIT_STATE",
    "data": { "rooms": [...], "tasks": [...], "metrics": {...} }
  }
  ```
* Khi có bất kỳ thay đổi nào từ REST API hoặc Webhook, Server sẽ phát sóng (broadcast) các event:
  - `AGENT_UPDATED`
  - `AGENT_STATUS_CHANGED`
  - `AGENT_LOG`
  - `TASK_ADDED`
  - `TASK_UPDATED`
  - `METRICS_UPDATED`
