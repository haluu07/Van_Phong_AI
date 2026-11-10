import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Activity, Layers, CheckCircle2, ListTodo, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export default function RightSidebar({
  rooms,
  selectedAgent,
  onSelectAgent,
  onSelectRoom,
  tasks
}) {
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'reports' | 'tasks'
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
    setExpandedRooms(prev => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  return (
    <aside className="absolute top-20 right-4 bottom-16 w-80 lg:w-96 z-20 flex flex-col gap-3 pointer-events-none">
      {/* Thẻ chào sếp A Long (như trong ảnh mẫu) */}
      <div className="glass-panel p-3.5 rounded-2xl pointer-events-auto shadow-xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            L
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              Chào A Long
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded">
                Admin
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Antigravity Live
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Đang kết nối phiên trực tiếp với <strong className="text-violet-300">Antigravity AI</strong>. Bấm nút <strong className="text-amber-300">⚡ Antigravity Live</strong> để xem dòng sự kiện.
            </p>
          </div>
        </div>

        {/* 3 Tab điều hướng: Phòng ban | Báo cáo | Việc đã giao */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-900/60 p-1 rounded-xl mt-3 border border-white/5 text-xs font-semibold">
          <button
            onClick={() => { soundManager.playPop(); setActiveTab('rooms'); }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'rooms'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Phòng ban</span>
          </button>

          <button
            onClick={() => { soundManager.playPop(); setActiveTab('reports'); }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'reports'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Báo cáo</span>
          </button>

          <button
            onClick={() => { soundManager.playPop(); setActiveTab('tasks'); }}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'tasks'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Việc đã giao</span>
          </button>
        </div>
      </div>

      {/* Nội dung danh sách theo Tab */}
      <div className="glass-panel flex-1 rounded-2xl p-3 overflow-y-auto pointer-events-auto shadow-xl shadow-black/40 flex flex-col gap-2.5">
        {activeTab === 'rooms' && (
          <div className="flex flex-col gap-2.5">
            {rooms.map((room) => {
              const isExpanded = expandedRooms[room.id];
              return (
                <div
                  key={room.id}
                  className="bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden transition-all hover:border-white/10"
                >
                  {/* Header phòng ban */}
                  <div
                    onClick={() => {
                      toggleRoom(room.id);
                      onSelectRoom(room.id);
                    }}
                    className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: room.color }}
                      />
                      <div>
                        <h3 className="text-xs font-bold text-white tracking-wide">
                          {room.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {room.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        {room.members.length} bot
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Danh sách nhân viên trong phòng */}
                  {isExpanded && room.members.length > 0 && (
                    <div className="px-2.5 pb-2.5 pt-1 flex flex-col gap-1.5 border-t border-white/5">
                      {room.members.map((member) => {
                        const isSelected = selectedAgent?.id === member.id;
                        return (
                          <div
                            key={member.id}
                            onClick={() => {
                              soundManager.playChime();
                              onSelectAgent(member, room);
                            }}
                            className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-violet-600/30 border border-violet-500/60 shadow-md shadow-violet-500/20'
                                : 'bg-white/[0.03] hover:bg-white/[0.07] border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base select-none">{member.avatar}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                                  {member.name}
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {member.role}
                                  </span>
                                </p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                  {member.currentTask}
                                </p>
                              </div>
                            </div>

                            {/* Badge trạng thái */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ml-2 ${member.statusColor}`}
                            >
                              {member.statusText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="flex flex-col gap-3 p-1">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tiến độ hôm nay
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">98.5% KPI</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full w-[98.5%]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
                <p className="text-slate-400 text-[10px]">Video đã render</p>
                <p className="text-base font-bold text-cyan-300 mt-0.5">48 / 50</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
                <p className="text-slate-400 text-[10px]">Kịch bản Douyin</p>
                <p className="text-base font-bold text-orange-300 mt-0.5">12 / 12</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
                <p className="text-slate-400 text-[10px]">Tự lên lịch bot</p>
                <p className="text-base font-bold text-blue-300 mt-0.5">100% OK</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
                <p className="text-slate-400 text-[10px]">Tiết kiệm chi phí</p>
                <p className="text-base font-bold text-emerald-300 mt-0.5">-65%</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Phiên báo cáo trực tiếp (Tôm)
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Chú cún Tôm đang thuyết trình báo cáo tương tác tuần qua tại bục trung tâm. Click vào Tôm để xem chi tiết!
              </p>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="flex flex-col gap-2">
            {tasks && tasks.length > 0 ? (
              tasks.map(t => (
                <div key={t.id} className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{t.title}</span>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Giao cho: {t.assignee}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có task nào được giao thủ công. Bấm nút <strong>"+ Giao việc"</strong> phía trên để điều động bot!
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
