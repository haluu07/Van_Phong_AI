import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Activity,
  Layers,
  ListTodo,
  Search,
  Eye,
  PanelRightClose,
  PanelRightOpen,
  Clock,
  TrendingUp,
  RotateCcw,
  Plus
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export default function RightSidebar({
  rooms,
  selectedAgent,
  onSelectAgent,
  onSelectRoom,
  tasks,
  onCompleteTask,
  onResetOffice,
  onOpenAssignTask,
  onOpenAntigravityLive
}) {
  const [activeTab, setActiveTab] = useState('rooms');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState({
    room_along: true,
    room_douyin: true,
    room_cutclip: true,
    room_schedule: true,
    room_report: true,
    room_pantry: false
  });

  const toggleRoom = (roomId) => {
    soundManager.playPop();
    setExpandedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  if (isCollapsed) {
    return (
      <div className="absolute top-20 right-4 z-20 pointer-events-auto">
        <button
          onClick={() => {
            soundManager.playPop();
            setIsCollapsed(false);
          }}
          title="Mở bảng điều khiển"
          className="glass-panel px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition-all shadow-xl"
        >
          <PanelRightOpen className="w-4 h-4 text-amber-400" />
          <span>Bảng điều khiển</span>
        </button>
      </div>
    );
  }

  // Tính toán số liệu thực tế 100% (Không dùng mock data)
  const allAgents = rooms.flatMap((r) => r.members || []);
  const totalAgents = allAgents.length;
  const workingAgents = allAgents.filter(
    (m) => m.status === 'working' || m.status === 'spotlight'
  ).length;
  const totalTasks = tasks?.length || 0;
  const completedTasks = (tasks || []).filter((t) => t.status === 'Hoàn thành').length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Lọc phòng và nhân sự theo từ khóa tìm kiếm
  const filteredRooms = rooms.map((room) => {
    if (!searchQuery.trim()) return room;
    const q = searchQuery.toLowerCase();
    const matchedMembers = room.members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.currentTask && m.currentTask.toLowerCase().includes(q))
    );
    return { ...room, members: matchedMembers };
  });

  return (
    <aside className="absolute top-20 right-4 bottom-20 w-80 lg:w-[368px] z-20 flex flex-col gap-2.5 pointer-events-none animate-fade-in">
      {/* Thẻ điều hành Sếp A Long */}
      <div className="glass-panel p-3.5 rounded-2xl pointer-events-auto">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={() => {
                soundManager.playPop();
                onSelectRoom('room_along');
              }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black text-base flex items-center justify-center shadow-lg shadow-amber-500/20 cursor-pointer hover:scale-105 transition-transform shrink-0"
              title="Di chuyển camera tới Phòng A Long"
            >
              👑
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm font-extrabold text-white tracking-tight">
                  Chào Sếp A Long
                </h2>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded">
                  COMMANDER
                </span>
                <button
                  onClick={() => {
                    soundManager.playPop();
                    onOpenAntigravityLive && onOpenAntigravityLive();
                  }}
                  className="text-[9px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-1 hover:bg-emerald-500/25 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE SYNC
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug mt-1">
                {totalAgents === 0
                  ? 'Văn phòng đang trống. Giao việc để triệu hồi Chibi!'
                  : `Đang có ${totalAgents} nhân sự AI thực thi nhiệm vụ.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {(totalAgents > 0 || totalTasks > 0) && onResetOffice && (
              <button
                onClick={() => {
                  soundManager.playPop();
                  onResetOffice();
                }}
                title="Giải tán toàn bộ nhân vật & làm trống văn phòng"
                className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                soundManager.playPop();
                setIsCollapsed(true);
              }}
              title="Thu gọn bảng bên phải"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Tab điều hướng */}
        <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl mt-3 border border-white/[0.06] text-xs font-bold">
          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('rooms');
            }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'rooms'
                ? 'bg-slate-800 text-amber-300 shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Phòng ({totalAgents})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('reports');
            }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Số liệu thật</span>
          </button>

          <button
            onClick={() => {
              soundManager.playPop();
              setActiveTab('tasks');
            }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'tasks'
                ? 'bg-slate-800 text-emerald-300 shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Tác vụ ({totalTasks})</span>
          </button>
        </div>
      </div>

      {/* Nội dung danh sách theo Tab */}
      <div className="glass-panel flex-1 rounded-2xl p-3 overflow-y-auto pointer-events-auto flex flex-col gap-2.5">
        {activeTab === 'rooms' && (
          <div className="flex flex-col gap-2.5">
            {totalAgents > 0 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm nhân sự AI đang làm việc..."
                  className="w-full bg-black/35 border border-white/[0.07] focus:border-amber-400/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            )}

            {filteredRooms.map((room) => {
              const isExpanded = expandedRooms[room.id] || searchQuery.trim().length > 0;
              const workingCount = room.members.filter(
                (m) => m.status === 'working' || m.status === 'spotlight'
              ).length;

              return (
                <div
                  key={room.id}
                  className="bg-black/30 rounded-xl border border-white/[0.06] overflow-hidden transition-all hover:border-white/[0.12]"
                >
                  {/* Header phòng ban */}
                  <div
                    onClick={() => {
                      toggleRoom(room.id);
                      onSelectRoom(room.id);
                    }}
                    className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-1.5 h-7 rounded-full shrink-0"
                        style={{ backgroundColor: room.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-100 tracking-tight truncate">
                            {room.name}
                          </h3>
                          {workingCount > 0 && (
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                              {workingCount} active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-[195px]">
                          {room.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                      <span className="text-[10px] font-mono bg-white/[0.05] text-slate-300 px-1.5 py-0.5 rounded-md">
                        {room.members.length} bot
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Danh sách nhân viên trong phòng */}
                  {isExpanded && (
                    <div className="px-2 pb-2 pt-1 flex flex-col gap-1 border-t border-white/[0.05]">
                      {room.members.length > 0 ? (
                        room.members.map((member) => {
                          const isSelected = selectedAgent?.id === member.id;
                          return (
                            <div
                              key={member.id}
                              onClick={() => {
                                soundManager.playChime();
                                onSelectAgent(member, room);
                              }}
                              className={`group p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-amber-500/15 border border-amber-400/40 shadow-sm'
                                  : 'glass-card-interactive'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-slate-800/90 border border-white/10 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                                  {member.avatar}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-100 truncate">
                                      {member.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 truncate">
                                      • {member.role}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[165px] mt-0.5">
                                    {member.currentTask}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold whitespace-nowrap shrink-0 ${member.statusColor}`}
                              >
                                {member.statusText}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-2 px-2 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Bàn trống • Chờ giao việc</span>
                          {room.id !== 'room_pantry' && onOpenAssignTask && (
                            <button
                              onClick={() => {
                                soundManager.playPop();
                                onOpenAssignTask();
                              }}
                              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Triệu hồi</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="flex flex-col gap-3">
            {/* Tiến độ thực tế 100% */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-transparent border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Tỷ lệ hoàn thành tác vụ thật
                </span>
                <span className="text-xs font-mono font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                  {completionRate}%
                </span>
              </div>
              <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden mt-2.5 border border-white/5">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                Đã hoàn thành {completedTasks} / {totalTasks} nhiệm vụ được giao
              </p>
            </div>

            {/* 4 Metric Cards Thực Tế */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-black/35 border border-white/[0.06] flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-medium">
                  Nhân sự đã triệu hồi
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-mono font-extrabold text-cyan-300">
                    {totalAgents}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Chibi 3D</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/35 border border-white/[0.06] flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-medium">
                  Đang ngồi làm việc
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-mono font-extrabold text-emerald-300">
                    {workingAgents}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/35 border border-white/[0.06] flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-medium">
                  Tổng nhiệm vụ đã giao
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-mono font-extrabold text-amber-300">
                    {totalTasks}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Tasks</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/35 border border-white/[0.06] flex flex-col justify-between">
                <span className="text-slate-400 text-[10px] font-medium">
                  Đã hoàn tất
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-mono font-extrabold text-rose-300">
                    {completedTasks}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Done</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="flex flex-col gap-2">
            {tasks && tasks.length > 0 ? (
              tasks.map((t) => {
                const isDone = t.status === 'Hoàn thành';
                const progress = isDone ? 100 : t.progress ?? 20;
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-black/35 border border-white/[0.07] hover:border-white/15 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-100 leading-snug">
                        {t.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border shrink-0 font-semibold ${
                          isDone
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isDone ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-200 font-semibold">{t.assignee}</span>
                        <span>•</span>
                        <span>{t.roomName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {t.time && (
                          <span className="font-mono text-slate-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {t.time}
                          </span>
                        )}
                        {!isDone && onCompleteTask && (
                          <button
                            onClick={() => {
                              soundManager.playSuccess();
                              onCompleteTask(t.id);
                            }}
                            className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 underline"
                          >
                            Hoàn tất
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center gap-3">
                <p>Hiện chưa có nhiệm vụ nào được giao.</p>
                {onOpenAssignTask && (
                  <button
                    onClick={() => {
                      soundManager.playPop();
                      onOpenAssignTask();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Giao việc đầu tiên</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
