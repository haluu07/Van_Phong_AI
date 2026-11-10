// Quản lý và Quét toàn bộ Dự Án (Projects) trong Antigravity cho Sếp A Long
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const ROOT_SEARCH_DIR = '/home/antigravity';

class ProjectManager {
  constructor() {
    this.projects = [];
    this.currentProjectId = 'haluu07_van_phong_ai';
    this.broadcastFn = null;
    this.init();
  }

  setBroadcastFn(fn) {
    this.broadcastFn = fn;
  }

  init() {
    try {
      if (fs.existsSync(PROJECTS_FILE)) {
        const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.projects && Array.isArray(parsed.projects)) {
          this.projects = parsed.projects;
          this.currentProjectId = parsed.currentProjectId || this.projects[0]?.id;
          console.log(`[ProjectManager] Đã tải ${this.projects.length} dự án từ projects.json`);
          return;
        }
      }
    } catch (err) {
      console.warn('[ProjectManager] Chưa có projects.json, đang quét tự động...', err.message);
    }

    // Tự động quét ban đầu
    this.scan();
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = {
        updatedAt: new Date().toISOString(),
        currentProjectId: this.currentProjectId,
        projects: this.projects
      };
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ProjectManager] Lỗi lưu projects.json:', err.message);
    }
  }

  // Quét toàn bộ thư mục tìm các Repository / Project
  async scan() {
    console.log('[ProjectManager] Đang quét toàn bộ dự án trên Antigravity...');
    const foundDirs = new Set();

    // 1. Luôn thêm project hiện tại
    const currentWorkspace = path.resolve(__dirname, '..');
    foundDirs.add(currentWorkspace);

    // 2. Quét đệ quy tìm thư mục chứa .git hoặc package.json
    try {
      const searchDirs = [ROOT_SEARCH_DIR, path.join(ROOT_SEARCH_DIR, 'haluu07')];
      for (const base of searchDirs) {
        if (!fs.existsSync(base)) continue;
        const entries = fs.readdirSync(base, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            const subPath = path.join(base, entry.name);
            if (fs.existsSync(path.join(subPath, '.git')) || fs.existsSync(path.join(subPath, 'package.json'))) {
              foundDirs.add(subPath);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[ProjectManager] Lỗi quét thư mục:', err.message);
    }

    // 3. Phân tích chi tiết từng dự án tìm được
    const newProjects = [];
    for (const dir of foundDirs) {
      const projInfo = await this.analyzeProject(dir);
      if (projInfo) {
        newProjects.push(projInfo);
      }
    }

    this.projects = newProjects;
    if (!this.projects.some(p => p.id === this.currentProjectId) && this.projects.length > 0) {
      this.currentProjectId = this.projects[0].id;
    }

    this.save();
    if (this.broadcastFn) {
      this.broadcastFn('PROJECTS_UPDATED', {
        currentProjectId: this.currentProjectId,
        projects: this.projects
      });
    }

    return this.projects;
  }

  // Phân tích chi tiết 1 thư mục dự án
  async analyzeProject(dirPath) {
    try {
      const folderName = path.basename(dirPath);
      const isGit = fs.existsSync(path.join(dirPath, '.git'));
      let branch = 'main';
      let gitRemote = '';
      let commits = [];
      let status = 'Clean';

      if (isGit) {
        try {
          const { stdout: bOut } = await execAsync('git branch --show-current', { cwd: dirPath });
          branch = bOut.trim() || 'main';
        } catch {}

        try {
          const { stdout: rOut } = await execAsync('git remote get-url origin', { cwd: dirPath });
          gitRemote = rOut.trim();
        } catch {}

        try {
          const { stdout: cOut } = await execAsync('git log -n 5 --pretty=format:"%h|%s|%an|%ar"', { cwd: dirPath });
          commits = cOut.trim().split('\n').filter(Boolean).map(line => {
            const [hash, msg, author, time] = line.split('|');
            return { hash, message: msg, author, time };
          });
        } catch {}

        try {
          const { stdout: sOut } = await execAsync('git status --short', { cwd: dirPath });
          const changes = sOut.trim().split('\n').filter(Boolean).length;
          status = changes > 0 ? `${changes} file thay đổi` : 'Clean (Đã đồng bộ)';
        } catch {}
      }

      // Phát hiện Tech Stack
      const techStack = [];
      const pkgPath = path.join(dirPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
          if (allDeps['react']) techStack.push('React');
          if (allDeps['three']) techStack.push('Three.js');
          if (allDeps['vite']) techStack.push('Vite');
          if (allDeps['next']) techStack.push('Next.js');
          if (allDeps['express']) techStack.push('Express');
          if (allDeps['tailwindcss']) techStack.push('Tailwind');
          if (allDeps['vue']) techStack.push('Vue');
          if (techStack.length === 0) techStack.push('Node.js');
        } catch {}
      }
      if (fs.existsSync(path.join(dirPath, 'requirements.txt')) || fs.existsSync(path.join(dirPath, 'pyproject.toml'))) {
        techStack.push('Python');
      }

      // Đếm số tệp tin
      let keyFiles = [];
      try {
        const topFiles = fs.readdirSync(dirPath);
        keyFiles = topFiles.filter(f => !f.startsWith('.') && f !== 'node_modules' && f !== 'dist');
      } catch {}

      const id = folderName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

      return {
        id,
        name: folderName,
        path: dirPath,
        isGit,
        branch,
        gitRemote,
        commits,
        status,
        techStack: techStack.length > 0 ? techStack : ['Codebase'],
        keyFiles: keyFiles.slice(0, 10),
        updatedAt: new Date().toISOString()
      };
    } catch (err) {
      console.warn(`[ProjectManager] Không thể phân tích ${dirPath}:`, err.message);
      return null;
    }
  }

  getAllProjects() {
    return this.projects;
  }

  getCurrentProject() {
    return this.projects.find(p => p.id === this.currentProjectId) || this.projects[0] || null;
  }

  // Chọn dự án làm việc
  selectProject(projectId) {
    const found = this.projects.find(p => p.id === projectId);
    if (!found) return null;

    this.currentProjectId = projectId;
    this.save();

    console.log(`[ProjectManager] Sếp A Long đã chuyển sang dự án: "${found.name}" (${found.path})`);

    if (this.broadcastFn) {
      this.broadcastFn('PROJECT_SWITCHED', {
        currentProject: found,
        currentProjectId: this.currentProjectId
      });
    }

    return found;
  }

  // Thêm một thư mục dự án bất kỳ (hỗ trợ A Long gõ đường dẫn tùy ý trên máy)
  async addCustomProject(folderPath, customName = null) {
    const resolvedPath = path.resolve(folderPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Đường dẫn thư mục không tồn tại: ${resolvedPath}`);
    }

    const analyzed = await this.analyzeProject(resolvedPath);
    if (!analyzed) {
      throw new Error(`Không thể phân tích thư mục: ${resolvedPath}`);
    }

    if (customName) {
      analyzed.name = customName;
    }

    // Kiểm tra xem đã tồn tại chưa
    const existingIdx = this.projects.findIndex(p => p.path === resolvedPath);
    if (existingIdx !== -1) {
      this.projects[existingIdx] = analyzed;
    } else {
      this.projects.push(analyzed);
    }

    this.currentProjectId = analyzed.id;
    this.save();

    if (this.broadcastFn) {
      this.broadcastFn('PROJECTS_UPDATED', {
        currentProjectId: this.currentProjectId,
        projects: this.projects
      });
      this.broadcastFn('PROJECT_SWITCHED', {
        currentProject: analyzed,
        currentProjectId: this.currentProjectId
      });
    }

    return analyzed;
  }
}

export const projectManager = new ProjectManager();
