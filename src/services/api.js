// Client API & WebSocket kết nối Backend thật cho Văn Phòng AI (Không chứa mock data)
import { INITIAL_ROOMS, OFFICE_METRICS } from '../data/officeData';

const API_BASE = '/api';

export const api = {
  // Lấy toàn bộ trạng thái văn phòng (Phòng ban, Nhân sự, Tasks, Thống kê)
  async fetchOfficeState() {
    try {
      const res = await fetch(`${API_BASE}/office/state`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[API] Không kết nối được backend:', err.message);
      return {
        rooms: INITIAL_ROOMS,
        tasks: [],
        metrics: OFFICE_METRICS
      };
    }
  },

  // Giao việc cho 1 agent cụ thể (hoặc triệu hồi mới)
  async assignAgentTask(agentId, task, options = {}) {
    try {
      const res = await fetch(`${API_BASE}/agents/${agentId}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, ...options })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Lỗi assignAgentTask:', err.message);
      return null;
    }
  },

  // Đổi trạng thái của agent
  async updateAgentStatus(agentId, status, statusText) {
    try {
      const res = await fetch(`${API_BASE}/agents/${agentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, statusText })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Lỗi updateAgentStatus:', err.message);
      return null;
    }
  },

  // Cho 1 agent nghỉ và rời khỏi văn phòng 3D
  async dismissAgent(agentId) {
    try {
      const res = await fetch(`${API_BASE}/agents/${agentId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Lỗi dismissAgent:', err.message);
      return null;
    }
  },

  // Thêm log trực tiếp vào Terminal agent
  async addAgentLog(agentId, log) {
    try {
      const res = await fetch(`${API_BASE}/agents/${agentId}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Lỗi addAgentLog:', err.message);
      return null;
    }
  },

  // Tạo task mới từ modal tổng (sẽ tự động triệu hồi Chibi vào phòng)
  async createTask(taskData) {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Lỗi createTask:', err.message);
      return null;
    }
  },

  // Cập nhật trạng thái task
  async updateTask(taskId, updates) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Lỗi updateTask:', err.message);
      return null;
    }
  },

  // Giải tán toàn bộ nhân vật & xóa toàn bộ task
  async resetOffice() {
    try {
      const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Lỗi resetOffice:', err.message);
      return null;
    }
  },

  // Lấy dữ liệu phiên làm việc Antigravity Live
  async fetchAntigravitySession() {
    try {
      const res = await fetch(`${API_BASE}/antigravity/session`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[API] Không lấy được session Antigravity:', err.message);
      return null;
    }
  },

  // Gửi sự kiện mới vào phiên Antigravity
  async sendAntigravityEvent(eventData) {
    try {
      const res = await fetch(`${API_BASE}/antigravity/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Lỗi sendAntigravityEvent:', err.message);
      return null;
    }
  }
};

// Quản lý kết nối WebSocket Realtime
export class OfficeWebSocketClient {
  constructor(onMessage, onConnectionChange) {
    this.onMessage = onMessage;
    this.onConnectionChange = onConnectionChange;
    this.ws = null;
    this.reconnectTimeout = null;
    this.pingInterval = null;
    this.isClosed = false;
  }

  connect() {
    this.isClosed = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        if (this.onConnectionChange) this.onConnectionChange(true);
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'PONG') return;
          if (this.onMessage) {
            this.onMessage(payload.type, payload.data);
          }
        } catch (err) {
          console.error('[WS Client] Lỗi parse message:', err);
        }
      };

      this.ws.onclose = () => {
        if (this.onConnectionChange) this.onConnectionChange(false);
        if (this.pingInterval) clearInterval(this.pingInterval);
        if (!this.isClosed) {
          this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
        }
      };

      this.ws.onerror = () => {
        this.ws.close();
      };
    } catch {
      if (!this.isClosed) {
        this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
      }
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  close() {
    this.isClosed = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.ws) this.ws.close();
  }
}
