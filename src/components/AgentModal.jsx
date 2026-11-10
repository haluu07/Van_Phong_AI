import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Terminal,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/soundEffects';

const STATUS_ACTIONS = [
  { id: 'working', label: 'Ngồi máy', icon: '💻', text: 'Đang làm việc' },
  { id: 'coffee', label: 'Pha cà phê', icon: '☕', text: 'Đi pha cà phê' },
  { id: 'break', label: 'Bóng bàn', icon: '🏓', text: 'Chơi bóng bàn' },
  { id: 'gaming', label: 'Chơi game', icon: '🎮', text: 'Chơi máy game' },
  { id: 'idle', label: 'Nghỉ chờ', icon: '💤', text: 'Nghỉ máy, chờ lệnh' }
];

const QUICK_TASKS = [
  'Quét và tải 20 video xu hướng mới nhất',
  'Cắt highlight 3 giây đầu viral nhất',
  'Kiểm tra tiến độ & gửi báo cáo cho A Long',
  'Tối ưu hóa tiêu đề SEO & lên lịch đăng'
];

export default function AgentModal({
  agent,
  room,
  onClose,
  onUpdateAgentTask,
  onUpdateAgentStatus,
  onDismissAgent
}) {
  const [taskInput, setTaskInput] = useState('');

  if (!agent) return null;

  const handleAssign = (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    soundManager.playSuccess();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    onUpdateAgentTask(agent.id, taskInput.trim());
    setTaskInput('');
  };

  const handleStatusClick = (st) => {
    soundManager.playPop();
    if (onUpdateAgentStatus) {
      onUpdateAgentStatus(agent.id, st.id, st.text);
    }
  };

  const currentThought =
    agent.thoughts && agent.thoughts.length > 0 ? agent.thoughts[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 border border-white/15">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: room?.color || '#f59e0b' }}
        />

        {/* Nút đóng & Thu hồi */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          {onDismissAgent && (
            <button
              onClick={() => {
                soundManager.playPop();
                onDismissAgent(agent.id);
              }}
              title="Cho nhân sự này nghỉ và rời khỏi văn phòng"
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Cho nghỉ</span>
            </button>
          )}
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header nhân vật */}
        <div className="flex items-center gap-4 pt-1">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border border-white/15 flex items-center justify-center text-3xl shadow-inner shrink-0">
            {agent.avatar}
          </div>
          <div className="min-w-0 flex-1 pr-24">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                {agent.name}
              </h2>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold ${agent.statusColor}`}
              >
                {agent.statusText}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-slate-200 font-semibold">{agent.role}</span>
              <span>•</span>
              <span
                className="font-semibold"
                style={{ color: room?.color || '#f59e0b' }}
              >
                {room?.name}
              </span>
            </p>
            <p className="text-[11px] text-slate-300 mt-1.5 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06] truncate">
              <strong className="text-amber-300">Nhiệm vụ:</strong> {agent.currentTask}
            </p>
          </div>
        </div>

        {/* Bộ chuyển đổi trạng thái nhanh (1-Click Status Switcher) */}
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1.5">
            Đổi trạng thái hoạt động ngay lập tức:
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {STATUS_ACTIONS.map((st) => {
              const isActive = agent.status === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStatusClick(st)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 border transition-all ${
                    isActive
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm'
                      : 'bg-black/35 text-slate-300 border-white/[0.06] hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  <span className="text-sm">{st.icon}</span>
                  <span className="truncate max-w-full">{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Suy nghĩ nội tâm của bot */}
        {currentThought && (
          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.08] text-xs text-slate-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-mono font-bold text-[10px] text-amber-300 uppercase tracking-wider mb-0.5">
                Suy nghĩ nội tâm của {agent.name}
              </p>
              <p className="italic text-slate-200 leading-relaxed">
                "{currentThought}"
              </p>
            </div>
          </div>
        )}

        {/* Nhật ký thực thi tác vụ (Terminal Antigravity Log) */}
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#06080c]">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-300 flex items-center gap-1.5 ml-1">
                <Terminal className="w-3 h-3 text-cyan-400" />
                agent://{agent.id}/live-stream.log
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              CONNECTED
            </span>
          </div>

          <div className="p-3 font-mono text-[11px] text-emerald-300/90 h-32 overflow-y-auto space-y-1.5">
            {agent.logs?.map((log, idx) => (
              <div key={idx} className="leading-relaxed flex items-start gap-1.5">
                <span className="text-slate-600 select-none">$</span>
                <span className={idx === 0 ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form giao nhiệm vụ mới */}
        <form onSubmit={handleAssign} className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {QUICK_TASKS.map((qt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTaskInput(qt)}
                className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.07] text-slate-300 hover:text-amber-300 transition-colors"
              >
                + {qt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder={`Giao nhiệm vụ tiếp theo cho ${agent.name}...`}
              className="flex-1 bg-black/50 border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Giao việc</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
