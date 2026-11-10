import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_ROOMS, INITIAL_TASKS, CHIBI_PRESETS, AVATAR_TYPES } from './defaultData.js';

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
    statusColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  chat: {
    statusText: 'Ra pantry trò chuyện',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  coffee: {
    statusText: 'Đi pha cà phê',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  idle: {
    statusText: 'Nghỉ máy, chờ lệnh',
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
          console.log(`[DB] Đã tải dữ liệu từ ${DB_FILE} (${this.getAgents().length} nhân vật, ${this.tasks.length} task)`);
          return;
        }
      }
    } catch (err) {
      console.warn('[DB] Lỗi đọc db.json, khởi tạo lại từ defaultData:', err.message);
    }

    // Khởi tạo sạch (0 nhân vật, 0 task)
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
    if (!agentId) return null;
    const normalized = String(agentId).toLowerCase().trim();
    for (const r of this.rooms) {
      for (const m of r.members || []) {
        if (m.id.toLowerCase() === normalized || m.name.toLowerCase() === normalized) {
          return { agent: m, room: r };
        }
      }
    }
    return null;
  }

  // Tự động triệu hồi (spawn) một Chibi Agent vào phòng khi được giao việc
  spawnOrGetAgent({ agentId, agentName, agentType, agentRole, roomId }) {
    // 1. Kiểm tra nếu agent đã tồn tại trong văn phòng
    if (agentId) {
      const existing = this.getAgent(agentId);
      if (existing) return existing;
    }
    if (agentName) {
      const existingByName = this.getAgent(agentName);
      if (existingByName) return existingByName;
    }

    // 2. Tra cứu trong CHIBI_PRESETS nếu truyền mã quen thuộc (mochi, dung, cuong, sua, along...)
    const key = String(agentId || agentName || '').toLowerCase().trim();
    const preset = CHIBI_PRESETS[key];

    const targetRoomId = roomId || preset?.roomId || 'room_douyin';
    const room = this.getRoom(targetRoomId) || this.rooms[1] || this.rooms[0];

    // 3. Chọn vị trí bàn trống trong phòng
    const memberIndex = room.members.length;
    const slots = room.deskSlots && room.deskSlots.length > 0
      ? room.deskSlots
      : [[room.center[0], 0, room.center[2]]];
    const baseSlot = slots[memberIndex % slots.length];
    // Nếu vượt số bàn thì dịch nhẹ để không trùng nhau
    const offset = Math.floor(memberIndex / slots.length) * 1.4;
    const deskPos = [baseSlot[0] + offset, baseSlot[1], baseSlot[2]];

    // 4. Chọn hình dáng Chibi
    const randomAvatarObj = AVATAR_TYPES[memberIndex % AVATAR_TYPES.length];
    const finalType = agentType || preset?.type || randomAvatarObj.type;
    const matchedAvatarObj = AVATAR_TYPES.find(a => a.type === finalType) || randomAvatarObj;
    const finalAvatar = preset?.avatar || matchedAvatarObj.avatar;
    const finalName = agentName || preset?.name || `Agent #${this.getAgents().length + 1}`;
    const finalId = agentId || key || `agent_${Date.now()}`;
    const finalRole = agentRole || preset?.role || 'Chuyên viên AI';

    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const newAgent = {
      id: finalId,
      name: finalName,
      role: finalRole,
      type: finalType,
      avatar: finalAvatar,
      status: finalId === 'tom' || room.id === 'room_report' && memberIndex === 0 ? 'spotlight' : 'working',
      statusText: 'Đang làm việc',
      statusColor: STATUS_STYLES.working.statusColor,
      currentTask: 'Vừa được triệu hồi vào bàn làm việc',
      pos: [...deskPos],
      deskPos: [...deskPos],
      thoughts: [
        `Sếp A Long vừa giao việc, bắt tay vào xử lý ngay thôi!`
      ],
      logs: [
        `[${timestamp}] ✨ Triệu hồi nhân sự AI "${finalName}" vào ${room.name}`
      ]
    };

    room.members.push(newAgent);
    this.save();
    return { agent: newAgent, room };
  }

  updateAgentTask(agentId, newTask, options = {}) {
    const found = this.spawnOrGetAgent({
      agentId,
      agentName: options.agentName,
      agentType: options.agentType,
      agentRole: options.agentRole,
      roomId: options.roomId
    });
    if (!found) return null;

    const { agent, room } = found;
    agent.status = room.id === 'room_report' && agent.id === 'tom' ? 'spotlight' : 'working';
    agent.statusText = agent.status === 'spotlight' ? 'Đang đứng báo cáo' : 'Đang làm việc';
    agent.statusColor = STATUS_STYLES[agent.status].statusColor;
    agent.currentTask = newTask;
    // Đưa nhân vật về lại bàn làm việc
    if (agent.deskPos) {
      agent.pos = [...agent.deskPos];
    }

    const timestamp = new Date().toLocaleTimeString('vi-VN');
    agent.logs = [
      `[${timestamp}] Nhận nhiệm vụ: "${newTask}"`,
      ...(agent.logs || [])
    ];
    agent.thoughts = [
      `Đang tập trung xử lý: "${newTask}"`,
      ...(agent.thoughts || [])
    ];

    const taskObj = {
      id: 'task_' + Date.now(),
      title: newTask,
      roomName: room.name,
      roomId: room.id,
      assignee: agent.name,
      assigneeId: agent.id,
      status: 'Đang làm việc',
      progress: 10,
      time: timestamp
    };
    this.tasks.unshift(taskObj);

    this.save();
    return { agent, room, task: taskObj, rooms: this.rooms, metrics: this.calculateMetrics() };
  }

  updateAgentStatus(agentId, newStatus, customStatusText = null) {
    const found = this.spawnOrGetAgent({ agentId });
    if (!found) return null;

    const { agent, room } = found;
    const style = STATUS_STYLES[newStatus] || {
      statusText: newStatus,
      statusColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    };

    agent.status = newStatus;
    agent.statusText = customStatusText || style.statusText;
    agent.statusColor = style.statusColor;

    // Di chuyển vị trí nhân vật theo trạng thái
    if (newStatus === 'break') {
      agent.pos = [5.2, 0, -7.8]; // Bàn bóng bàn
    } else if (newStatus === 'coffee' || newStatus === 'chat') {
      agent.pos = [3.8, 0, -5.5]; // Khu pha cà phê Pantry
    } else if (newStatus === 'gaming') {
      agent.pos = [7.2, 0, -6.5]; // Khu giải trí
    } else if (newStatus === 'spotlight') {
      agent.pos = [0, 0, 0]; // Bục Spotlight trung tâm
    } else if (agent.deskPos) {
      agent.pos = [...agent.deskPos]; // Về bàn làm việc
    }

    const timestamp = new Date().toLocaleTimeString('vi-VN');
    agent.logs = [
      `[${timestamp}] Chuyển trạng thái: "${agent.statusText}"`,
      ...(agent.logs || [])
    ];

    this.save();
    return { agent, room, rooms: this.rooms, metrics: this.calculateMetrics() };
  }

  removeAgent(agentId) {
    const normalized = String(agentId).toLowerCase().trim();
    for (const r of this.rooms) {
      const idx = r.members.findIndex(
        m => m.id.toLowerCase() === normalized || m.name.toLowerCase() === normalized
      );
      if (idx !== -1) {
        const removed = r.members.splice(idx, 1)[0];
        this.save();
        return { removed, rooms: this.rooms, metrics: this.calculateMetrics() };
      }
    }
    return null;
  }

  addAgentLog(agentId, logMessage) {
    const found = this.spawnOrGetAgent({ agentId });
    if (!found) return null;

    const { agent } = found;
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const formattedLog = logMessage.startsWith('[') ? logMessage : `[${timestamp}] ${logMessage}`;
    agent.logs = [formattedLog, ...(agent.logs || [])];

    this.save();
    return { agent, log: formattedLog, rooms: this.rooms };
  }

  addAgentThought(agentId, thought) {
    const found = this.spawnOrGetAgent({ agentId });
    if (!found) return null;

    const { agent } = found;
    agent.thoughts = [thought, ...(agent.thoughts || [])];
    this.save();
    return { agent, thought };
  }

  createTask({ title, roomId, roomName, assignee, assigneeId, agentType, agentRole }) {
    const spawnRes = this.spawnOrGetAgent({
      agentId: assigneeId,
      agentName: assignee,
      agentType,
      agentRole,
      roomId: roomId || 'room_douyin'
    });

    const resolvedAgent = spawnRes?.agent;
    const resolvedRoom = spawnRes?.room;

    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const taskObj = {
      id: 'task_' + Date.now(),
      title,
      roomName: resolvedRoom ? resolvedRoom.name : (roomName || 'Văn phòng'),
      roomId: resolvedRoom ? resolvedRoom.id : roomId,
      assignee: resolvedAgent ? resolvedAgent.name : (assignee || 'Bot AI'),
      assigneeId: resolvedAgent ? resolvedAgent.id : assigneeId,
      status: 'Đang làm việc',
      progress: 10,
      time: timestamp
    };

    if (resolvedAgent) {
      resolvedAgent.status = 'working';
      resolvedAgent.statusText = 'Đang làm việc';
      resolvedAgent.statusColor = STATUS_STYLES.working.statusColor;
      resolvedAgent.currentTask = title;
      if (resolvedAgent.deskPos) {
        resolvedAgent.pos = [...resolvedAgent.deskPos];
      }
      resolvedAgent.logs = [
        `[${timestamp}] Nhận nhiệm vụ mới: "${title}"`,
        ...(resolvedAgent.logs || [])
      ];
      resolvedAgent.thoughts = [
        `Đang thực thi nhiệm vụ: "${title}"`,
        ...(resolvedAgent.thoughts || [])
      ];
    }

    this.tasks.unshift(taskObj);
    this.save();
    return {
      task: taskObj,
      agent: resolvedAgent,
      room: resolvedRoom,
      rooms: this.rooms,
      metrics: this.calculateMetrics()
    };
  }

  updateTask(taskId, updates) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return null;

    Object.assign(task, updates);

    if (updates.status === 'Hoàn thành' && task.assigneeId) {
      const found = this.getAgent(task.assigneeId);
      if (found) {
        const timestamp = new Date().toLocaleTimeString('vi-VN');
        found.agent.logs = [
          `[${timestamp}] ✅ Hoàn thành nhiệm vụ: "${task.title}"`,
          ...(found.agent.logs || [])
        ];
        found.agent.status = 'idle';
        found.agent.statusText = 'Đã xong việc • Chờ lệnh';
        found.agent.statusColor = STATUS_STYLES.idle.statusColor;
        found.agent.currentTask = 'Hoàn thành nhiệm vụ • Đang chờ lệnh mới';
      }
    }

    this.save();
    return { task, rooms: this.rooms, metrics: this.calculateMetrics() };
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
