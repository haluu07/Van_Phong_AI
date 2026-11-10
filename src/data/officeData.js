// Dữ liệu cấu trúc phòng ban 3D (Sạch 100%, không chứa mock nhân vật hay mock task)
export const INITIAL_ROOMS = [
  {
    id: 'room_along',
    name: 'Phòng A Long',
    subtitle: 'Khu vực điều hành & chỉ huy AI',
    color: '#8b5cf6',
    center: [8, 0, 8],
    cameraPos: [15, 12, 15],
    target: [8, 0, 8],
    deskSlots: [
      [8, 0, 8],
      [6, 0, 8],
      [8, 0, 6]
    ],
    members: []
  },
  {
    id: 'room_douyin',
    name: 'Phòng Douyin',
    subtitle: 'Tải video Douyin Cắt & MQ',
    color: '#f97316',
    center: [-8, 0, -8],
    cameraPos: [-3, 10, -2],
    target: [-8, 0, -8],
    deskSlots: [
      [-9.5, 0, -9.5],
      [-6.5, 0, -9.5],
      [-8, 0, -6.5]
    ],
    members: []
  },
  {
    id: 'room_cutclip',
    name: 'Phòng Cắt clip',
    subtitle: 'Cắt clip livestream tự động',
    color: '#06b6d4',
    center: [0, 0, -8],
    cameraPos: [4, 10, -2],
    target: [0, 0, -8],
    deskSlots: [
      [-1.5, 0, -9.5],
      [1.5, 0, -9.5],
      [0, 0, -6.5]
    ],
    members: []
  },
  {
    id: 'room_schedule',
    name: 'Phòng Lên lịch',
    subtitle: 'Tự lên lịch video mới trong Drive',
    color: '#3b82f6',
    center: [-8, 0, 0],
    cameraPos: [-2, 10, 4],
    target: [-8, 0, 0],
    deskSlots: [
      [-9.5, 0, -1.5],
      [-6.5, 0, -1.5],
      [-9.5, 0, 1.5],
      [-6.5, 0, 1.5]
    ],
    members: []
  },
  {
    id: 'room_report',
    name: 'Phòng Báo cáo',
    subtitle: 'Báo cáo dữ liệu KOC & Dashboard',
    color: '#ec4899',
    center: [0, 0, 0],
    cameraPos: [0, 9, 7],
    target: [0, 0, 0],
    deskSlots: [
      [0, 0, 0],
      [-1.5, 0, 1.5],
      [1.5, 0, 1.5]
    ],
    members: []
  },
  {
    id: 'room_pantry',
    name: 'Khu Pantry & Giải trí',
    subtitle: 'Nạp năng lượng, bóng bàn & cà phê',
    color: '#10b981',
    center: [6, 0, -7],
    cameraPos: [12, 10, -2],
    target: [6, 0, -7],
    deskSlots: [
      [5, 0, -8],
      [7, 0, -8],
      [3.5, 0, -6.5]
    ],
    members: []
  }
];

export const OFFICE_METRICS = {
  working: 0,
  chat: 0,
  gaming: 0,
  idle: 0,
  away: 0,
  connected: true
};

export const AVATAR_TYPES = [
  { type: 'cat', avatar: '🐱', label: 'Mèo Chibi' },
  { type: 'shiba', avatar: '🐕', label: 'Cún Shiba' },
  { type: 'bear', avatar: '🐻', label: 'Gấu Nâu' },
  { type: 'panda', avatar: '🐼', label: 'Gấu Trúc' },
  { type: 'fox', avatar: '🦊', label: 'Cáo Cam' },
  { type: 'rabbit', avatar: '🐰', label: 'Thỏ Hồng' },
  { type: 'koala', avatar: '🐨', label: 'Gấu Koala' },
  { type: 'boss', avatar: '👑', label: 'Chỉ Huy VIP' }
];
