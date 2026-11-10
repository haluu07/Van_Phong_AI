export const INITIAL_ROOMS = [
  {
    id: 'room_along',
    name: 'Phòng A Long',
    subtitle: 'Khu vực điều hành & chỉ huy AI',
    color: '#8b5cf6', // Tím VIP
    center: [8, 0, 8],
    cameraPos: [15, 12, 15],
    target: [8, 0, 8],
    members: [
      {
        id: 'along',
        name: 'A Long',
        role: 'Tổng chỉ huy',
        type: 'boss',
        avatar: '👑',
        status: 'working',
        statusText: 'Chỉ huy Antigravity Live',
        statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        currentTask: 'nhưng mà a muốn nó link với antigravity hiện tại a đang làm việc như này',
        pos: [8, 0, 8],
        deskPos: [8, 0, 8],
        thoughts: [
          'nhưng mà a muốn nó link với antigravity hiện tại a đang làm việc như này',
          'Đang chỉ đạo Antigravity đồng bộ trực tiếp phiên làm việc vào văn phòng 3D.',
          'Các tác vụ code, build, git đang phản hồi thời gian thực qua WebSocket!'
        ],
        logs: [
          '[09:30:36] Sếp A Long: "nhưng mà a muốn nó link với antigravity hiện tại a đang làm việc như này"',
          '[09:20:50] Sếp A Long: "kết nối API backend thật cho anh"',
          '[09:17:36] Sếp A Long: "phân tích dự án hiện tại đi e"'
        ]
      }
    ]
  },
  {
    id: 'room_douyin',
    name: 'Phòng Douyin',
    subtitle: 'Tải video Douyin Cắt & MQ',
    color: '#f97316', // Cam
    center: [-8, 0, -8],
    cameraPos: [-3, 10, -2],
    target: [-8, 0, -8],
    members: [
      {
        id: 'dung',
        name: 'Dũng',
        role: 'Trưởng phòng',
        type: 'bear',
        avatar: '🐻',
        status: 'working',
        statusText: 'Xem bảng giao việc',
        statusColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        currentTask: 'Phân tích các kênh Douyin triệu view ngách công nghệ',
        pos: [-9.5, 0, -9.5],
        deskPos: [-9.5, 0, -9.5],
        thoughts: ['Kênh này đang có trend mới về AI Visual, đẩy task cho Mochi tải về thôi!'],
        logs: [
          '[15:30:10] Quét 50 tài khoản Douyin nổi bật',
          '[15:45:22] Tải thành công 12 video 4K không watermark'
        ]
      },
      {
        id: 'mochi',
        name: 'Mochi',
        role: 'Tải và lọc video',
        type: 'cat',
        avatar: '🐱',
        status: 'working',
        statusText: 'Đang tải video',
        statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        currentTask: 'Lọc video chất lượng cao & loại bỏ watermark',
        pos: [-6.5, 0, -9.5],
        deskPos: [-6.5, 0, -9.5],
        thoughts: ['Đã tải xong 15 video, đang lọc tiếp video có độ phân giải cao...'],
        logs: ['[15:50:00] Đang render frame lọc nhiễu', '[15:52:10] Lưu file vào folder Douyin_Raw']
      },
      {
        id: 'bo',
        name: 'Bơ',
        role: 'Phụ đề và nhạc nền',
        type: 'panda',
        avatar: '🐼',
        status: 'break',
        statusText: 'Chơi bóng bàn',
        statusColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        currentTask: 'Giải lao chờ mẻ video tiếp theo từ Mochi',
        pos: [5, 0, -8],
        deskPos: [-8, 0, -6.5],
        thoughts: ['Làm 1 ván bóng bàn rồi quay lại match nhạc lofi cho video mới nè!'],
        logs: ['[15:40:00] Hoàn thành 5 bản vietsub video ngắn', '[15:45:00] Tạm nghỉ 10 phút']
      }
    ]
  },
  {
    id: 'room_cutclip',
    name: 'Phòng Cắt clip',
    subtitle: 'Cắt clip livestream tự động',
    color: '#06b6d4', // Cyan
    center: [0, 0, -8],
    cameraPos: [4, 10, -2],
    target: [0, 0, -8],
    members: [
      {
        id: 'cuong',
        name: 'Cường',
        role: 'Trưởng phòng',
        type: 'fox',
        avatar: '🦊',
        status: 'gaming',
        statusText: 'Chơi máy game',
        statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        currentTask: 'Đã hoàn thành render batch 10 video, đang relax',
        pos: [7, 0, -6.5],
        deskPos: [-1.5, 0, -9.5],
        thoughts: ['Trận game này căng ghê, 5 phút nữa quay lại duyệt clip xuất kho.'],
        logs: ['[15:20:10] Script cắt highlight Livestream hoàn tất 100%']
      },
      {
        id: 'na',
        name: 'Na',
        role: 'Phần âm live',
        type: 'rabbit',
        avatar: '🐰',
        status: 'chat',
        statusText: 'Ra pantry trò chuyện',
        statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        currentTask: 'Lọc tạp âm podcast & chuẩn hóa loudness -14 LUFS',
        pos: [3.5, 0, -4.5],
        deskPos: [1.5, 0, -9.5],
        thoughts: ['Cà phê hôm nay thơm quá, pha thêm ly sữa cho Mít nữa!'],
        logs: ['[15:42:01] Khử tiếng ồn echo cho file Live_01.wav']
      },
      {
        id: 'mit',
        name: 'Mít',
        role: 'Chọn đoạn và cắt',
        type: 'hamster',
        avatar: '🐹',
        status: 'working',
        statusText: 'Ngồi máy',
        statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        currentTask: 'Tìm điểm hook (3 giây đầu) cho 8 đoạn highlight',
        pos: [0, 0, -6.5],
        deskPos: [0, 0, -6.5],
        thoughts: ['Đoạn này anh Long nói hài ghê, cắt làm viral short ngay!'],
        logs: ['[15:55:00] Đã gắn 8 marker highlight vào timeline CapCut']
      }
    ]
  },
  {
    id: 'room_schedule',
    name: 'Phòng Lên lịch',
    subtitle: 'Tự lên lịch video mới trong Drive',
    color: '#3b82f6', // Xanh dương
    center: [-8, 0, 0],
    cameraPos: [-2, 10, 4],
    target: [-8, 0, 0],
    members: [
      {
        id: 'lam',
        name: 'Lâm',
        role: 'Trưởng phòng',
        type: 'koala',
        avatar: '🐨',
        status: 'coffee',
        statusText: 'Đi pha cà phê',
        statusColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        currentTask: 'Theo dõi cronjob đồng bộ Drive lên TikTok & YouTube',
        pos: [3.5, 0, -6.5],
        deskPos: [-9.5, 0, -1.5],
        thoughts: ['Cà phê nạp năng lượng rồi xem schedule cho 30 video ngày mai.'],
        logs: ['[15:15:00] Set lịch đăng tự động 12 video lúc 19:00']
      },
      {
        id: 'sua',
        name: 'Sữa',
        role: 'Edit video',
        type: 'dog',
        avatar: '🐶',
        status: 'working',
        statusText: 'Về kho làm việc',
        statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        currentTask: 'Kiểm tra tỷ lệ khung hình 9:16 và thumbnail',
        pos: [-6.5, 0, -1.5],
        deskPos: [-6.5, 0, -1.5],
        thoughts: ['Thumbnail màu này bắt mắt lắm nè, tỉ lệ click chắc chắn cao.'],
        logs: ['[15:35:20] Gắn metadata thẻ tags SEO cho video']
      },
      {
        id: 'bong',
        name: 'Bống',
        role: 'Ảnh bìa & content',
        type: 'penguin',
        avatar: '🐧',
        status: 'idle',
        statusText: 'Nghỉ máy, chờ giờ chạy',
        statusColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        currentTask: 'Chờ slot 18:00 để trigger API xuất bản hàng loạt',
        pos: [-9.5, 0, 1.5],
        deskPos: [-9.5, 0, 1.5],
        thoughts: ['Đã chuẩn bị xong 10 tiêu đề giật tít, chờ giờ đẹp là phát!'],
        logs: ['[15:40:00] Hàng đợi queue 10 bài đang sẵn sàng']
      },
      {
        id: 'com',
        name: 'Cốm',
        role: 'Up bot 3 tr...',
        type: 'frog',
        avatar: '🐸',
        status: 'idle',
        statusText: 'Nghỉ máy, chờ giờ chạy',
        statusColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        currentTask: 'Chạy bot auto backup video lên Google Drive',
        pos: [-6.5, 0, 1.5],
        deskPos: [-6.5, 0, 1.5],
        thoughts: ['Ổ cứng Drive còn dư 2TB, thoải mái chứa tài nguyên.'],
        logs: ['[15:45:00] Backup 4GB dữ liệu hoàn tất']
      }
    ]
  },
  {
    id: 'room_report',
    name: 'Phòng Báo cáo',
    subtitle: 'Báo cáo dữ liệu KOC & Dashboard',
    color: '#ec4899', // Hồng neon
    center: [0, 0, 0],
    cameraPos: [0, 9, 7],
    target: [0, 0, 0],
    members: [
      {
        id: 'tom',
        name: 'Tôm',
        role: 'Thuyết trình & Tổng hợp',
        type: 'shiba',
        avatar: '🐕',
        status: 'spotlight',
        statusText: 'Đang đứng báo cáo',
        statusColor: 'bg-pink-500/30 text-pink-300 border-pink-500 animate-pulse',
        currentTask: 'Thuyết trình báo cáo tương tác tuần qua tại bục trung tâm',
        pos: [0, 0, 0],
        deskPos: [0, 0, 0],
        thoughts: [
          'Số liệu tuần này tăng trưởng 142% so với tuần trước!',
          'Các kênh TikTok và Douyin đều vượt mục tiêu đề ra.',
          'Chào mừng anh Long và cả văn phòng đến với phiên báo cáo!'
        ],
        logs: [
          '[16:00:00] Bắt đầu phiên báo cáo tổng hợp',
          '[16:03:00] Tổng view đạt 2.400.000 lượt xem',
          '[16:05:00] Chi phí sản xuất giảm 65% nhờ tự động hóa Antigravity'
        ]
      },
      {
        id: 'bao',
        name: 'Bảo',
        role: 'Trưởng phòng',
        type: 'tiger',
        avatar: '🐯',
        status: 'break',
        statusText: 'Chơi bóng bàn',
        statusColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        currentTask: 'Cùng Bơ chơi bóng bàn, theo dõi Tôm báo cáo',
        pos: [7, 0, -8],
        deskPos: [-1.5, 0, 1.5],
        thoughts: ['Tôm thuyết trình xuất sắc quá, lát thưởng thêm xúc xích!'],
        logs: ['[15:50:00] Đã ký duyệt số liệu báo cáo KOC']
      },
      {
        id: 'xoai',
        name: 'Xoài',
        role: 'Thu thập số liệu',
        type: 'duck',
        avatar: '🦆',
        status: 'working',
        statusText: 'Thu thập số liệu',
        statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        currentTask: 'Cào dữ liệu tương tác từ 4 nền tảng MXH',
        pos: [1.5, 0, 1.5],
        deskPos: [1.5, 0, 1.5],
        thoughts: ['Biểu đồ lượt thích đang dốc đứng, số liệu rất đẹp!'],
        logs: ['[15:58:00] Hoàn thành crawl 15.000 bình luận']
      }
    ]
  },
  {
    id: 'room_pantry',
    name: 'Khu Pantry & Giải trí',
    subtitle: 'Nạp năng lượng, bóng bàn & cà phê',
    color: '#10b981', // Xanh lá
    center: [6, 0, -7],
    cameraPos: [12, 10, -2],
    target: [6, 0, -7],
    members: []
  }
];

export const INITIAL_TASKS = [
  {
    id: 'task_1',
    title: 'Tải 15 video Douyin ngách AI Video',
    roomName: 'Phòng Douyin',
    roomId: 'room_douyin',
    assignee: 'Mochi',
    assigneeId: 'mochi',
    status: 'Đang xử lý',
    progress: 75,
    time: '15:45'
  },
  {
    id: 'task_2',
    title: 'Cắt 8 đoạn viral livestream A Long',
    roomName: 'Phòng Cắt clip',
    roomId: 'room_cutclip',
    assignee: 'Mít',
    assigneeId: 'mit',
    status: 'Đang xử lý',
    progress: 50,
    time: '15:55'
  }
];
