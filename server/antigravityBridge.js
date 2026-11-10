// Antigravity Live Bridge: Kết nối trực tiếp phiên làm việc hiện tại với Văn Phòng 3D (Sạch 100%, không chứa mock data)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_DIR = path.resolve(__dirname, '..');

class AntigravityBridge {
  constructor() {
    this.session = {
      user: 'A Long',
      agent: 'Google Antigravity AI',
      status: 'READY',
      workspace: WORKSPACE_DIR,
      currentAction: 'Văn phòng đang trống • Chờ Sếp A Long giao việc',
      lastPrompt: '',
      prompts: [],
      actionsHistory: [],
      stats: {
        activeAgents: 0,
        activeTasks: 0,
        filesModified: 0,
        gitStatus: 'Clean'
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
    if (this.db) {
      this.session.stats.activeAgents = this.db.getAgents().length;
      this.session.stats.activeTasks = this.db.getState().tasks.length;
    }
    return this.session;
  }

  resetSession() {
    this.session.currentAction = 'Văn phòng đang trống • Chờ Sếp A Long giao việc';
    this.session.lastPrompt = '';
    this.session.prompts = [];
    this.session.actionsHistory = [];
    this.session.stats.activeAgents = 0;
    this.session.stats.activeTasks = 0;
    return this.session;
  }

  // Đẩy một sự kiện từ phiên Antigravity (Desktop hoặc Web) vào 3D Office
  pushEvent({ prompt, action, agentId, agentName, agentType, roomId, log, taskTitle }) {
    const timestamp = new Date().toLocaleTimeString('vi-VN');

    if (prompt) {
      this.session.lastPrompt = prompt;
      this.session.prompts.unshift({
        id: 'prompt_' + Date.now(),
        text: prompt,
        time: timestamp,
        status: action || 'Đang thực thi'
      });

      // Khi A Long ra lệnh, triệu hồi hoặc cập nhật nhân vật A Long trong phòng chỉ huy
      if (this.db) {
        const res = this.db.spawnOrGetAgent({
          agentId: 'along',
          agentName: 'A Long',
          agentType: 'boss',
          agentRole: 'Tổng chỉ huy',
          roomId: 'room_along'
        });
        if (res && res.agent) {
          res.agent.currentTask = `Chỉ đạo: "${prompt}"`;
          res.agent.thoughts = [`"${prompt}"`, ...(res.agent.thoughts || [])];
          res.agent.logs = [
            `[${timestamp}] 👑 Chỉ đạo: "${prompt}"`,
            ...(res.agent.logs || [])
          ];
          this.db.save();
        }
      }
    }

    if (action) {
      this.session.currentAction = action;
      this.session.actionsHistory.unshift({
        time: timestamp,
        type: 'ANTIGRAVITY',
        detail: action
      });
    }

    if (taskTitle && this.db) {
      this.db.createTask({
        title: taskTitle,
        roomId: roomId || 'room_douyin',
        assignee: agentName || agentId || 'Agent AI',
        assigneeId: agentId,
        agentType
      });
    } else if (log && agentId && this.db) {
      this.db.addAgentLog(agentId, log);
    }

    if (this.broadcastFn) {
      this.broadcastFn('ANTIGRAVITY_LIVE_SYNC', {
        session: this.getSession(),
        timestamp: new Date().toISOString()
      });
      if (this.db) {
        this.broadcastFn('INIT_STATE', this.db.getState());
      }
    }

    return this.getSession();
  }

  startWatcher() {
    setInterval(async () => {
      try {
        const { stdout: gitOut } = await execAsync('git status --short', { cwd: WORKSPACE_DIR });
        const modifiedCount = gitOut.trim().split('\n').filter(Boolean).length;
        this.session.stats.filesModified = modifiedCount;
        if (this.db) {
          this.session.stats.activeAgents = this.db.getAgents().length;
          this.session.stats.activeTasks = this.db.getState().tasks.length;
        }
        if (this.broadcastFn) {
          this.broadcastFn('ANTIGRAVITY_STATS', this.session.stats);
        }
      } catch {
        // ignore
      }
    }, 5000);
  }
}

export const antigravityBridge = new AntigravityBridge();
