import React, { useState } from 'react';
import OfficeScene from './components/OfficeScene';
import TopBar from './components/TopBar';
import RightSidebar from './components/RightSidebar';
import BottomBar from './components/BottomBar';
import AgentModal from './components/AgentModal';
import AssignTaskModal from './components/AssignTaskModal';
import { INITIAL_ROOMS, OFFICE_METRICS } from './data/officeData';

export default function App() {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isTouring, setIsTouring] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('all');
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [tasks, setTasks] = useState([
    {
      id: 'task_1',
      title: 'Tải 15 video Douyin ngách AI Video',
      roomName: 'Phòng Douyin',
      assignee: 'Mochi',
      status: 'Đang xử lý',
      time: '15:45'
    },
    {
      id: 'task_2',
      title: 'Cắt 8 đoạn viral livestream A Long',
      roomName: 'Phòng Cắt clip',
      assignee: 'Mít',
      status: 'Đang xử lý',
      time: '15:55'
    }
  ]);

  const handleSelectAgent = (member, room) => {
    setSelectedAgent(member);
    setSelectedRoom(room);
  };

  const handleSelectRoom = (roomId) => {
    setCameraPreset(roomId);
    setIsTouring(false);
  };

  // Cập nhật việc mới cho từng agent cụ thể
  const handleUpdateAgentTask = (agentId, newTask) => {
    setRooms(prevRooms => {
      return prevRooms.map(room => {
        return {
          ...room,
          members: room.members.map(member => {
            if (member.id === agentId) {
              return {
                ...member,
                status: 'working',
                statusText: 'Đang làm việc',
                statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                currentTask: newTask,
                logs: [
                  `[${new Date().toLocaleTimeString('vi-VN')}] Nhận nhiệm vụ mới: "${newTask}"`,
                  ...member.logs
                ]
              };
            }
            return member;
          })
        };
      });
    });

    // Thêm vào danh sách việc đã giao
    setTasks(prev => [
      {
        id: 'task_' + Date.now(),
        title: newTask,
        roomName: selectedRoom?.name || 'Văn phòng',
        assignee: selectedAgent?.name || 'Bot',
        status: 'Đang làm việc',
        time: new Date().toLocaleTimeString('vi-VN')
      },
      ...prev
    ]);

    setSelectedAgent(null);
  };

  // Giao việc mới từ Modal TopBar
  const handleAddNewTask = (newTaskObj) => {
    setTasks(prev => [newTaskObj, ...prev]);
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
        metrics={OFFICE_METRICS}
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
    </main>
  );
}
