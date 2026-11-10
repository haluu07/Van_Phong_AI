#!/usr/bin/env node
/**
 * CLI điều khiển Văn Phòng 3D dành cho Antigravity AI (Desktop & Web)
 * Cách dùng:
 *   node office-cli.js task <agentId> "<nội dung việc>" [roomId] [agentType]
 *   node office-cli.js status <agentId> <working|coffee|gaming|break|idle|spotlight> [statusText]
 *   node office-cli.js log <agentId> "<nội dung log>"
 *   node office-cli.js dismiss <agentId>
 *   node office-cli.js reset
 *   node office-cli.js prompt "<câu lệnh của A Long>" "<hành động của Antigravity>"
 */

const API_BASE = process.env.OFFICE_API_URL || 'http://localhost:3001/api';

async function main() {
  const [, , cmd, arg1, arg2, arg3, arg4] = process.argv;

  if (!cmd) {
    console.log(`
🏢 Antigravity Office 3D CLI (Dynamic Chibi Spawner)
Sử dụng:
  node office-cli.js task <agentId> "<nhiệm vụ>" [roomId] [type] -> Triệu hồi Chibi & giao việc vào phòng
  node office-cli.js status <agentId> <trạng_thái> [text]        -> Đổi trạng thái (working, coffee, gaming, break, idle, spotlight)
  node office-cli.js log <agentId> "<dòng log>"                  -> Bắn log trực tiếp vào màn hình nhân vật
  node office-cli.js dismiss <agentId>                           -> Cho nhân vật nghỉ và rời khỏi văn phòng
  node office-cli.js reset                                       -> Giải tán toàn bộ nhân vật & xóa hết task (về 0)
  node office-cli.js project [list|select|scan|add]              -> Quản lý & chọn dự án làm việc của Antigravity
  node office-cli.js prompt "<yêu cầu>" "<hành động>"            -> Đồng bộ phiên chat Antigravity vào phòng A Long
`);
    process.exit(0);
  }

  try {
    if (cmd === 'task') {
      const res = await fetch(`${API_BASE}/agents/${arg1}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: arg2,
          roomId: arg3,
          agentType: arg4
        })
      });
      const data = await res.json();
      console.log(`✅ [Office 3D] ${data.message}`);
    } else if (cmd === 'status') {
      const res = await fetch(`${API_BASE}/agents/${arg1}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: arg2, statusText: arg3 })
      });
      const data = await res.json();
      console.log(`✅ [Office 3D] ${data.message}`);
    } else if (cmd === 'log') {
      const res = await fetch(`${API_BASE}/agents/${arg1}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log: arg2 })
      });
      await res.json();
      console.log(`✅ [Office 3D] Đã đẩy log cho ${arg1}`);
    } else if (cmd === 'dismiss') {
      const res = await fetch(`${API_BASE}/agents/${arg1}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      console.log(`✅ [Office 3D] ${data.message}`);
    } else if (cmd === 'reset') {
      const res = await fetch(`${API_BASE}/reset`, {
        method: 'POST'
      });
      const data = await res.json();
      console.log(`✅ [Office 3D] ${data.message}`);
    } else if (cmd === 'prompt') {
      const res = await fetch(`${API_BASE}/antigravity/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: arg1, action: arg2 })
      });
      await res.json();
      console.log(`✅ [Office 3D] Đã đồng bộ chỉ đạo của A Long vào văn phòng!`);
    } else if (cmd === 'project') {
      const subCmd = arg1 || 'list';
      if (subCmd === 'list') {
        const res = await fetch(`${API_BASE}/projects`);
        const json = await res.json();
        const { currentProjectId, projects } = json.data;
        console.log(`\n📁 DANH SÁCH DỰ ÁN TRÊN ANTIGRAVITY (${projects.length}):`);
        projects.forEach((p) => {
          const isCur = p.id === currentProjectId ? '👉 [ACTIVE]' : '  ';
          console.log(`${isCur} ${p.name.padEnd(25)} (${p.branch}) - ${p.path}`);
        });
        console.log('');
      } else if (subCmd === 'select') {
        const projectId = arg2;
        if (!projectId) {
          console.error('❌ Vui lòng truyền mã dự án: node office-cli.js project select <projectId>');
          process.exit(1);
        }
        const res = await fetch(`${API_BASE}/projects/select`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId })
        });
        const data = await res.json();
        console.log(`✅ [Office 3D] ${data.message}`);
      } else if (subCmd === 'scan') {
        console.log('🔄 Đang quét lại các dự án...');
        const res = await fetch(`${API_BASE}/projects/scan`, { method: 'POST' });
        const data = await res.json();
        console.log(`✅ [Office 3D] ${data.message}`);
      } else if (subCmd === 'add') {
        const folderPath = arg2;
        const customName = arg3;
        const res = await fetch(`${API_BASE}/projects/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: folderPath, name: customName })
        });
        const data = await res.json();
        console.log(`✅ [Office 3D] ${data.message}`);
      }
    } else {
      console.error(`❌ Lệnh không hợp lệ: ${cmd}`);
    }
  } catch (err) {
    console.error(`❌ Không kết nối được Office Server (${API_BASE}):`, err.message);
  }
}

main();
