import React, { useEffect } from 'react';
import { Eye, MousePointer, Terminal } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export default function BottomBar({
  rooms,
  cameraPreset,
  setCameraPreset,
  latestLog,
  onOpenAntigravityLive
}) {
  const handleSelectPreset = (presetId) => {
    soundManager.playPop();
    setCameraPreset(presetId);
  };

  // Phím tắt bàn phím 0-6 để chuyển góc nhìn nhanh giữa các phòng
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
      if (e.key === '0') {
        handleSelectPreset('all');
      } else {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= rooms.length) {
          handleSelectPreset(rooms[num - 1].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rooms]);

  return (
    <footer className="absolute bottom-3.5 left-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
      {/* Dòng Live Activity Ticker nhỏ gọn góc dưới trái */}
      {latestLog && (
        <div className="flex items-center">
          <button
            onClick={() => {
              soundManager.playPop();
              onOpenAntigravityLive && onOpenAntigravityLive();
            }}
            className="glass-panel-subtle px-3 py-1.5 rounded-xl flex items-center gap-2 text-[11px] text-slate-300 hover:text-white hover:border-cyan-500/30 transition-all pointer-events-auto max-w-xl truncate shadow-lg"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <Terminal className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="font-mono text-[10px] text-cyan-300 font-semibold shrink-0">
              LIVE STREAM:
            </span>
            <span className="truncate font-mono text-[11px] text-slate-200">
              {latestLog}
            </span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Dock chọn góc nhìn phòng ban nhanh */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full glass-panel p-1.5 rounded-2xl pointer-events-auto">
          <button
            onClick={() => handleSelectPreset('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              cameraPreset === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Toàn cảnh</span>
            <kbd
              className={`text-[9px] font-mono px-1 rounded ${
                cameraPreset === 'all'
                  ? 'bg-black/20 text-slate-950'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              0
            </kbd>
          </button>

          {rooms.map((room, idx) => {
            const isActive = cameraPreset === room.id;
            return (
              <button
                key={room.id}
                onClick={() => handleSelectPreset(room.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-800 text-white border border-white/20 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.07] border border-transparent'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: room.color }}
                />
                <span>{room.name}</span>
                <kbd className="hidden md:inline-block text-[9px] font-mono bg-white/[0.06] text-slate-400 px-1 rounded">
                  {idx + 1}
                </kbd>
              </button>
            );
          })}
        </div>

        {/* Hướng dẫn thao tác chuột / bàn phím */}
        <div className="hidden xl:flex items-center gap-2.5 glass-panel-subtle px-3.5 py-2 rounded-2xl text-[11px] text-slate-400 pointer-events-auto">
          <MousePointer className="w-3.5 h-3.5 text-amber-400" />
          <span>
            <strong className="text-slate-200">Xoay:</strong> Chuột trái / phải
          </span>
          <span className="text-slate-600">•</span>
          <span>
            <strong className="text-slate-200">Di chuyển:</strong> Chuột giữa
          </span>
          <span className="text-slate-600">•</span>
          <span>
            <strong className="text-slate-200">Zoom:</strong> Con lăn
          </span>
        </div>
      </div>
    </footer>
  );
}
