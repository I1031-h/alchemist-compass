# Alchemist's Compass

**AI-Powered Task Management System**

スマートなタスク管理とAIコーチングで、行動を加速させるダッシュボードアプリケーション。

[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://alchemist-compass.vercel.app)
[![Status](https://img.shields.io/badge/status-active-success)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## 🎯 Features

### Core Features
- **AI評価**: Gemini APIによる自動タスク評価（Impact × Ease）
- **パーソナライズ**: ユーザーの価値観と行動パターンに基づく推奨
- **実行ガイド**: AIが生成するカスタム実行戦略
- **5分タイマー**: 集中して取り組むための時間管理
- **AIコーチ**: リアルタイムでの質問対応

### Dashboard Features
- **📊 Analytics Dashboard**: タスクの統計情報とグラフ表示
- **📱 Bottom Navigation**: モバイルフレンドリーなナビゲーション
- **⚙️ Settings Panel**: API Key管理、モデル選択、通知設定
- **🎨 Modern UI**: ダッシュボードスタイルのデザインシステム

## 🚀 Demo

**Live Demo**: [https://alchemist-compass.vercel.app](https://alchemist-compass.vercel.app)

## 🎨 Design System

### Visual Language
- **Color Scheme**: Pure Black (#000000) + Blue/Cyan Gradients
- **Typography**: Monospace (Cascadia Code, Courier New)
- **Components**: Rounded cards with box shadows
- **Labels**: Uppercase for system feel
- **Layout**: Dashboard-style with bottom navigation

### UI Components
```
📱 Bottom Navigation
  ├─ HOME: Task management
  ├─ ANALYTICS: Statistics & charts
  └─ SETTINGS: Configuration

🎴 Task Cards
  ├─ Gradient score badge
  ├─ Impact/Ease progress bars
  ├─ Time estimate
  └─ Action buttons

📊 Analytics
  ├─ Stats grid (4 metrics)
  ├─ Distribution chart
  └─ Recent activity feed
```

## 📦 Setup

### Required

1. **Gemini API Key**
   - Get from: https://aistudio.google.com/apikey
   - Enter in Settings panel
   - Free tier available

### Installation

```bash
# Clone repository
git clone https://github.com/I1031-h/alchemist-compass.git
cd alchemist-compass

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🎮 Usage

### Task Management
1. Select **WANT** or **SHOULD** tab
2. Click **ADD NEW TASK**
3. Enter task title
4. AI evaluates automatically
5. Tasks sorted by score

### Starting a Task
1. Click **START** on any task
2. View AI-generated guide
3. Start 5-minute timer
4. Ask AI coach during execution
5. Mark as complete/defer/drop

### Analytics
- View total tasks count
- Check want/should balance
- See average score
- Review recent activity

### Settings
- Configure Gemini API Key
- Select AI model (4 options)
- Toggle notifications
- Toggle auto-evaluate

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS (utility-first)
- **Icons**: Lucide React
- **AI**: Gemini API (Multiple Models)
- **Storage**: localStorage
- **Deployment**: Vercel

## 💰 API Cost Estimation

### Gemini 2.0 Flash Exp (Default)

```
Daily usage:
- Task evaluation: 10 × 500 tokens = 5,000 tokens
- Guide generation: 3 × 1,000 tokens = 3,000 tokens
- Chat: 20 × 300 tokens = 6,000 tokens
Total: ~14,000 tokens/day = 420,000 tokens/month

Pricing: $3.50 per 1M tokens
Monthly cost: ~$1.50
```

### Model Comparison

| Model | Speed | Quality | Cost | Use Case |
|-------|-------|---------|------|----------|
| 2.0 Flash Exp | Fastest | Good | Cheapest | Daily use |
| 2.0 Flash Thinking | Medium | Best | Medium | Important tasks |
| 1.5 Flash | Fast | Good | Low | Stable |
| 1.5 Pro | Slow | Best | High | Complex analysis |

## 📱 PWA Support

This app works as a Progressive Web App (PWA):
- Add to home screen
- Offline capability (coming soon)
- Native app experience

## 🎯 Development Status

### Phase 1: MVP ✅
- Basic UI implementation
- Task CRUD operations
- Dual-tab system (Want/Should)
- 5-minute action timer
- Chat interface

### Phase 2: AI Integration ✅
- Gemini API integration
- Real-time task evaluation
- Custom guide generation
- AI chat responses
- Fallback functionality

### Phase 3: Dashboard UI ✅ (Current)
- Bottom navigation
- Analytics dashboard
- Settings panel
- Modern card design
- Responsive layout

### Phase 4: Advanced Features (Planned)
- Statistics & reflection
- Notification system
- Notion MCP integration
- Data export/import

## 🔐 Environment Variables

Create `.env.local`:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

## 📖 Tips & Best Practices

### Task Management
```
✓ Keep task titles concise
✓ Use WANT for intrinsic motivation
✓ Use SHOULD for obligations
✓ Review analytics weekly
```

### Model Selection
```
Daily tasks → 2.0 Flash Exp (fast, cheap)
Important decisions → 2.0 Flash Thinking (best quality)
Cost-sensitive → 1.5 Flash (balanced)
Complex analysis → 1.5 Pro (highest quality)
```

### Timer Usage
```
✓ Use chat for quick questions
✓ Pause if you need a break
✓ Complete early if finished
✓ Defer if task needs rethinking
```

## 🤝 Related Projects

- [Decision Flow](https://github.com/I1031-h/decision-flow) - 2-hour MVP success pattern
- [Notion MCP](https://github.com/anthropics/anthropic-quickstarts) - Context integration (planned)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 👤 Author

**[@I1031-h](https://github.com/I1031-h)**

Built with 🔥 using:
- Claude Sonnet 4.5
- MCP (Model Context Protocol)
- Gemini 2.0 Flash

---

**Deployed on Vercel** • [alchemist-compass.vercel.app](https://alchemist-compass.vercel.app)

*"時間とエネルギーを「行動」に直結させる"*
