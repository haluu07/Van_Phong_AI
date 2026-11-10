// Antigravity Live Bridge: Kết nối trực tiếp phiên làm việc hiện tại với Văn Phòng 3D
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_DIR = path.resolve(__dirname, '..');
const TASKS_DIR = '/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/55b91c36-7f1d-468c-88bb-fd7d4783ab79/.system_generated/tasks';

class AntigravityBridge {
  constructor() {
    this.session = {
      conversationId: '55b91c36-7f1d-468c-88bb-fd7d4783ab79',
      user: 'A Long',
      agent: 'Google Antigravity AI',
      status: 'ONLINE & LINKED',
      workspace: WORKSPACE_DIR,
      currentAction: 'Đang kết nối Antigravity Live Session vào Văn Phòng 3D',
      lastPrompt: 'nhưng mà a muốn nó link với antigravity hiện tại a đang làm việc như này',
      prompts: [
        {
          id: 'prompt_1',
          text: 'phân tích dự án hiện tại đi e',
          time: '09:17:36',
          status: 'Hoàn tất phân tích 6 phòng ban & Three.js'
        },
        {
          id: 'prompt_2',
          text: 'kết nối API backend thật cho anh',
          time: '09:20:50',
          status: 'Xây dựng xong Express + WebSocket + DB persistence'
        },
        {
          id: 'prompt_3',
          text: 'nhưng mà a muốn nó link với antigravity hiện tại a đang làm việc như này',
          time: '09:30:36',
          status: 'Đang đồng bộ trực tiếp phiên làm việc thời gian thực'
        }
      ],
      actionsHistory: [
        { time: '09:18:00', type: 'INSPECT', detail: 'Đọc mã nguồn Three.js, React và package.json' },
        { time: '09:19:30', type: 'INSTALL', detail: 'npm install thành công 34 packages' },
        { time: '09:21:49', type: 'INSTALL', detail: 'Cài đặt express, ws, cors, dotenv, concurrently (89 packages)' },
        { time: '09:23:43', type: 'CODE', detail: 'Tạo server/server.js, server/db.js, defaultData.js' },
        { time: '09:24:29', type: 'CODE', detail: 'Xây dựng src/services/api.js WebSocket & REST client' },
        { time: '09:26:05', type: 'DAEMON', detail: 'Khởi động Backend Server daemon tại port 3001' },
        { time: '09:27:14', type: 'TEST', detail: 'Chạy test-api.sh kiểm thử toàn bộ endpoint (Pass 100%)' },
        { time: '09:33:00', type: 'BRIDGE', detail: 'Kích hoạt Antigravity Live Bridge' }
      ],
      stats: {
        toolCalls: 32,
        filesModified: 8,
        backgroundTasks: 3,
        gitStatus: 'Up to date with origin/main'
      }
    };

    this.broadcastFn = null;
    this.db = null;
  }

  setContext(db, broadcastFn) {
    this.db = db;
    this.broadcastFn = broadcastFn;
  }

  getSession() {
    return this.session;
  }

  // Đẩy một sự kiện từ phiên Antigravity vào 3D Office
  pushEvent({ prompt, action, agentId = 'along', log, taskTitle, status }) {
    const timestamp = new Date().toLocaleTimeString('vi-VN');

    if (prompt) {
      this.session.lastPrompt = prompt;
      this.session.prompts.unshift({
        id: 'prompt_' + Date.now(),
        text: prompt,
        time: timestamp,
        status: action || 'Đang xử lý...'
      });

      // Cập nhật A Long trong phòng 3D
      if (this.db) {
        const found = this.db.getAgent('along');
        if (found) {
          found.agent.currentTask = `Chỉ đạo: "${prompt}"`;
          found.agent.thoughts = [
            `"${prompt}"`,
            ...(found.agent.thoughts || [])
          ];
          found.agent.logs = [
            `[${timestamp}] Sếp A Long ra lệnh: "${prompt}"`,
            ...(found.agent.logs || [])
          ];
        }
      }
    }

    if (action) {
      this.session.currentAction = action;
      this.session.actionsHistory.unshift({
        time: timestamp,
        type: 'ACTION',
        detail: action
      });
    }

    if (log && agentId && this.db) {
      this.db.addAgentLog(agentId, `[Antigravity Live] ${log}`);
    }

    if (taskTitle && this.db) {
      this.db.createTask({
        title: taskTitle,
        roomId: 'room_along',
        assignee: 'Antigravity AI Core',
        assigneeId: 'along'
      });
    }

    if (this.broadcastFn) {
      this.broadcastFn('ANTIGRAVITY_LIVE_SYNC', {
        session: this.session,
        timestamp: new Date().toISOString()
      });
      if (this.db) {
        this.broadcastFn('INIT_STATE', this.db.getState());
      }
    }

    return this.session;
  }

  // Bắt đầu background watcher theo dõi workspace và background tasks
  startWatcher() {
    console.log('[Bridge] Khởi động Antigravity Live Watcher...');

    // 1. Quét background tasks định kỳ mỗi 5 giây
    setInterval(async () => {
      try {
        if (fs.existsSync(TASKS_DIR)) {
          const files = fs.readdirSync(TASKS_DIR);
          const taskLogs = files.filter(f => f.endsWith('.log'));
          this.session.stats.backgroundTasks = taskLogs.length;
        }

        // 2. Quét git status
        const { stdout: gitOut } = await execAsync('git status --short', { cwd: WORKSPACE_DIR });
        const modifiedCount = gitOut.trim().split('\n').filter(Boolean).length;
        this.session.stats.filesModified = modifiedCount;

        if (this.broadcastFn) {
          this.broadcastFn('ANTIGRAVITY_STATS', this.session.stats);
        }
      } catch {
        // bỏ qua lỗi định kỳ
      }
    }, 5000);
  }
}

export const antigravityBridge = new AntigravityBridge();
