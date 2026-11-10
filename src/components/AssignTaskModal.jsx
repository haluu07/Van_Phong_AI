import React, { useState } from 'react';
import { X, Send, Sparkles, PlusCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/soundEffects';

export default function AssignTaskModal({
  isOpen,
  onClose,
  rooms,
  onAddNewTask
}) {
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[1]?.id || 'room_douyin');
  const [taskTitle, setTaskTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  if (!isOpen) return null;

  const currentRoom = rooms.find(r => r.id === selectedRoomId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    soundManager.playSuccess();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const targetAgent = currentRoom?.members.find(m => m.id === assigneeId) || currentRoom?.members[0];

    onAddNewTask({
      id: 'task_' + Date.now(),
      title: taskTitle.trim(),
      roomName: currentRoom?.name || 'Văn phòng',
      assignee: targetAgent ? targetAgent.name : 'Bot tự động',
      status: 'Đang xử lý',
      time: new Date().toLocaleTimeString('vi-VN')
    });

    setTaskTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-3xl p-5 shadow-2xl border border-white/10 relative">
        <button
          onClick={() => {
            soundManager.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Giao việc cho phòng ban AI</h3>
            <p className="text-[11px] text-slate-400">Chọn phòng ban và nhân sự AI để phân công nhiệm vụ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {/* Chọn phòng ban */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">1. Chọn phòng ban phụ trách:</label>
            <select
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setAssigneeId('');
              }}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name} - {r.subtitle}</option>
              ))}
            </select>
          </div>

          {/* Chọn nhân viên trong phòng */}
          {currentRoom && currentRoom.members.length > 0 && (
            <div>
              <label className="font-semibold text-slate-300 block mb-1">2. Chọn nhân sự AI thực hiện:</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="">{currentRoom.members[0].name} (Trưởng phòng/Mặc định)</option>
                {currentRoom.members.map(m => (
                  <option key={m.id} value={m.id}>{m.avatar} {m.name} - {m.role}</option>
                ))}
              </select>
            </div>
          )}

          {/* Mô tả nhiệm vụ */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">3. Yêu cầu công việc (Prompt tác vụ):</label>
            <textarea
              rows={3}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="VD: Cào dữ liệu 20 video triệu view mới nhất và tạo tóm tắt nội dung..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 mt-1 active:scale-[0.98] transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Phê duyệt & Giao việc ngay</span>
          </button>
        </form>
      </div>
    </div>
  );
}
