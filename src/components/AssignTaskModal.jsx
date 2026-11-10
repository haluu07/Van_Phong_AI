import React, { useState, useEffect } from 'react';
import { X, Send, PlusCircle, Sparkles, FolderGit2, GitBranch } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/soundEffects';
import { AVATAR_TYPES } from '../data/officeData';

export default function AssignTaskModal({
  isOpen,
  onClose,
  rooms,
  onAddNewTask,
  currentProject,
  projects = []
}) {
  const [selectedRoomId, setSelectedRoomId] = useState('room_douyin');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState('cat');
  const [taskTitle, setTaskTitle] = useState('');

  useEffect(() => {
    if (currentProject?.id) {
      setSelectedProjectId(currentProject.id);
    }
  }, [currentProject]);

  if (!isOpen) return null;

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const chosenProject = projects.find((p) => p.id === selectedProjectId) || currentProject;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    soundManager.playSuccess();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const finalName =
      agentName.trim() ||
      `Agent ${(currentRoom?.members?.length || 0) + 1} (${currentRoom?.name?.replace('Phòng ', '')})`;

    onAddNewTask({
      title: taskTitle.trim(),
      roomName: currentRoom?.name || 'Văn phòng',
      roomId: currentRoom?.id || 'room_douyin',
      assignee: finalName,
      agentType,
      projectId: chosenProject?.id || null,
      projectName: chosenProject?.name || null
    });

    setTaskTitle('');
    setAgentName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/15 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: currentRoom?.color || '#f59e0b' }}
        />

        <button
          onClick={() => {
            soundManager.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pt-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              Giao việc & Triệu hồi Chibi AI
            </h3>
            <p className="text-[11px] text-slate-400">
              Nhân vật Chibi sẽ xuất hiện tại bàn ngay khi nhận lệnh
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {/* Dự án thực thi */}
          <div className="bg-amber-500/10 border border-amber-500/25 p-2.5 rounded-2xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FolderGit2 className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-amber-300/80 font-bold uppercase block">
                  Dự án thực thi:
                </span>
                <span className="text-xs font-bold text-white truncate block">
                  {chosenProject?.name || 'Dự án mặc định'}
                </span>
              </div>
            </div>

            {projects.length > 1 && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-black/70 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-amber-400 max-w-[140px]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 1. Chọn phòng ban */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              1. Chọn phòng ban thực hiện:
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
            >
              {rooms
                .filter((r) => r.id !== 'room_pantry')
                .map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900">
                    {r.name} ({r.members.length} bot đang ở phòng)
                  </option>
                ))}
            </select>
          </div>

          {/* 2. Tên nhân sự AI (hoặc chọn bot đã có) */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              2. Tên nhân vật AI (để trống sẽ tự đặt tên):
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="VD: Mochi, Dũng, Tôm, Subagent-01..."
              className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 3. Chọn hình dáng Chibi 3D */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              3. Chọn ngoại hình Chibi 3D:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {AVATAR_TYPES.map((item) => {
                const active = agentType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      soundManager.playPop();
                      setAgentType(item.type);
                    }}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-0.5 transition-all ${
                      active
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-black/35 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base">{item.avatar}</span>
                    <span className="text-[10px] truncate max-w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Mô tả nhiệm vụ */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              4. Nội dung công việc giao cho Agent:
            </label>
            <textarea
              rows={3}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Nhập nhiệm vụ... Khi bấm giao việc, Chibi sẽ lập tức xuất hiện tại bàn làm việc!"
              className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 mt-1 active:scale-[0.98] transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Triệu hồi Chibi & Giao việc ngay</span>
          </button>
        </form>
      </div>
    </div>
  );
}
