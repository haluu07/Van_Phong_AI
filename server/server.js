import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { db } from './db.js';
import { antigravityBridge } from './antigravityBridge.js';

const PORT = process.env.PORT || 3001;
const AUTO_SIMULATION = process.env.AUTO_SIMULATION !== 'false'; // Mặc định bật mô phỏng tiến độ tác vụ

const app = express();
app.use(cors());
app.use(express.json());

// Tạo HTTP Server và WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Kết nối Antigravity Live Bridge
antigravityBridge.setContext(db, broadcast);
antigravityBridge.startWatcher();

// Hàm broadcast sự kiện tới tất cả client WebSocket đang kết nối
function broadcast(type, data) {
  const payload = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Lắng nghe kết nối WebSocket
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[WS] Client đã kết nối từ ${ip}. Tổng số client: ${wss.clients.size}`);

  // Gửi toàn bộ trạng thái ban đầu cho client mới
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    data: db.getState(),
    timestamp: new Date().toISOString()
  }));

  // Gửi thông tin Antigravity Live Session
  ws.send(JSON.stringify({
    type: 'ANTIGRAVITY_LIVE_SYNC',
    data: { session: antigravityBridge.getSession() },
    timestamp: new Date().toISOString()
  }));

  // Nhận thông điệp từ client nếu có
  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      } else if (parsed.type === 'ASSIGN_TASK') {
        const { agentId, task } = parsed.payload;
        const result = db.updateAgentTask(agentId, task);
        if (result) {
          broadcast('AGENT_UPDATED', result);
          broadcast('TASK_ADDED', result.task);
          broadcast('METRICS_UPDATED', result.metrics);
          runTaskSimulation(result.agent.id, result.task.id, task);
        }
      }
    } catch (err) {
      console.error('[WS] Lỗi xử lý message:', err.message);
    }
  });

  ws.on('close', () => {
    console.log(`[WS] Client ngắt kết nối. Còn lại: ${wss.clients.size}`);
  });
});

// Hàm mô phỏng tiến độ làm việc của Agent (nếu bật AUTO_SIMULATION)
function runTaskSimulation(agentId, taskId, taskTitle) {
  if (!AUTO_SIMULATION) return;

  // Bước 1: Sau 4 giây -> Agent log tiến trình xử lý
  setTimeout(() => {
    const logRes = db.addAgentLog(agentId, `Đang phân tích & xử lý bước 1 cho "${taskTitle}" (35%)`);
    if (logRes) {
      broadcast('AGENT_LOG', { agentId, log: logRes.log, agent: logRes.agent });
    }
    const updateTaskRes = db.updateTask(taskId, { progress: 35 });
    if (updateTaskRes) {
      broadcast('TASK_UPDATED', updateTaskRes.task);
    }
  }, 4000);

  // Bước 2: Sau 9 giây -> Tiến trình 80%
  setTimeout(() => {
    const logRes = db.addAgentLog(agentId, `Đang kiểm tra chất lượng & kết xuất dữ liệu (80%)`);
    if (logRes) {
      broadcast('AGENT_LOG', { agentId, log: logRes.log, agent: logRes.agent });
    }
    const updateTaskRes = db.updateTask(taskId, { progress: 80 });
    if (updateTaskRes) {
      broadcast('TASK_UPDATED', updateTaskRes.task);
    }
  }, 9000);

  // Bước 3: Sau 15 giây -> Hoàn tất nhiệm vụ
  setTimeout(() => {
    const updateTaskRes = db.updateTask(taskId, { status: 'Hoàn thành', progress: 100 });
    if (updateTaskRes) {
      broadcast('TASK_UPDATED', updateTaskRes.task);
      broadcast('METRICS_UPDATED', updateTaskRes.metrics);
    }
    const agentRes = db.getAgent(agentId);
    if (agentRes) {
      broadcast('AGENT_UPDATED', { agent: agentRes.agent, room: agentRes.room });
    }
  }, 15000);
}

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Kiểm tra trạng thái máy chủ (Healthcheck)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'Antigravity AI Office 3D Backend',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    activeWebSocketClients: wss.clients.size,
    timestamp: new Date().toISOString()
  });
});

// 2. Lấy toàn bộ trạng thái văn phòng (Phòng ban, Nhân sự, Tasks, Thống kê)
app.get('/api/office/state', (req, res) => {
  res.json({
    success: true,
    data: db.getState()
  });
});

// 3. Danh sách phòng ban
app.get('/api/rooms', (req, res) => {
  res.json({
    success: true,
    data: db.getRooms()
  });
});

// 4. Chi tiết 1 phòng ban
app.get('/api/rooms/:roomId', (req, res) => {
  const room = db.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy phòng ban' });
  }
  res.json({ success: true, data: room });
});

// 5. Danh sách toàn bộ 16 Agent
app.get('/api/agents', (req, res) => {
  res.json({
    success: true,
    data: db.getAgents()
  });
});

// 6. Chi tiết 1 Agent
app.get('/api/agents/:agentId', (req, res) => {
  const found = db.getAgent(req.params.agentId);
  if (!found) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy nhân sự AI' });
  }
  res.json({ success: true, data: found });
});

// 7. Giao việc cho 1 Agent cụ thể
app.post('/api/agents/:agentId/task', (req, res) => {
  const { task } = req.body;
  if (!task || !task.trim()) {
    return res.status(400).json({ success: false, message: 'Nhiệm vụ không được để trống' });
  }

  const result = db.updateAgentTask(req.params.agentId, task.trim());
  if (!result) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy agent' });
  }

  // Phát sóng sự kiện real-time
  broadcast('AGENT_UPDATED', result);
  broadcast('TASK_ADDED', result.task);
  broadcast('METRICS_UPDATED', result.metrics);

  // Kích hoạt mô phỏng tiến độ
  runTaskSimulation(req.params.agentId, result.task.id, task.trim());

  res.json({
    success: true,
    message: `Đã giao việc "${task}" cho ${result.agent.name}`,
    data: result
  });
});

// 8. Cập nhật trạng thái Agent (working, break, gaming, coffee, chat, idle, spotlight)
app.post('/api/agents/:agentId/status', (req, res) => {
  const { status, statusText } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'status là bắt buộc' });
  }

  const result = db.updateAgentStatus(req.params.agentId, status, statusText);
  if (!result) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy agent' });
  }

  broadcast('AGENT_STATUS_CHANGED', result);
  broadcast('METRICS_UPDATED', result.metrics);

  res.json({
    success: true,
    message: `Đã đổi trạng thái của ${result.agent.name} thành "${result.agent.statusText}"`,
    data: result
  });
});

// 9. Thêm log trực tiếp vào Terminal của Agent
app.post('/api/agents/:agentId/log', (req, res) => {
  const { log } = req.body;
  if (!log) {
    return res.status(400).json({ success: false, message: 'log không được để trống' });
  }

  const result = db.addAgentLog(req.params.agentId, log);
  if (!result) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy agent' });
  }

  broadcast('AGENT_LOG', { agentId: req.params.agentId, log: result.log, agent: result.agent });

  res.json({
    success: true,
    message: 'Đã thêm log thành công',
    data: result
  });
});

// 10. Danh sách Task
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    data: db.getState().tasks
  });
});

// 11. Tạo task mới
app.post('/api/tasks', (req, res) => {
  const { title, roomId, roomName, assignee, assigneeId } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Tiêu đề nhiệm vụ không được để trống' });
  }

  const result = db.createTask({
    title: title.trim(),
    roomId,
    roomName,
    assignee,
    assigneeId
  });

  broadcast('TASK_ADDED', result.task);
  if (result.agent) {
    broadcast('AGENT_UPDATED', { agent: result.agent, room: result.room });
  }
  broadcast('METRICS_UPDATED', result.metrics);

  if (result.agent) {
    runTaskSimulation(result.agent.id, result.task.id, result.task.title);
  }

  res.status(201).json({
    success: true,
    message: 'Tạo nhiệm vụ thành công',
    data: result
  });
});

// 12. Cập nhật task (trạng thái, progress)
app.patch('/api/tasks/:taskId', (req, res) => {
  const result = db.updateTask(req.params.taskId, req.body);
  if (!result) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy nhiệm vụ' });
  }

  broadcast('TASK_UPDATED', result.task);
  broadcast('METRICS_UPDATED', result.metrics);

  res.json({
    success: true,
    message: 'Cập nhật nhiệm vụ thành công',
    data: result
  });
});

// 13. Xóa task
app.delete('/api/tasks/:taskId', (req, res) => {
  const ok = db.deleteTask(req.params.taskId);
  if (!ok) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy nhiệm vụ' });
  }

  broadcast('TASK_DELETED', { taskId: req.params.taskId });
  res.json({ success: true, message: 'Đã xóa nhiệm vụ' });
});

// 14. Thống kê metrics
app.get('/api/metrics', (req, res) => {
  res.json({
    success: true,
    data: db.calculateMetrics()
  });
});

// 15. Webhook nhận sự kiện từ các Bot AI / Subagents bên ngoài
app.post('/api/webhook/agent-event', (req, res) => {
  const { agentId, event, data } = req.body;
  if (!agentId || !event) {
    return res.status(400).json({ success: false, message: 'agentId và event là bắt buộc' });
  }

  console.log(`[WEBHOOK] Nhận event "${event}" từ agent "${agentId}":`, data);

  switch (event) {
    case 'TASK_START': {
      const taskTitle = data?.task || data?.title || 'Nhiệm vụ mới';
      const result = db.updateAgentTask(agentId, taskTitle);
      if (result) {
        broadcast('AGENT_UPDATED', result);
        broadcast('TASK_ADDED', result.task);
        broadcast('METRICS_UPDATED', result.metrics);
      }
      break;
    }
    case 'LOG': {
      const logMessage = data?.message || data?.log;
      if (logMessage) {
        const result = db.addAgentLog(agentId, logMessage);
        if (result) {
          broadcast('AGENT_LOG', { agentId, log: result.log, agent: result.agent });
        }
      }
      break;
    }
    case 'TASK_COMPLETE': {
      const taskId = data?.taskId;
      if (taskId) {
        const result = db.updateTask(taskId, { status: 'Hoàn thành', progress: 100 });
        if (result) {
          broadcast('TASK_UPDATED', result.task);
          broadcast('METRICS_UPDATED', result.metrics);
        }
      }
      break;
    }
    case 'STATUS_CHANGE': {
      const status = data?.status || 'working';
      const statusText = data?.statusText;
      const result = db.updateAgentStatus(agentId, status, statusText);
      if (result) {
        broadcast('AGENT_STATUS_CHANGED', result);
        broadcast('METRICS_UPDATED', result.metrics);
      }
      break;
    }
    case 'THOUGHT': {
      const thought = data?.thought;
      if (thought) {
        const result = db.addAgentThought(agentId, thought);
        if (result) {
          broadcast('AGENT_THOUGHT', { agentId, thought });
        }
      }
      break;
    }
    default:
      console.warn(`[WEBHOOK] Event "${event}" không được nhận dạng`);
  }

  res.json({
    success: true,
    message: `Đã xử lý webhook event "${event}" cho agent ${agentId}`
  });
});

// 16. Reset dữ liệu về ban đầu
app.post('/api/reset', (req, res) => {
  const state = db.reset();
  broadcast('RESET_STATE', state);
  res.json({
    success: true,
    message: 'Đã reset dữ liệu văn phòng về ban đầu',
    data: state
  });
});

// 17. Antigravity Live Session & Event
app.get('/api/antigravity/session', (req, res) => {
  res.json({
    success: true,
    data: antigravityBridge.getSession()
  });
});

app.post('/api/antigravity/event', (req, res) => {
  const result = antigravityBridge.pushEvent(req.body);
  res.json({
    success: true,
    message: 'Đã cập nhật sự kiện Antigravity Live',
    data: result
  });
});

// Khởi động server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Antigravity AI Office Backend đang chạy!`);
  console.log(`📡 REST API:       http://localhost:${PORT}/api`);
  console.log(`⚡ WebSocket URL:  ws://localhost:${PORT}/ws`);
  console.log(`🩺 Health check:   http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
