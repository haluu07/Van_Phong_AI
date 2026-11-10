// Client API & WebSocket kết nối Backend thật cho Văn Phòng AI
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
      console.warn('[API] Không kết nối được backend, sử dụng dữ liệu tĩnh:', err.message);
      return {
        rooms: INITIAL_ROOMS,
        tasks: [
          {
            id: 'task_1',
            title: 'Tải 15 video Douyin ngách AI Video',
            roomName: 'Phòng Douyin',
            assignee: 'Mochi',
            status: 'Đang xử lý',
            time: '15:45'
          },
          {
            id: 'task_2',
            title: 'Cắt 8 đoạn viral livestream A Long',
            roomName: 'Phòng Cắt clip',
            assignee: 'Mít',
            status: 'Đang xử lý',
            time: '15:55'
          }
        ],
        metrics: OFFICE_METRICS
      };
    }
  },

  // Giao việc cho 1 agent cụ thể
  async assignAgentTask(agentId, task) {
    try {
      const res = await fetch(`${API_BASE}/agents/${agentId}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
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

  // Tạo task mới từ modal tổng
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

  // Reset dữ liệu về mặc định
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
    // Sử dụng host hiện tại thông qua Vite proxy hoặc cổng 3001
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WS Client] Đã kết nối thành công với Backend!');
        if (this.onConnectionChange) this.onConnectionChange(true);

        // Heartbeat định kỳ 25s
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
          // Thử kết nối lại sau 3s
          this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[WS Client] Lỗi kết nối WebSocket:', err);
        this.ws.close();
      };
    } catch (e) {
      console.warn('[WS Client] Ngoại lệ khi tạo WebSocket:', e);
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
