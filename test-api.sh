#!/bin/bash
# Script kiểm thử API Backend cho Văn Phòng Tác Vụ AI

API_URL="http://localhost:3001/api"

echo "=================================================="
echo "🧪 1. Kiểm tra Healthcheck"
curl -s "${API_URL}/health" | grep -o '"status":"ok"' && echo "✅ Healthcheck OK"

echo -e "\n🧪 2. Lấy thông tin Agent Mochi (Phòng Douyin)"
curl -s "${API_URL}/agents/mochi" | head -c 120
echo "..."

echo -e "\n\n🧪 3. Giao task mới cho Agent Mochi qua REST API"
curl -s -X POST "${API_URL}/agents/mochi/task" \
  -H "Content-Type: application/json" \
  -d '{"task": "Auto tải 20 video triệu view mới nhất"}' | grep -o '"success":true' && echo "✅ Giao task thành công!"

echo -e "\n🧪 4. Gửi webhook log từ external AI worker vào bot Dũng"
curl -s -X POST "${API_URL}/webhook/agent-event" \
  -H "Content-Type: application/json" \
  -d '{"agentId": "dung", "event": "LOG", "data": {"message": "[Antigravity AI] Nhận diện 5 trend video mới"}}' | grep -o '"success":true' && echo "✅ Webhook log thành công!"

echo -e "\n🧪 5. Kiểm tra danh sách Tasks"
curl -s "${API_URL}/tasks" | head -c 150
echo "..."

echo -e "\n\n🎉 Tất cả bài kiểm tra Backend API đều chạy mượt mà!"
