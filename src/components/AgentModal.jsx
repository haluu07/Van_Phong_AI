import React, { useState } from 'react';
import { X, Send, Sparkles, Terminal, Heart, Coffee, Laptop } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/soundEffects';

export default function AgentModal({
  agent,
  room,
  onClose,
  onUpdateAgentTask
}) {
  const [taskInput, setTaskInput] = useState('');

  if (!agent) return null;

  const handleAssign = (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    soundManager.playSuccess();
    // Bắn pháo hoa giấy chúc mừng giao task cute
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    onUpdateAgentTask(agent.id, taskInput.trim());
    setTaskInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-white/10 relative overflow-hidden flex flex-col gap-4">
        {/* Glow nền mờ */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: room?.color || '#ec4899' }}
        />

        {/* Nút đóng */}
        <button
          onClick={() => {
            soundManager.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header nhân vật */}
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/30 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
            {agent.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{agent.name}</h2>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${agent.statusColor}`}>
                {agent.statusText}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {agent.role} • <span className="text-slate-300 font-medium">{room?.name}</span>
            </p>
          </div>
        </div>

        {/* Suy nghĩ hiện tại của bot (Thoughts) */}
        {agent.thoughts && agent.thoughts.length > 0 && (
          <div className="p-3 rounded-2xl bg-violet-950/20 border border-violet-500/20 text-xs text-violet-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[11px] text-violet-400 uppercase tracking-wider mb-0.5">
                Suy nghĩ nội tâm của {agent.name}
              </p>
              <p className="italic leading-relaxed">
                "{agent.thoughts[Math.floor(Math.random() * agent.thoughts.length)]}"
              </p>
            </div>
          </div>
        )}

        {/* Nhật ký thực thi tác vụ (Terminal Antigravity Log) */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5 px-1">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Nhật ký thực thi (Live Agent Stream)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ONLINE
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/60 border border-white/5 font-mono text-[11px] text-emerald-300/90 h-32 overflow-y-auto space-y-1">
            {agent.logs?.map((log, idx) => (
              <div key={idx} className="leading-snug">
                <span className="text-slate-500">&gt; </span>
                {log}
              </div>
            ))}
            <div className="text-slate-400 text-[10px] animate-pulse">
              &gt; [Antigravity Subagent] Đang đợi lệnh điều động tiếp theo...
            </div>
          </div>
        </div>

        {/* Form giao việc trực tiếp */}
        <form onSubmit={handleAssign} className="flex flex-col gap-2 pt-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-amber-400" />
            Giao nhiệm vụ mới cho {agent.name}:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="VD: Cắt 3 video ngắn 30s từ file livestream mới..."
              className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
