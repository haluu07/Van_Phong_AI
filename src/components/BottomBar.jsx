import React from 'react';
import { Eye, MousePointer } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export default function BottomBar({
  rooms,
  cameraPreset,
  setCameraPreset
}) {
  const handleSelectPreset = (presetId) => {
    soundManager.playPop();
    setCameraPreset(presetId);
  };

  return (
    <footer className="absolute bottom-3 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-none">
      {/* Pills chọn góc nhìn phòng ban nhanh */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full glass-panel p-1.5 rounded-2xl pointer-events-auto shadow-xl">
        <button
          onClick={() => handleSelectPreset('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            cameraPreset === 'all'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Toàn cảnh</span>
        </button>

        {rooms.map((room) => {
          const isActive = cameraPreset === room.id;
          return (
            <button
              key={room.id}
              onClick={() => handleSelectPreset(room.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: room.color }}
              />
              <span>{room.name}</span>
            </button>
          );
        })}
      </div>

      {/* Hướng dẫn thao tác chuột / bàn phím */}
      <div className="hidden md:flex items-center gap-2 glass-panel-subtle px-3 py-1.5 rounded-2xl text-[11px] text-slate-400 pointer-events-auto">
        <MousePointer className="w-3.5 h-3.5 text-violet-400" />
        <span>
          <strong className="text-slate-300">Xoay:</strong> Chuột phải / Shift + Trái
        </span>
        <span className="text-slate-600">•</span>
        <span>
          <strong className="text-slate-300">Di chuyển:</strong> Chuột giữa
        </span>
        <span className="text-slate-600">•</span>
        <span>
          <strong className="text-slate-300">Phóng to:</strong> Cuộn chuột
        </span>
      </div>
    </footer>
  );
}
