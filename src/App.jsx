import React, { useState, useEffect, useRef } from 'react';
import OfficeScene from './components/OfficeScene';
import TopBar from './components/TopBar';
import RightSidebar from './components/RightSidebar';
import BottomBar from './components/BottomBar';
import AgentModal from './components/AgentModal';
import AssignTaskModal from './components/AssignTaskModal';
import AntigravityLiveModal from './components/AntigravityLiveModal';
import { INITIAL_ROOMS, OFFICE_METRICS } from './data/officeData';
import { api, OfficeWebSocketClient } from './services/api';

export default function App() {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [metrics, setMetrics] = useState(OFFICE_METRICS);
  const [tasks, setTasks] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isTouring, setIsTouring] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('all');
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [isAntigravityLiveOpen, setIsAntigravityLiveOpen] = useState(false);
  const [antigravitySession, setAntigravitySession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsClientRef = useRef(null);

  // 1. Tải trạng thái ban đầu từ REST API & Khởi tạo WebSocket Realtime
  useEffect(() => {
    let isMounted = true;

    // Lấy dữ liệu ban đầu từ REST API
    api.fetchOfficeState().then((state) => {
      if (!isMounted || !state) return;
      if (state.rooms) setRooms(state.rooms);
      if (state.tasks) setTasks(state.tasks);
      if (state.metrics) setMetrics(state.metrics);
    });

    // Lấy dữ liệu phiên Antigravity Live ban đầu
    api.fetchAntigravitySession().then((sessionData) => {
      if (isMounted && sessionData) {
        setAntigravitySession(sessionData);
      }
    });

    // Kết nối WebSocket Real-time
    const handleWsMessage = (type, data) => {
      if (!isMounted) return;

      switch (type) {
        case 'INIT_STATE': {
          if (data.rooms) setRooms(data.rooms);
          if (data.tasks) setTasks(data.tasks);
          if (data.metrics) setMetrics(data.metrics);
          break;
        }

        case 'ANTIGRAVITY_LIVE_SYNC': {
          if (data?.session) {
            setAntigravitySession(data.session);
          }
          break;
        }

        case 'ANTIGRAVITY_STATS': {
          setAntigravitySession((prev) => (prev ? { ...prev, stats: data } : prev));
          break;
        }

        case 'AGENT_UPDATED': {
          const { agent, room, metrics: newMetrics } = data;
          if (newMetrics) setMetrics(newMetrics);

          setRooms((prevRooms) =>
            prevRooms.map((r) => {
              if (room && r.id === room.id) {
                return {
                  ...r,
                  members: r.members.map((m) => (m.id === agent.id ? agent : m))
                };
              }
              return {
                ...r,
                members: r.members.map((m) => (m.id === agent.id ? agent : m))
              };
            })
          );

          setSelectedAgent((prev) => (prev && prev.id === agent.id ? agent : prev));
          break;
        }

        case 'AGENT_STATUS_CHANGED': {
          const { agent, metrics: newMetrics } = data;
          if (newMetrics) setMetrics(newMetrics);

          setRooms((prevRooms) =>
            prevRooms.map((r) => ({
              ...r,
              members: r.members.map((m) => (m.id === agent.id ? agent : m))
            }))
          );

          setSelectedAgent((prev) => (prev && prev.id === agent.id ? agent : prev));
          break;
        }

        case 'AGENT_LOG': {
          const { agentId, log, agent } = data;
          setRooms((prevRooms) =>
            prevRooms.map((r) => ({
              ...r,
              members: r.members.map((m) => {
                if (m.id === agentId) {
                  return agent || { ...m, logs: [log, ...(m.logs || [])] };
                }
                return m;
              })
            }))
          );

          setSelectedAgent((prev) => {
            if (prev && prev.id === agentId) {
              return agent || { ...prev, logs: [log, ...(prev.logs || [])] };
            }
            return prev;
          });
          break;
        }

        case 'AGENT_THOUGHT': {
          const { agentId, thought } = data;
          setRooms((prevRooms) =>
            prevRooms.map((r) => ({
              ...r,
              members: r.members.map((m) => {
                if (m.id === agentId) {
                  return { ...m, thoughts: [thought, ...(m.thoughts || [])] };
                }
                return m;
              })
            }))
          );
          break;
        }

        case 'TASK_ADDED': {
          setTasks((prev) => {
            const exists = prev.some((t) => t.id === data.id);
            return exists ? prev : [data, ...prev];
          });
          break;
        }

        case 'TASK_UPDATED': {
          setTasks((prev) =>
            prev.map((t) => (t.id === data.id ? { ...t, ...data } : t))
          );
          break;
        }

        case 'TASK_DELETED': {
          setTasks((prev) => prev.filter((t) => t.id !== data.taskId));
          break;
        }

        case 'METRICS_UPDATED': {
          setMetrics(data);
          break;
        }

        case 'RESET_STATE': {
          if (data.rooms) setRooms(data.rooms);
          if (data.tasks) setTasks(data.tasks);
          if (data.metrics) setMetrics(data.metrics);
          break;
        }

        default:
          break;
      }
    };

    const client = new OfficeWebSocketClient(handleWsMessage, (connected) => {
      if (isMounted) setIsConnected(connected);
    });
    client.connect();
    wsClientRef.current = client;

    return () => {
      isMounted = false;
      client.close();
    };
  }, []);

  const handleSelectAgent = (member, room) => {
    setSelectedAgent(member);
    setSelectedRoom(room);
  };

  const handleSelectRoom = (roomId) => {
    setCameraPreset(roomId);
    setIsTouring(false);
  };

  // Cập nhật việc mới cho từng agent cụ thể -> Gọi API Backend thật
  const handleUpdateAgentTask = (agentId, newTask) => {
    // 1. Gọi REST API tới server
    api.assignAgentTask(agentId, newTask);

    // 2. Cập nhật optimistic giao diện ngay lập tức
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setRooms((prevRooms) => {
      return prevRooms.map((room) => {
        return {
          ...room,
          members: room.members.map((member) => {
            if (member.id === agentId) {
              return {
                ...member,
                status: 'working',
                statusText: 'Đang làm việc',
                statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                currentTask: newTask,
                logs: [
                  `[${timestamp}] Nhận nhiệm vụ mới: "${newTask}"`,
                  ...(member.logs || [])
                ]
              };
            }
            return member;
          })
        };
      });
    });

    setTasks((prev) => [
      {
        id: 'task_' + Date.now(),
        title: newTask,
        roomName: selectedRoom?.name || 'Văn phòng',
        assignee: selectedAgent?.name || 'Bot',
        status: 'Đang làm việc',
        time: timestamp
      },
      ...prev
    ]);

    setSelectedAgent(null);
  };

  // Giao việc mới từ Modal TopBar -> Gọi API Backend thật
  const handleAddNewTask = (newTaskObj) => {
    api.createTask(newTaskObj);
    setTasks((prev) => [newTaskObj, ...prev]);
  };

  // Gửi sự kiện mới vào phiên Antigravity Live
  const handleSendAntigravityEvent = (eventData) => {
    api.sendAntigravityEvent(eventData);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0b0d13]">
      {/* 1. Lớp Scene 3D tương tác */}
      <OfficeScene
        rooms={rooms}
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
        isTouring={isTouring}
        setIsTouring={setIsTouring}
        cameraPreset={cameraPreset}
        setCameraPreset={setCameraPreset}
      />

      {/* 2. Lớp UI TopBar */}
      <TopBar
        isTouring={isTouring}
        setIsTouring={setIsTouring}
        onOpenAssignTask={() => setIsAssignTaskOpen(true)}
        onOpenAntigravityLive={() => setIsAntigravityLiveOpen(true)}
        metrics={metrics}
        isConnected={isConnected}
      />

      {/* 3. Lớp UI RightSidebar */}
      <RightSidebar
        rooms={rooms}
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
        onSelectRoom={handleSelectRoom}
        tasks={tasks}
      />

      {/* 4. Lớp UI BottomBar */}
      <BottomBar
        rooms={rooms}
        cameraPreset={cameraPreset}
        setCameraPreset={setCameraPreset}
      />

      {/* 5. Modal chi tiết Agent */}
      <AgentModal
        agent={selectedAgent}
        room={selectedRoom}
        onClose={() => setSelectedAgent(null)}
        onUpdateAgentTask={handleUpdateAgentTask}
      />

      {/* 6. Modal Giao việc tổng */}
      <AssignTaskModal
        isOpen={isAssignTaskOpen}
        onClose={() => setIsAssignTaskOpen(false)}
        rooms={rooms}
        onAddNewTask={handleAddNewTask}
      />

      {/* 7. Modal Antigravity Live Session Hub */}
      <AntigravityLiveModal
        isOpen={isAntigravityLiveOpen}
        onClose={() => setIsAntigravityLiveOpen(false)}
        session={antigravitySession}
        onSendEvent={handleSendAntigravityEvent}
      />
    </main>
  );
}
