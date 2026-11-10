import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundManager } from '../utils/soundEffects';

export default function OfficeScene({
  rooms,
  selectedAgent,
  onSelectAgent,
  isTouring,
  setIsTouring,
  cameraPreset,
  setCameraPreset
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const charactersRef = useRef([]);
  const spotlightMeshRef = useRef(null);
  const targetCamPos = useRef(new THREE.Vector3(14, 18, 16));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const tourStepRef = useRef(0);
  const tourTimerRef = useRef(0);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // --- 1. Scene, Camera, Renderer Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#0d1017');
    scene.fog = new THREE.FogExp2('#0d1017', 0.012);

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(16, 18, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.15; // Không cho camera chìm dưới sàn
    controls.minDistance = 6;
    controls.maxDistance = 50;
    controls.target.set(0, 0, 0);

    // --- 2. Lighting System (Warm, Cute, Stylized) ---
    const ambientLight = new THREE.AmbientLight('#a5b4fc', 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#fff1e6', 1.8);
    dirLight.position.set(15, 25, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -22;
    dirLight.shadow.camera.right = 22;
    dirLight.shadow.camera.top = 22;
    dirLight.shadow.camera.bottom = -22;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Đèn phụ dịu nhẹ
    const fillLight = new THREE.DirectionalLight('#c4b5fd', 0.8);
    fillLight.position.set(-15, 12, -15);
    scene.add(fillLight);

    // --- 3. Dựng Sàn & Các Khu Vực Phòng Ban (Isometric Office Layout) ---
    // Sàn chính
    const mainFloorGeo = new THREE.BoxGeometry(28, 0.4, 28);
    const mainFloorMat = new THREE.MeshStandardMaterial({
      color: '#1a1d26',
      roughness: 0.85,
      metalness: 0.1
    });
    const mainFloor = new THREE.Mesh(mainFloorGeo, mainFloorMat);
    mainFloor.position.y = -0.2;
    mainFloor.receiveShadow = true;
    scene.add(mainFloor);

    // Sàn thảm từng phòng (Carpets with unique pastel shades)
    const createCarpet = (x, z, w, d, color, opacity = 0.4) => {
      const carpetGeo = new THREE.BoxGeometry(w, 0.05, d);
      const carpetMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        transparent: true,
        opacity: opacity
      });
      const carpet = new THREE.Mesh(carpetGeo, carpetMat);
      carpet.position.set(x, 0.03, z);
      carpet.receiveShadow = true;
      scene.add(carpet);
      return carpet;
    };

    // Phòng Báo Cáo (Hồng neon trung tâm - Giống hệt ảnh)
    createCarpet(0, 0, 9, 8, '#ec4899', 0.35);

    // Vòng tròn Spotlight phát sáng phòng Báo Cáo
    const spotGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.08, 48);
    const spotMat = new THREE.MeshBasicMaterial({
      color: '#f472b6',
      transparent: true,
      opacity: 0.45
    });
    const spotMesh = new THREE.Mesh(spotGeo, spotMat);
    spotMesh.position.set(0, 0.06, 0);
    scene.add(spotMesh);
    spotlightMeshRef.current = spotMesh;

    // Vòng phát quang ngoài (Pulse halo)
    const ringGeo = new THREE.RingGeometry(2.5, 2.7, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#ec4899',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(0, 0.07, 0);
    scene.add(ringMesh);

    // Các phòng khác
    createCarpet(-8, -8, 10, 9, '#ea580c', 0.25); // Phòng Douyin (Cam)
    createCarpet(0, -8, 9, 9, '#0284c7', 0.25);   // Phòng Cắt Clip (Cyan)
    createCarpet(-8, 1, 10, 9, '#3b82f6', 0.25);   // Phòng Lên Lịch (Blue)
    createCarpet(8, 8, 9, 9, '#8b5cf6', 0.3);     // Phòng A Long (Tím VIP)
    createCarpet(6, -7, 10, 8, '#059669', 0.25);  // Khu Pantry (Xanh ngọc)

    // --- 4. Tường Kính Ngăn Phòng (Low Glass Partitions) ---
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#93c5fd',
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.4
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.4
    });

    const createGlassPartition = (x, z, length, isHorizontal = true, height = 1.4) => {
      const group = new THREE.Group();
      const glassGeo = isHorizontal
        ? new THREE.BoxGeometry(length, height, 0.08)
        : new THREE.BoxGeometry(0.08, height, length);
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.y = height / 2;
      group.add(glass);

      // Khung viền trên cùng
      const topGeo = isHorizontal
        ? new THREE.BoxGeometry(length, 0.06, 0.12)
        : new THREE.BoxGeometry(0.12, 0.06, length);
      const topMesh = new THREE.Mesh(topGeo, frameMat);
      topMesh.position.y = height;
      group.add(topMesh);

      group.position.set(x, 0, z);
      scene.add(group);
    };

    // Các vách kính phân chia phòng
    createGlassPartition(-3.5, 0, 9, false); // Vách giữa Báo Cáo và Lên Lịch
    createGlassPartition(4.5, 0, 9, false);  // Vách phải Báo Cáo
    createGlassPartition(0, -4, 8, true);    // Vách trên Báo Cáo
    createGlassPartition(-8, -3.5, 10, true);
    createGlassPartition(-3.5, -8, 9, false);
    createGlassPartition(1, -8, 8, false);

    // --- 5. Bảng Neon "BÁO CÁO" phát sáng phía trước ---
    const createNeonSign = () => {
      const signGroup = new THREE.Group();

      // Khung đen bóng
      const frameGeo = new THREE.BoxGeometry(3.6, 0.8, 0.15);
      const signFrameMat = new THREE.MeshStandardMaterial({
        color: '#1e1b4b',
        roughness: 0.2,
        metalness: 0.8
      });
      const frame = new THREE.Mesh(frameGeo, signFrameMat);
      signGroup.add(frame);

      // Viền neon hồng
      const neonBorderGeo = new THREE.BoxGeometry(3.7, 0.9, 0.12);
      const neonBorderMat = new THREE.MeshBasicMaterial({
        color: '#ec4899',
        wireframe: true
      });
      const neonBorder = new THREE.Mesh(neonBorderGeo, neonBorderMat);
      signGroup.add(neonBorder);

      // Texture chữ BÁO CÁO
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 128);
      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 56px Plus Jakarta Sans, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 18;
      ctx.fillText('★ BÁO CÁO ★', 256, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const labelGeo = new THREE.PlaneGeometry(3.4, 0.7);
      const labelMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
      });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.z = 0.09;
      signGroup.add(labelMesh);

      signGroup.position.set(0, 0.8, 3.8);
      scene.add(signGroup);
    };
    createNeonSign();

    // --- 6. Props & Nội Thất Văn Phòng (Bàn, Ghế, Màn Hình, Cây Cảnh) ---
    const deskMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 });
    const deskLegMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5 });
    const screenMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' }); // Màn hình máy tính phát sáng cyan
    const monitorFrameMat = new THREE.MeshStandardMaterial({ color: '#0f172a' });

    const createDesk = (x, z, rotationY = 0) => {
      const deskGroup = new THREE.Group();

      // Mặt bàn
      const topGeo = new THREE.BoxGeometry(2.4, 0.08, 1.2);
      const top = new THREE.Mesh(topGeo, deskMat);
      top.position.y = 0.85;
      top.castShadow = true;
      top.receiveShadow = true;
      deskGroup.add(top);

      // Chân bàn
      const legGeo = new THREE.BoxGeometry(0.08, 0.85, 1.1);
      const legL = new THREE.Mesh(legGeo, deskLegMat);
      legL.position.set(-1.1, 0.425, 0);
      legL.castShadow = true;
      deskGroup.add(legL);

      const legR = new THREE.Mesh(legGeo, deskLegMat);
      legR.position.set(1.1, 0.425, 0);
      legR.castShadow = true;
      deskGroup.add(legR);

      // Màn hình vi tính
      const monBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), monitorFrameMat);
      monBase.position.set(0, 0.9, -0.3);
      deskGroup.add(monBase);

      const monPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), monitorFrameMat);
      monPole.position.set(0, 1.02, -0.3);
      deskGroup.add(monPole);

      const monFrame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.05), monitorFrameMat);
      monFrame.position.set(0, 1.25, -0.3);
      deskGroup.add(monFrame);

      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.52), screenMat);
      screen.position.set(0, 1.25, -0.27);
      deskGroup.add(screen);

      // Bàn phím & chuột mini
      const kb = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.2), monitorFrameMat);
      kb.position.set(0, 0.9, 0.1);
      deskGroup.add(kb);

      // Cốc nước cute
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.14, 12), new THREE.MeshStandardMaterial({ color: '#ec4899' }));
      cup.position.set(0.6, 0.96, 0.1);
      deskGroup.add(cup);

      deskGroup.position.set(x, 0, z);
      deskGroup.rotation.y = rotationY;
      scene.add(deskGroup);
      return deskGroup;
    };

    // Đặt bàn làm việc tại các phòng
    // Phòng Douyin
    createDesk(-9.5, -9.5);
    createDesk(-6.5, -9.5);
    createDesk(-8, -6.5);

    // Phòng Cắt Clip
    createDesk(-1.5, -9.5);
    createDesk(1.5, -9.5);
    createDesk(0, -6.5);

    // Phòng Lên Lịch
    createDesk(-9.5, -1.5);
    createDesk(-6.5, -1.5);
    createDesk(-9.5, 1.5);
    createDesk(-6.5, 1.5);

    // Phòng Báo Cáo (bàn 2 bên)
    createDesk(-1.5, 1.5);
    createDesk(1.5, 1.5);

    // Phòng A Long (Bàn Giám Đốc sang trọng to gấp rưỡi)
    const bossDeskGroup = new THREE.Group();
    const bTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.6), new THREE.MeshStandardMaterial({ color: '#312e81', roughness: 0.3 }));
    bTop.position.y = 0.9;
    bossDeskGroup.add(bTop);
    const bLegL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 1.4), deskLegMat);
    bLegL.position.set(-1.5, 0.45, 0);
    bossDeskGroup.add(bLegL);
    const bLegR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 1.4), deskLegMat);
    bLegR.position.set(1.5, 0.45, 0);
    bossDeskGroup.add(bLegR);
    // Màn hình cong VIP
    const bScreen = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.06), new THREE.MeshBasicMaterial({ color: '#a855f7' }));
    bScreen.position.set(0, 1.35, -0.4);
    bossDeskGroup.add(bScreen);
    bossDeskGroup.position.set(8, 0, 8);
    scene.add(bossDeskGroup);

    // Bàn bóng bàn ở khu giải trí
    const createPingPongTable = (x, z) => {
      const group = new THREE.Group();
      // Mặt bàn xanh lá
      const tableGeo = new THREE.BoxGeometry(3.2, 0.08, 1.8);
      const tableMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.4 });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.y = 0.85;
      group.add(table);

      // Lưới trắng
      const netGeo = new THREE.BoxGeometry(0.04, 0.25, 1.9);
      const netMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', wireframe: true });
      const net = new THREE.Mesh(netGeo, netMat);
      net.position.y = 1.0;
      group.add(net);

      // Chân kim loại
      const legMat = new THREE.MeshStandardMaterial({ color: '#0f172a' });
      const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.85, 8);
      [[-1.4, -0.7], [-1.4, 0.7], [1.4, -0.7], [1.4, 0.7]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0.425, lz);
        group.add(leg);
      });

      group.position.set(x, 0, z);
      scene.add(group);
    };
    createPingPongTable(6, -7.5);

    // Cây cảnh decor cute trong văn phòng
    const createCutePlant = (x, z) => {
      const plantGroup = new THREE.Group();
      // Chậu đất nung
      const potGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.6, 16);
      const potMat = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.7 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.y = 0.3;
      plantGroup.add(pot);

      // Tán lá xanh tròn ngộ nghĩnh (Chibi style)
      const leafMat = new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.5 });
      const bush1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45), leafMat);
      bush1.position.set(0, 0.75, 0);
      plantGroup.add(bush1);

      const bush2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32), leafMat);
      bush2.position.set(0.15, 0.95, 0.1);
      plantGroup.add(bush2);

      plantGroup.position.set(x, 0, z);
      scene.add(plantGroup);
    };

    // Đặt vài chậu cây
    createCutePlant(-12, -3);
    createCutePlant(-3.5, 4.5);
    createCutePlant(4.5, 4.5);
    createCutePlant(12, 12);
    createCutePlant(2, -4.5);

    // --- 7. TẠO CÁC NHÂN VẬT CHIBI 3D SIÊU CUTE (SHIBA, MÈO, GẤU, THỎ...) ---
    const characters = [];
    const charGroup = new THREE.Group();
    scene.add(charGroup);

    // Hàm tạo texture bảng tên 3D trên đầu (Chuẩn Retina sắc nét)
    const createNameSprite = (name, statusText, isLead = false, status = 'working') => {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');

      // Nền bo góc tối sang trọng
      ctx.fillStyle = isLead ? 'rgba(24, 24, 27, 0.94)' : 'rgba(12, 16, 23, 0.90)';
      ctx.strokeStyle = isLead ? '#f59e0b' : 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = isLead ? 5 : 3;
      ctx.beginPath();
      ctx.roundRect(14, 14, 452, 132, 34);
      ctx.fill();
      ctx.stroke();

      // Chấm tròn màu theo trạng thái
      let dotColor = '#34d399'; // working
      if (status === 'spotlight') dotColor = '#f472b6';
      else if (status === 'coffee' || status === 'chat') dotColor = '#fbbf24';
      else if (status === 'gaming' || status === 'break') dotColor = '#38bdf8';
      else if (status === 'idle') dotColor = '#94a3b8';

      // Tên nhân vật
      ctx.fillStyle = isLead ? '#fde68a' : '#ffffff';
      ctx.font = '800 44px "Plus Jakarta Sans", Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isLead ? `👑 ${name}` : name, 240, 74);

      // Chấm trạng thái + Text trạng thái phía dưới
      const shortStatus = (statusText || '').substring(0, 22);
      ctx.font = '600 28px "Plus Jakarta Sans", Arial';
      const textWidth = ctx.measureText(shortStatus).width;
      const startX = 240 - (textWidth + 28) / 2;

      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(startX + 8, 114, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isLead ? '#fcd34d' : '#cbd5e1';
      ctx.textAlign = 'left';
      ctx.fillText(shortStatus, startX + 26, 123);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 4;
      const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.65, 0.56, 1);
      return sprite;
    };

    // Hàm tạo 3D mesh nhân vật chibi ngộ nghĩnh
    const createCuteCharacter = (member, room) => {
      const group = new THREE.Group();
      group.userData = { member, room };

      // Màu sắc theo loại thú
      let bodyColor = '#fcd34d'; // Mặc định vàng shiba
      let earType = 'shiba';

      if (member.type === 'cat') { bodyColor = '#e0e7ff'; earType = 'cat'; }
      else if (member.type === 'bear') { bodyColor = '#b45309'; earType = 'bear'; }
      else if (member.type === 'panda') { bodyColor = '#f8fafc'; earType = 'panda'; }
      else if (member.type === 'fox') { bodyColor = '#f97316'; earType = 'fox'; }
      else if (member.type === 'rabbit') { bodyColor = '#fbcfe8'; earType = 'rabbit'; }
      else if (member.type === 'boss') { bodyColor = '#8b5cf6'; earType = 'boss'; }
      else if (member.type === 'koala') { bodyColor = '#94a3b8'; earType = 'koala'; }

      const skinMat = new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.35,
        metalness: 0.05
      });

      // 1. Thân tròn nhỏ Chibi
      const bodyGeo = new THREE.SphereGeometry(0.42, 24, 24);
      const body = new THREE.Mesh(bodyGeo, skinMat);
      body.position.y = 0.55;
      body.castShadow = true;
      group.add(body);

      // 2. Đầu tròn to ngộ nghĩnh
      const headGeo = new THREE.SphereGeometry(0.52, 28, 28);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 1.15;
      head.castShadow = true;
      group.add(head);

      // 3. Mắt đen to lấp lánh (Specular highlight)
      const eyeMat = new THREE.MeshBasicMaterial({ color: '#09090b' });
      const eyeGlintMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

      [-0.18, 0.18].forEach(xOff => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), eyeMat);
        eye.position.set(xOff, 1.2, 0.44);
        group.add(eye);

        const glint = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeGlintMat);
        glint.position.set(xOff + 0.02, 1.23, 0.49);
        group.add(glint);
      });

      // 4. Má hồng cute (Blush)
      const blushMat = new THREE.MeshBasicMaterial({ color: '#f43f5e', transparent: true, opacity: 0.5 });
      [-0.28, 0.28].forEach(bx => {
        const blush = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), blushMat);
        blush.position.set(bx, 1.1, 0.48);
        blush.rotation.y = bx > 0 ? 0.3 : -0.3;
        group.add(blush);
      });

      // 5. Mũi nhỏ xinh
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), eyeMat);
      nose.position.set(0, 1.12, 0.51);
      group.add(nose);

      // 6. Tai cute theo từng loại con vật
      const earMat = skinMat;
      const innerEarMat = new THREE.MeshBasicMaterial({ color: '#fda4af' });

      if (earType === 'cat' || earType === 'shiba' || earType === 'fox') {
        [-0.32, 0.32].forEach(ex => {
          const earGeo = new THREE.ConeGeometry(0.18, 0.35, 16);
          const ear = new THREE.Mesh(earGeo, earMat);
          ear.position.set(ex, 1.62, 0.05);
          ear.rotation.z = ex > 0 ? -0.35 : 0.35;
          ear.rotation.x = -0.15;
          group.add(ear);

          const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 16), innerEarMat);
          innerEar.position.set(ex, 1.6, 0.1);
          innerEar.rotation.z = ex > 0 ? -0.35 : 0.35;
          group.add(innerEar);
        });
      } else if (earType === 'rabbit') {
        // Tai thỏ dài
        [-0.2, 0.2].forEach(ex => {
          const earGeo = new THREE.CapsuleGeometry(0.1, 0.5, 8, 16);
          const ear = new THREE.Mesh(earGeo, earMat);
          ear.position.set(ex, 1.8, 0);
          ear.rotation.z = ex > 0 ? -0.2 : 0.2;
          group.add(ear);
        });
      } else if (earType === 'bear' || earType === 'panda' || earType === 'koala') {
        // Tai tròn
        const earColor = earType === 'panda' ? '#0f172a' : bodyColor;
        const roundEarMat = new THREE.MeshStandardMaterial({ color: earColor });
        [-0.36, 0.36].forEach(ex => {
          const ear = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), roundEarMat);
          ear.position.set(ex, 1.55, 0);
          group.add(ear);
        });
      } else if (earType === 'boss') {
        // Vương miện vàng hoặc Headphone phong cách sếp
        const crownGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.2, 5);
        const crownMat = new THREE.MeshStandardMaterial({ color: '#eab308', metalness: 0.8, roughness: 0.2 });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.set(0, 1.72, 0);
        group.add(crown);
      }

      // 7. Bảng tên Sprite lơ lửng trên đầu
      const sprite = createNameSprite(
        member.name,
        member.statusText,
        member.role.includes('Trưởng phòng') || member.id === 'along',
        member.status
      );
      sprite.position.set(0, 2.25, 0);
      group.add(sprite);

      // Vị trí
      group.position.set(member.pos[0], member.pos[1], member.pos[2]);

      // Xoay mặt nhân vật hướng về góc nhìn camera / hoặc bàn làm việc
      if (member.id === 'tom') {
        group.rotation.y = Math.PI / 4; // Tôm hướng ra phía trước phòng báo cáo
      } else {
        group.rotation.y = Math.random() * 0.4 - 0.2;
      }

      charGroup.add(group);
      characters.push({
        group,
        member,
        room,
        initialY: member.pos[1],
        bobOffset: Math.random() * Math.PI * 2
      });
    };

    // Tạo toàn bộ nhân vật
    rooms.forEach(room => {
      room.members.forEach(member => {
        createCuteCharacter(member, room);
      });
    });
    charactersRef.current = characters;

    // --- 8. Raycaster & Tương Tác Click / Hover ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const allObjects = [];
      characters.forEach(c => allObjects.push(c.group));

      const intersects = raycaster.intersectObjects(allObjects, true);

      if (intersects.length > 0) {
        // Tìm nhân vật cha
        let obj = intersects[0].object;
        while (obj && !obj.userData?.member) {
          obj = obj.parent;
        }

        if (obj && obj.userData?.member) {
          const selected = obj.userData.member;
          const room = obj.userData.room;
          soundManager.playChime();
          onSelectAgent(selected, room);

          // Focus camera vào nhân vật
          targetLookAt.current.set(selected.pos[0], 1, selected.pos[2]);
          targetCamPos.current.set(selected.pos[0] + 5, 6, selected.pos[2] + 6);
          setIsTouring(false);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // --- 9. Animation Loop (Breathing, Bouncing, Smooth Camera Lerp) ---
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // 1. Animation nhịp thở & nhún nhảy cute cho từng nhân vật
      characters.forEach(c => {
        const isWorking = c.member.status === 'working';
        const isSpotlight = c.member.status === 'spotlight';

        // Nhún nhảy nhẹ nhàng
        const bounceSpeed = isWorking ? 4 : 2;
        const bounceHeight = isSpotlight ? 0.08 : 0.04;
        c.group.position.y = c.initialY + Math.sin(elapsedTime * bounceSpeed + c.bobOffset) * bounceHeight;

        // Xoay nhẹ đầu/thân khi đang thuyết trình (Tôm)
        if (isSpotlight) {
          c.group.rotation.y = Math.PI / 4 + Math.sin(elapsedTime * 1.5) * 0.25;
        }
      });

      // 2. Spotlight pulse ở phòng Báo Cáo
      if (spotlightMeshRef.current) {
        const pulse = 0.4 + Math.sin(elapsedTime * 3) * 0.15;
        spotlightMeshRef.current.material.opacity = pulse;
      }

      // 3. Cinematic Tour Mode (Tự động đưa camera lướt qua các phòng)
      if (isTouring) {
        tourTimerRef.current += 0.008;
        const waypoints = [
          { cam: [16, 18, 16], look: [0, 0, 0] },     // Toàn cảnh
          { cam: [0, 6, 4], look: [0, 1, 0] },        // Phòng Báo Cáo (Tôm)
          { cam: [-5, 8, -4], look: [-8, 0, -8] },    // Phòng Douyin
          { cam: [2, 8, -4], look: [0, 0, -8] },      // Phòng Cắt Clip
          { cam: [-5, 8, 3], look: [-8, 0, 0] },      // Phòng Lên Lịch
          { cam: [9, 7, -4], look: [6, 0, -7] },      // Khu Pantry
          { cam: [12, 8, 12], look: [8, 0, 8] }       // Phòng A Long
        ];

        const idx = Math.floor(tourTimerRef.current) % waypoints.length;
        const currentWp = waypoints[idx];
        targetCamPos.current.set(currentWp.cam[0], currentWp.cam[1], currentWp.cam[2]);
        targetLookAt.current.set(currentWp.look[0], currentWp.look[1], currentWp.look[2]);
      }

      // 4. Smooth Camera LERP
      camera.position.lerp(targetCamPos.current, 0.045);
      controls.target.lerp(targetLookAt.current, 0.045);
      controls.update();

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [rooms]);

  // Xử lý khi chọn Preset Camera từ BottomBar hoặc Sidebar
  useEffect(() => {
    if (!cameraPreset) return;

    if (cameraPreset === 'all') {
      targetCamPos.current.set(16, 18, 16);
      targetLookAt.current.set(0, 0, 0);
    } else {
      const room = rooms.find(r => r.id === cameraPreset);
      if (room) {
        targetCamPos.current.set(room.cameraPos[0], room.cameraPos[1], room.cameraPos[2]);
        targetLookAt.current.set(room.target[0], room.target[1], room.target[2]);
      }
    }
  }, [cameraPreset, rooms]);

  // Tự động di chuyển Camera tới nhân vật khi chọn từ Sidebar
  useEffect(() => {
    if (selectedAgent && selectedAgent.pos) {
      targetLookAt.current.set(selectedAgent.pos[0], 1, selectedAgent.pos[2]);
      targetCamPos.current.set(selectedAgent.pos[0] + 4.5, 5.5, selectedAgent.pos[2] + 5.5);
      setIsTouring(false);
    }
  }, [selectedAgent, setIsTouring]);

  return (
    <div className="relative w-full h-full select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute inset-0 pointer-events-none scene-vignette" />
    </div>
  );
}
