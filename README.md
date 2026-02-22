# Alan的疯狂8点 (Alan's Crazy Eights)

一个基于 React + Vite + Tailwind CSS 开发的经典扑克牌游戏《疯狂8点》。

## 特色功能
- **智能 AI**: 具备基础策略的 AI 对手。
- **响应式设计**: 完美适配手机、平板和电脑。
- **流畅动画**: 使用 `motion` 实现丝滑的卡片交互。
- **经典规则**: 包含“万能 8 点”变色规则及自动跳过逻辑。

## 本地开发

1. 安装依赖:
   ```bash
   npm install
   ```

2. 启动开发服务器:
   ```bash
   npm run dev
   ```

## 部署到 Vercel

本项目已配置好 Vercel 部署环境。

### 步骤 1: 推送到 GitHub
1. 在 GitHub 上创建一个新的仓库。
2. 在本地终端运行:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <你的仓库URL>
   git push -u origin main
   ```

### 步骤 2: 在 Vercel 上导入
1. 登录 [Vercel](https://vercel.com)。
2. 点击 **"Add New"** -> **"Project"**。
3. 导入你刚刚创建的 GitHub 仓库。
4. Vercel 会自动识别 Vite 项目。
5. (可选) 如果你使用了 Gemini API，请在 **Environment Variables** 中添加 `GEMINI_API_KEY`。
6. 点击 **"Deploy"**。

## 技术栈
- **前端**: React 19
- **样式**: Tailwind CSS 4
- **动画**: Motion
- **图标**: Lucide React
- **构建工具**: Vite 6
