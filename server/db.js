import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_ROOMS, INITIAL_TASKS } from './defaultData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Trạng thái màu mặc định theo status
const STATUS_STYLES = {
  working: {
    statusText: 'Đang làm việc',
    statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  break: {
    statusText: 'Chơi bóng bàn / Giải lao',
    statusColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
  },
  gaming: {
    statusText: 'Chơi máy game',
    statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  chat: {
    statusText: 'Ra pantry trò chuyện',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  coffee: {
    statusText: 'Đi pha cà phê',
    statusColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  },
  idle: {
    statusText: 'Nghỉ máy, chờ giờ chạy',
    statusColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  },
  spotlight: {
    statusText: 'Đang đứng báo cáo',
    statusColor: 'bg-pink-500/30 text-pink-300 border-pink-500 animate-pulse'
  }
};

class OfficeDatabase {
  constructor() {
    this.rooms = [];
    this.tasks = [];
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.rooms && Array.isArray(parsed.rooms)) {
          this.rooms = parsed.rooms;
          this.tasks = parsed.tasks || [];
          console.log(`[DB] Đã tải dữ liệu từ ${DB_FILE} (${this.rooms.length} phòng, ${this.tasks.length} task)`);
          return;
        }
      }
    } catch (err) {
      console.warn('[DB] Lỗi đọc db.json, khởi tạo lại từ defaultData:', err.message);
    }

    // Khởi tạo từ defaultData
    this.rooms = JSON.parse(JSON.stringify(INITIAL_ROOMS));
    this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.save();
  }

  save() {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const data = {
        updatedAt: new Date().toISOString(),
        rooms: this.rooms,
        tasks: this.tasks
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Lỗi lưu db.json:', err.message);
    }
  }

  reset() {
    this.rooms = JSON.parse(JSON.stringify(INITIAL_ROOMS));
    this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.save();
    return this.getState();
  }

  calculateMetrics() {
    let working = 0;
    let chat = 0;
    let gaming = 0;
    let idle = 0;
    let away = 0;

    for (const r of this.rooms) {
      for (const m of r.members || []) {
        if (m.status === 'working' || m.status === 'spotlight') working++;
        else if (m.status === 'chat') chat++;
        else if (m.status === 'gaming') gaming++;
        else if (m.status === 'idle') idle++;
        else if (m.status === 'break' || m.status === 'coffee') away++;
        else idle++;
      }
    }

    return {
      working,
      chat,
      gaming,
      idle,
      away,
      connected: true
    };
  }

  getState() {
    return {
      rooms: this.rooms,
      tasks: this.tasks,
      metrics: this.calculateMetrics()
    };
  }

  getRooms() {
    return this.rooms;
  }

  getRoom(roomId) {
    return this.rooms.find(r => r.id === roomId);
  }

  getAgents() {
    const list = [];
    for (const r of this.rooms) {
      for (const m of r.members || []) {
        list.push({ ...m, roomId: r.id, roomName: r.name });
      }
    }
    return list;
  }

  getAgent(agentId) {
    for (const r of this.rooms) {
      for (const m of r.members || []) {
        if (m.id === agentId) {
          return { agent: m, room: r };
        }
      }
    }
    return null;
  }

  updateAgentTask(agentId, newTask) {
    const found = this.getAgent(agentId);
    if (!found) return null;

    const { agent, room } = found;
    agent.status = 'working';
    agent.statusText = 'Đang làm việc';
    agent.statusColor = STATUS_STYLES.working.statusColor;
    agent.currentTask = newTask;

    const timestamp = new Date().toLocaleTimeString('vi-VN');
    agent.logs = [
      `[${timestamp}] Nhận nhiệm vụ mới: "${newTask}"`,
      ...(agent.logs || [])
    ];

    // Thêm task vào danh sách tasks
    const taskObj = {
      id: 'task_' + Date.now(),
      title: newTask,
      roomName: room.name,
      roomId: room.id,
      assignee: agent.name,
      assigneeId: agent.id,
      status: 'Đang làm việc',
      progress: 0,
      time: timestamp
    };
    this.tasks.unshift(taskObj);

    this.save();
    return { agent, room, task: taskObj, metrics: this.calculateMetrics() };
  }

  updateAgentStatus(agentId, newStatus, customStatusText = null) {
    const found = this.getAgent(agentId);
    if (!found) return null;

    const { agent, room } = found;
    const style = STATUS_STYLES[newStatus] || {
      statusText: newStatus,
      statusColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    };

    agent.status = newStatus;
    agent.statusText = customStatusText || style.statusText;
    agent.statusColor = style.statusColor;

    const timestamp = new Date().toLocaleTimeString('vi-VN');
    agent.logs = [
      `[${timestamp}] Cập nhật trạng thái: "${agent.statusText}"`,
      ...(agent.logs || [])
    ];

    this.save();
    return { agent, room, metrics: this.calculateMetrics() };
  }

  addAgentLog(agentId, logMessage) {
    const found = this.getAgent(agentId);
    if (!found) return null;

    const { agent } = found;
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const formattedLog = logMessage.startsWith('[') ? logMessage : `[${timestamp}] ${logMessage}`;
    agent.logs = [formattedLog, ...(agent.logs || [])];

    this.save();
    return { agent, log: formattedLog };
  }

  addAgentThought(agentId, thought) {
    const found = this.getAgent(agentId);
    if (!found) return null;

    const { agent } = found;
    agent.thoughts = [thought, ...(agent.thoughts || [])];
    this.save();
    return { agent, thought };
  }

  createTask({ title, roomId, roomName, assignee, assigneeId }) {
    let resolvedRoom = null;
    let resolvedAgent = null;

    if (roomId) {
      resolvedRoom = this.getRoom(roomId);
    }
    if (assigneeId) {
      const found = this.getAgent(assigneeId);
      if (found) {
        resolvedAgent = found.agent;
        if (!resolvedRoom) resolvedRoom = found.room;
      }
    } else if (resolvedRoom && resolvedRoom.members && resolvedRoom.members.length > 0) {
      resolvedAgent = resolvedRoom.members[0];
    }

    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const taskObj = {
      id: 'task_' + Date.now(),
      title,
      roomName: resolvedRoom ? resolvedRoom.name : (roomName || 'Văn phòng'),
      roomId: resolvedRoom ? resolvedRoom.id : roomId,
      assignee: resolvedAgent ? resolvedAgent.name : (assignee || 'Bot tự động'),
      assigneeId: resolvedAgent ? resolvedAgent.id : assigneeId,
      status: 'Đang xử lý',
      progress: 0,
      time: timestamp
    };

    if (resolvedAgent) {
      resolvedAgent.status = 'working';
      resolvedAgent.statusText = 'Đang làm việc';
      resolvedAgent.statusColor = STATUS_STYLES.working.statusColor;
      resolvedAgent.currentTask = title;
      resolvedAgent.logs = [
        `[${timestamp}] Nhận nhiệm vụ mới: "${title}"`,
        ...(resolvedAgent.logs || [])
      ];
    }

    this.tasks.unshift(taskObj);
    this.save();
    return { task: taskObj, agent: resolvedAgent, room: resolvedRoom, metrics: this.calculateMetrics() };
  }

  updateTask(taskId, updates) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return null;

    Object.assign(task, updates);

    // Nếu task hoàn thành, cập nhật log của agent
    if (updates.status === 'Hoàn thành' && task.assigneeId) {
      const found = this.getAgent(task.assigneeId);
      if (found) {
        const timestamp = new Date().toLocaleTimeString('vi-VN');
        found.agent.logs = [
          `[${timestamp}] ✅ Hoàn thành nhiệm vụ: "${task.title}"`,
          ...(found.agent.logs || [])
        ];
        found.agent.currentTask = 'Chờ nhiệm vụ tiếp theo...';
      }
    }

    this.save();
    return { task, metrics: this.calculateMetrics() };
  }

  deleteTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    this.save();
    return true;
  }
}

export const db = new OfficeDatabase();
