import React, { useState } from 'react';
import { X, Sparkles, Terminal, Activity, Send, CheckCircle2, Clock, GitBranch, Cpu, Server, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/soundEffects';

export default function AntigravityLiveModal({
  isOpen,
  onClose,
  session,
  onSendEvent
}) {
  const [quickPrompt, setQuickPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;

    soundManager.playSuccess();
    confetti({
      particleCount: 90,
      spread: 60,
      origin: { y: 0.6 }
    });

    if (onSendEvent) {
      onSendEvent({
        prompt: quickPrompt.trim(),
        action: `Sếp A Long ra lệnh mới: "${quickPrompt.trim()}"`,
        agentId: 'along',
        taskTitle: quickPrompt.trim()
      });
    }

    setQuickPrompt('');
  };

  const prompts = session?.prompts || [];
  const actions = session?.actionsHistory || [];
  const stats = session?.stats || { toolCalls: 32, filesModified: 8, backgroundTasks: 3 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl max-h-[92vh] rounded-3xl p-5 shadow-2xl border border-violet-500/30 flex flex-col gap-4 relative overflow-hidden text-slate-100">
        
        {/* Glow neon nền */}
        <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-violet-600/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-fuchsia-600/20 blur-3xl pointer-events-none" />

        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/30">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  Antigravity Live Bridge
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE & LINKED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Phiên làm việc trực tiếp giữa <strong className="text-amber-300">Sếp A Long</strong> & <strong className="text-violet-300">Google Antigravity AI</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thanh thống kê nhanh (Live Stat Chips) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
          <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-2xl flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-violet-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Tool Calls</p>
              <p className="text-xs font-bold text-white">{stats.toolCalls || 32}+ tác vụ</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-2xl flex items-center gap-2.5">
            <GitBranch className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Git Branch</p>
              <p className="text-xs font-bold text-white truncate">main (Up to date)</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-2xl flex items-center gap-2.5">
            <Server className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Backend</p>
              <p className="text-xs font-bold text-white">Port 3001 (WS Active)</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-2xl flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-fuchsia-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Đồng bộ</p>
              <p className="text-xs font-bold text-white">Realtime 100%</p>
            </div>
          </div>
        </div>

        {/* Thân Modal: 2 Cột */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto flex-1 pr-1">
          
          {/* Cột 1: Dòng thời gian chỉ đạo của A Long */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 px-1">
              👑 Chỉ đạo của A Long trong phiên này
            </h3>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-60 p-1">
              {prompts.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="bg-slate-900/70 border border-amber-500/20 rounded-2xl p-3 flex flex-col gap-1 shadow-md"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-300">Prompt #{prompts.length - idx}</span>
                    <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {p.time}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    "{p.text}"
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cột 2: Nhật ký thực thi trực tiếp của Antigravity */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Terminal className="w-3.5 h-3.5 text-violet-400" />
              Nhật ký hành động Antigravity
            </h3>

            <div className="bg-black/75 border border-white/10 rounded-2xl p-3 font-mono text-[11px] h-60 overflow-y-auto space-y-1.5 text-emerald-300/90 shadow-inner">
              <div className="text-[10px] text-slate-500 pb-1 border-b border-white/5">
                // Google Antigravity Session v1 [Remote VM]
              </div>
              {actions.map((act, idx) => (
                <div key={idx} className="leading-relaxed flex items-start gap-1.5">
                  <span className="text-slate-500 text-[10px] shrink-0 font-mono">[{act.time}]</span>
                  <span className="text-violet-400 font-semibold text-[10px] shrink-0">[{act.type}]</span>
                  <span className="text-slate-200">{act.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ô gửi chỉ đạo nhanh từ 3D Office tới Antigravity */}
        <form onSubmit={handleSubmit} className="pt-2 border-t border-white/10 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={quickPrompt}
            onChange={(e) => setQuickPrompt(e.target.value)}
            placeholder="A Long nhập chỉ đạo mới cho Antigravity (ví dụ: Tạo thêm phòng R&D, kiểm tra hiệu năng)..."
            className="flex-1 bg-slate-900/90 border border-white/15 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-all shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi chỉ đạo</span>
          </button>
        </form>

      </div>
    </div>
  );
}
