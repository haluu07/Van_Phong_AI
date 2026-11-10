import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Compass, Plus, Clock, Wifi, Terminal, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export default function TopBar({
  isTouring,
  setIsTouring,
  onOpenAssignTask,
  onOpenAntigravityLive,
  metrics,
  isConnected = false
}) {
  const [timeStr, setTimeStr] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleTour = () => {
    soundManager.playPop();
    setIsTouring(!isTouring);
  };

  const statusChips = [
    {
      label: 'ngồi máy',
      count: metrics?.working ?? 4,
      dotColor: 'bg-emerald-400 animate-pulse',
      pillClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
    },
    {
      label: 'trò chuyện',
      count: metrics?.chat ?? 1,
      dotColor: 'bg-amber-400',
      pillClass: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
    },
    {
      label: 'giải trí',
      count: metrics?.gaming ?? 3,
      dotColor: 'bg-cyan-400',
      pillClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
    },
    {
      label: 'nghỉ chờ',
      count: metrics?.idle ?? 2,
      dotColor: 'bg-slate-400',
      pillClass: 'bg-slate-500/10 text-slate-300 border-slate-500/20'
    },
    {
      label: 'pantry',
      count: metrics?.away ?? 4,
      dotColor: 'bg-rose-400',
      pillClass: 'bg-rose-500/10 text-rose-300 border-rose-500/20'
    }
  ];

  return (
    <header className="absolute top-3.5 left-4 right-4 z-20 flex items-center justify-between gap-3 pointer-events-none">
      {/* Khối bên trái: Brand Identity & Live Telemetry Pills */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <div className="glass-panel pl-3 pr-4 py-2 rounded-2xl flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-amber-500/20">
            <span>🏢</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b0d13]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-white tracking-tight">
                Văn Phòng Tác Vụ AI
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                STUDIO 3D
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="text-slate-200 font-semibold">A Long</span>
              <span className="text-slate-600">•</span>
              <span>6 phòng ban</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-mono text-[10px]">16 AI Agents</span>
            </p>
          </div>
        </div>

        {/* Các chip đếm số lượng nhân sự AI theo trạng thái */}
        <div className="hidden xl:flex items-center gap-1.5 glass-panel-subtle px-2.5 py-1.5 rounded-2xl">
          {statusChips.map((chip, idx) => (
            <span
              key={idx}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all ${chip.pillClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${chip.dotColor}`} />
              <span className="font-mono font-bold">{chip.count}</span>
              <span className="opacity-90">{chip.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Khối bên phải: Đồng hồ, Trạng thái kết nối, Antigravity Live, Giao việc & Tham quan */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Đồng hồ Việt Nam */}
        <div className="hidden md:flex glass-panel-subtle px-3 py-2 rounded-2xl items-center gap-2 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-bold text-slate-100 tracking-wider">
            {timeStr || '09:00:00'}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
            VN
          </span>
        </div>

        {/* Trạng thái kết nối WebSocket */}
        <div
          className={`hidden sm:flex items-center gap-1.5 glass-panel-subtle px-3 py-2 rounded-2xl text-[11px] font-semibold border ${
            isConnected
              ? 'text-emerald-300 border-emerald-500/25'
              : 'text-amber-300 border-amber-500/25'
          }`}
        >
          <Wifi
            className={`w-3.5 h-3.5 ${
              isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
            }`}
          />
          <span className="font-mono">{isConnected ? 'WS LIVE' : 'RECONNECTING'}</span>
        </div>

        {/* Nút Antigravity Live Bridge */}
        <button
          id="btn-antigravity-live"
          onClick={() => {
            soundManager.playPop();
            onOpenAntigravityLive && onOpenAntigravityLive();
          }}
          className="px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-xs flex items-center gap-2 shadow-lg border border-cyan-500/35 hover:border-cyan-400/60 transition-all active:scale-95"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Antigravity Live</span>
        </button>

        {/* Nút Giao việc */}
        <button
          id="btn-assign-task"
          onClick={() => {
            soundManager.playPop();
            onOpenAssignTask();
          }}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Giao việc</span>
        </button>

        {/* Nút Tham quan Camera */}
        <button
          id="btn-tour-camera"
          onClick={handleToggleTour}
          className={`px-3.5 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
            isTouring
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 border border-rose-400/40'
              : 'glass-panel text-slate-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Compass className={`w-3.5 h-3.5 ${isTouring ? 'animate-spin' : 'text-cyan-400'}`} />
          <span>{isTouring ? 'Dừng Tour' : 'Tham quan'}</span>
        </button>

        {/* Nút bật/tắt âm thanh */}
        <button
          id="btn-toggle-sound"
          onClick={handleToggleSound}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="glass-panel p-2 rounded-2xl text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>
      </div>
    </header>
  );
}
