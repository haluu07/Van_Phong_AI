import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Compass, Plus, Clock, Wifi } from 'lucide-react';
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

  return (
    <header className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
      {/* Khối bên trái: Tên văn phòng & Thống kê trạng thái */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl shadow-black/30">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-lg shadow-md">
            🏢
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Văn Phòng Tác Vụ
              <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded-md font-mono">
                AI 3.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">A Long • 6 phòng ban • 16 bàn tác vụ</p>
          </div>
        </div>

        {/* Các chip đếm số lượng nhân sự AI theo trạng thái */}
        <div className="hidden lg:flex items-center gap-2 glass-panel-subtle px-3 py-1.5 rounded-2xl text-xs font-medium text-slate-300">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {metrics?.working ?? 4} ngồi máy
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            {metrics?.chat ?? 1} trò chuyện
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            {metrics?.gaming ?? 3} giải trí
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/20">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            {metrics?.idle ?? 2} nghỉ
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            {metrics?.away ?? 4} vắng/đang đi
          </span>
        </div>
      </div>

      {/* Khối bên phải: Đồng hồ, Trạng thái kết nối, Nút Tham quan & Giao việc */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Đồng hồ Việt Nam */}
        <div className="glass-panel px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-mono font-semibold text-slate-200">
          <Clock className="w-3.5 h-3.5 text-violet-400" />
          <span>{timeStr || '08:39:23'}</span>
          <span className="text-[10px] text-slate-400 font-sans">GIỜ VIỆT NAM</span>
        </div>

        {/* Trạng thái kết nối */}
        <div className={`hidden sm:flex items-center gap-1.5 glass-panel px-3 py-1.5 rounded-2xl text-xs font-semibold ${
          isConnected ? 'text-emerald-400' : 'text-amber-400'
        }`}>
          <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
          <span>{isConnected ? 'API Realtime Online' : 'Chờ kết nối Backend...'}</span>
        </div>

        {/* Nút Antigravity Live Hub */}
        <button
          onClick={() => {
            soundManager.playPop();
            onOpenAntigravityLive && onOpenAntigravityLive();
          }}
          className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-500/25 hover:scale-[1.03] transition-all border border-violet-400/30"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>⚡ Antigravity Live</span>
        </button>

        {/* Nút Giao việc */}
        <button
          onClick={() => {
            soundManager.playPop();
            onOpenAssignTask();
          }}
          className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:scale-[1.03] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Giao việc</span>
        </button>

        {/* Nút Tham quan */}
        <button
          onClick={handleToggleTour}
          className={`px-3.5 py-1.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg ${
            isTouring
              ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
              : 'glass-panel text-slate-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Compass className={`w-4 h-4 ${isTouring ? 'animate-spin' : ''}`} />
          <span>{isTouring ? 'Dừng tour' : 'Tham quan'}</span>
        </button>

        {/* Nút bật/tắt âm thanh */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="p-2 rounded-2xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </header>
  );
}
