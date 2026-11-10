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
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isTouring, setIsTouring] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('all');
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [isAntigravityLiveOpen, setIsAntigravityLiveOpen] = useState(false);
  const [antigravitySession, setAntigravitySession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestLog, setLatestLog] = useState(
    'Văn phòng đang trống • Chờ Sếp A Long giao việc để triệu hồi nhân sự AI'
  );

  const wsClientRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    api.fetchOfficeState().then((state) => {
      if (!isMounted || !state) return;
      if (state.rooms) setRooms(state.rooms);
      if (state.tasks) setTasks(state.tasks);
      if (state.metrics) setMetrics(state.metrics);
    });

    api.fetchProjects().then((projData) => {
      if (!isMounted || !projData) return;
      if (projData.projects) setProjects(projData.projects);
      if (projData.currentProject) setCurrentProject(projData.currentProject);
    });

    api.fetchAntigravitySession().then((sessionData) => {
      if (isMounted && sessionData) {
        setAntigravitySession(sessionData);
        if (sessionData.currentAction) {
          setLatestLog(sessionData.currentAction);
        }
      }
    });

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
            if (data.session.currentAction) {
              setLatestLog(data.session.currentAction);
            }
          }
          break;
        }

        case 'ANTIGRAVITY_STATS': {
          setAntigravitySession((prev) => (prev ? { ...prev, stats: data } : prev));
          break;
        }

        case 'AGENT_UPDATED': {
          const { agent, rooms: updatedRooms, metrics: newMetrics } = data;
          if (newMetrics) setMetrics(newMetrics);
          if (updatedRooms) setRooms(updatedRooms);
          if (agent?.logs?.[0]) {
            setLatestLog(`${agent.avatar || '🤖'} ${agent.name}: ${agent.logs[0]}`);
          }
          setSelectedAgent((prev) => (prev && prev.id === agent.id ? agent : prev));
          break;
        }

        case 'AGENT_STATUS_CHANGED': {
          const { agent, rooms: updatedRooms, metrics: newMetrics } = data;
          if (newMetrics) setMetrics(newMetrics);
          if (updatedRooms) setRooms(updatedRooms);
          if (agent) {
            setLatestLog(
              `${agent.avatar || '🤖'} ${agent.name} chuyển trạng thái: ${agent.statusText}`
            );
          }
          setSelectedAgent((prev) => (prev && prev.id === agent.id ? agent : prev));
          break;
        }

        case 'AGENT_LOG': {
          const { agentId, log, agent } = data;
          if (log) {
            setLatestLog(`[${agent?.name || agentId}] ${log}`);
          }
          setSelectedAgent((prev) => {
            if (prev && prev.id === agentId) {
              return agent || { ...prev, logs: [log, ...(prev.logs || [])] };
            }
            return prev;
          });
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
          setSelectedAgent(null);
          setLatestLog('Đã giải tán toàn bộ nhân sự • Văn phòng trống 100%');
          break;
        }

        case 'PROJECTS_UPDATED': {
          if (data.projects) setProjects(data.projects);
          if (data.currentProject) setCurrentProject(data.currentProject);
          break;
        }

        case 'PROJECT_SWITCHED': {
          if (data.currentProject) {
            setCurrentProject(data.currentProject);
            setLatestLog(`📁 Sếp A Long đã chọn dự án: ${data.currentProject.name}`);
          }
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

  const handleUpdateAgentTask = (agentId, newTask) => {
    api.assignAgentTask(agentId, newTask);
    setSelectedAgent(null);
  };

  const handleUpdateAgentStatus = (agentId, status, statusText) => {
    api.updateAgentStatus(agentId, status, statusText);
  };

  const handleDismissAgent = async (agentId) => {
    await api.dismissAgent(agentId);
    setSelectedAgent(null);
  };

  const handleCompleteTask = (taskId) => {
    api.updateTask(taskId, { status: 'Hoàn thành', progress: 100 });
  };

  const handleResetOffice = async () => {
    await api.resetOffice();
    setSelectedAgent(null);
  };

  const handleAddNewTask = async (newTaskObj) => {
    const res = await api.createTask(newTaskObj);
    if (res?.data?.room?.id) {
      setCameraPreset(res.data.room.id);
    }
  };

  const handleSendAntigravityEvent = (eventData) => {
    api.sendAntigravityEvent(eventData);
  };

  const handleSelectProject = (projectId) => {
    api.selectProject(projectId);
  };

  const handleScanProjects = () => {
    api.scanProjects();
  };

  const handleAddCustomProject = (folderPath, name) => {
    api.addCustomProject(folderPath, name);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#080a0f]">
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
        projects={projects}
        currentProject={currentProject}
        onSelectProject={handleSelectProject}
        onScanProjects={handleScanProjects}
        onAddCustomProject={handleAddCustomProject}
      />

      {/* 3. Lớp UI RightSidebar */}
      <RightSidebar
        rooms={rooms}
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
        onSelectRoom={handleSelectRoom}
        tasks={tasks}
        onCompleteTask={handleCompleteTask}
        onResetOffice={handleResetOffice}
        onOpenAssignTask={() => setIsAssignTaskOpen(true)}
        onOpenAntigravityLive={() => setIsAntigravityLiveOpen(true)}
        projects={projects}
        currentProject={currentProject}
        onSelectProject={handleSelectProject}
      />

      {/* 4. Lớp UI BottomBar + Live Stream Ticker */}
      <BottomBar
        rooms={rooms}
        cameraPreset={cameraPreset}
        setCameraPreset={setCameraPreset}
        latestLog={latestLog}
        onOpenAntigravityLive={() => setIsAntigravityLiveOpen(true)}
      />

      {/* 5. Modal chi tiết Agent */}
      <AgentModal
        agent={selectedAgent}
        room={selectedRoom}
        onClose={() => setSelectedAgent(null)}
        onUpdateAgentTask={handleUpdateAgentTask}
        onUpdateAgentStatus={handleUpdateAgentStatus}
        onDismissAgent={handleDismissAgent}
      />

      {/* 6. Modal Giao việc & Triệu hồi Chibi */}
      <AssignTaskModal
        isOpen={isAssignTaskOpen}
        onClose={() => setIsAssignTaskOpen(false)}
        rooms={rooms}
        onAddNewTask={handleAddNewTask}
        currentProject={currentProject}
        projects={projects}
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
