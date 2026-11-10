import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Compass,
  Plus,
  Clock,
  Wifi,
  Terminal,
  FolderGit2,
  GitBranch,
  ChevronDown,
  RefreshCw,
  FolderPlus,
  Check,
  Code2
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export default function TopBar({
  isTouring,
  setIsTouring,
  onOpenAssignTask,
  onOpenAntigravityLive,
  metrics,
  isConnected = false,
  projects = [],
  currentProject = null,
  onSelectProject,
  onScanProjects,
  onAddCustomProject
}) {
  const [timeStr, setTimeStr] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customPath, setCustomPath] = useState('');
  const [customName, setCustomName] = useState('');
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProjectDropdownOpen(false);
        setShowAddForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const totalAgents =
    (metrics?.working ?? 0) +
    (metrics?.chat ?? 0) +
    (metrics?.gaming ?? 0) +
    (metrics?.idle ?? 0) +
    (metrics?.away ?? 0);

  const statusChips = [
    {
      label: 'ngồi máy',
      count: metrics?.working ?? 0,
      dotColor: 'bg-emerald-400 animate-pulse',
      pillClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
    },
    {
      label: 'trò chuyện',
      count: metrics?.chat ?? 0,
      dotColor: 'bg-amber-400',
      pillClass: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
    },
    {
      label: 'giải trí',
      count: metrics?.gaming ?? 0,
      dotColor: 'bg-cyan-400',
      pillClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
    },
    {
      label: 'nghỉ chờ',
      count: metrics?.idle ?? 0,
      dotColor: 'bg-slate-400',
      pillClass: 'bg-slate-500/10 text-slate-300 border-slate-500/20'
    },
    {
      label: 'pantry',
      count: metrics?.away ?? 0,
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
              <span className="text-emerald-400 font-mono text-[10px]">
                {totalAgents} AI Agents đang hoạt động
              </span>
            </p>
          </div>
        </div>

        {/* BỘ CHỌN DỰ ÁN (PROJECT SELECTOR / SWITCHER) */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="btn-project-selector"
            onClick={() => {
              soundManager.playPop();
              setIsProjectDropdownOpen(!isProjectDropdownOpen);
            }}
            className={`glass-panel px-3.5 py-2 rounded-2xl flex items-center gap-2.5 text-xs transition-all active:scale-95 ${
              isProjectDropdownOpen
                ? 'border-amber-400/60 bg-slate-900/95 shadow-lg shadow-amber-500/10'
                : 'hover:border-white/20'
            }`}
            title="Nhấn để chuyển đổi dự án Antigravity"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-400">
                  Dự Án
                </span>
                {currentProject?.branch && (
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-1 rounded">
                    <GitBranch className="w-2.5 h-2.5" />
                    {currentProject.branch}
                  </span>
                )}
              </div>
              <div className="text-xs font-extrabold text-white max-w-[130px] truncate leading-tight">
                {currentProject?.name || 'Chọn Dự Án'}
              </div>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isProjectDropdownOpen ? 'rotate-180 text-amber-400' : ''
              }`}
            />
          </button>

          {/* DROPDOWN MENU */}
          {isProjectDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl border border-white/15 p-3 flex flex-col gap-2.5 z-50 animate-fade-in backdrop-blur-xl bg-slate-950/95">
              {/* Header Dropdown */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Dự án Antigravity ({projects.length})
                  </span>
                </div>
                <button
                  onClick={async () => {
                    soundManager.playPop();
                    setIsScanning(true);
                    if (onScanProjects) await onScanProjects();
                    setTimeout(() => setIsScanning(false), 500);
                  }}
                  disabled={isScanning}
                  className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
                  title="Quét lại toàn bộ thư mục Antigravity"
                >
                  <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isScanning ? 'Đang quét...' : 'Quét lại'}</span>
                </button>
              </div>

              {/* Danh sách dự án */}
              <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 pr-1">
                {projects.length > 0 ? (
                  projects.map((proj) => {
                    const isSelected = currentProject?.id === proj.id;
                    return (
                      <div
                        key={proj.id}
                        onClick={() => {
                          soundManager.playChime();
                          if (onSelectProject) onSelectProject(proj.id);
                          setIsProjectDropdownOpen(false);
                          setShowAddForm(false);
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border border-amber-400/50 shadow-sm'
                            : 'bg-black/35 hover:bg-white/5 border border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">
                              {proj.name}
                            </span>
                            {proj.branch && (
                              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 flex items-center gap-0.5 shrink-0">
                                <GitBranch className="w-2.5 h-2.5" />
                                {proj.branch}
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                            {proj.path}
                          </p>

                          {/* Tech stack badges */}
                          {proj.techStack && proj.techStack.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap mt-1.5">
                              {proj.techStack.slice(0, 4).map((tech, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] font-semibold bg-white/5 text-slate-300 px-1.5 py-0.2 rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                              {proj.status && (
                                <span className="text-[9px] font-mono text-slate-400">
                                  • {proj.status}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Chưa quét được dự án nào. Bấm nút Quét lại hoặc Thêm đường dẫn bên dưới.
                  </div>
                )}
              </div>

              {/* Thêm thư mục tùy chỉnh */}
              <div className="pt-2 border-t border-white/10">
                {!showAddForm ? (
                  <button
                    onClick={() => {
                      soundManager.playPop();
                      setShowAddForm(true);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Thêm thư mục dự án khác...</span>
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 bg-black/40 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[11px] font-bold text-slate-200">
                      Nhập đường dẫn dự án trên máy:
                    </span>
                    <input
                      type="text"
                      value={customPath}
                      onChange={(e) => setCustomPath(e.target.value)}
                      placeholder="/home/antigravity/ten_du_an"
                      className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          if (!customPath.trim()) return;
                          soundManager.playSuccess();
                          if (onAddCustomProject) {
                            await onAddCustomProject(customPath.trim(), customName.trim() || null);
                          }
                          setShowAddForm(false);
                          setCustomPath('');
                          setCustomName('');
                          setIsProjectDropdownOpen(false);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                      >
                        Thêm & Chọn
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Các chip đếm số lượng nhân sự AI theo trạng thái thực tế */}
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
        <div className="hidden md:flex glass-panel-subtle px-3 py-2 rounded-2xl items-center gap-2 text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-bold text-slate-100 tracking-wider">
            {timeStr || '09:00:00'}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
            VN
          </span>
        </div>

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
