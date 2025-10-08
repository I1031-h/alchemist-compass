# Alchemist's Compass

**AI-Powered Personalized Task Management System**

スマートなタスク管理とAIコーチング、そして**あなた専用のパーソナライゼーション**で行動を加速させるダッシュボードアプリケーション。

[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://alchemist-compass.vercel.app)
[![Status](https://img.shields.io/badge/status-active-success)]()
[![Version](https://img.shields.io/badge/version-1.1.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## 🎯 Core Features

### AI-Powered Task Management
- **AI評価**: Gemini APIによる自動タスク評価（Impact × Ease）
- **パーソナライズ推奨**: ユーザーの価値観と行動パターンに基づく推奨
- **実行ガイド**: AIが生成するカスタム実行戦略
- **5分タイマー**: 集中して取り組むための時間管理
- **AIコーチ**: リアルタイムでの質問対応

### 🆕 Personalization Features (v1.1)
- **カスタムインストラクション**: AIの振る舞いをカスタマイズ
- **ユーザープロフィール**: 名前、背景、目標を設定
- **ファイルアップロード**: .md/.txtファイルで詳細なコンテキストを提供
- **コンテキスト連携**: アップロードしたファイルがAI評価・ガイド・チャットに反映

### Dashboard Features
- **📊 Analytics Dashboard**: タスクの統計情報とグラフ表示
- **📱 Bottom Navigation**: モバイルフレンドリーなナビゲーション
- **⚙️ Settings Panel**: 統合された設定パネル
- **🎨 4 Theme Options**: 気分やワークスタイルに合わせたテーマ選択

## 🚀 Demo

**Live Demo**: [https://alchemist-compass.vercel.app](https://alchemist-compass.vercel.app)

## 🎨 Design Themes

### 1. Dashboard (Default)
モダンなブルー/シアン系デザイン
- 明るく爽やかな印象
- 高い視認性
- ビジネス・生産性向け

### 2. Ember 🆕
**ダークグレー + ピンク/レッドアクセント**
- くすみのある黒基調
- 赤寄りのピンクで洗練された印象
- クリエイティブワーク向け

### 3. Neon
鮮やかなパープル/ピンクのネオンスタイル
- 未来的でエネルギッシュ
- 夜間作業に最適
- クリエイティブプロジェクト向け

### 4. Forest
落ち着いたグリーン/エメラルド系
- 自然で穏やかな印象
- 集中作業向け
- 長時間作業でも目に優しい

**テーマ切り替え**: Settings → Appearance → Theme

## 📦 Setup

### Required

1. **Gemini API Key**
   - Get from: https://aistudio.google.com/apikey
   - Enter in Settings → AI Configuration
   - Free tier available (〜$1.50/month for daily use)

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

## 🎮 Usage Guide

### 1. Initial Setup

#### Settings → AI Configuration
```
1. Add Gemini API Key
2. Select AI Model (推奨: Gemini 2.0 Flash Exp)
3. Toggle notifications (optional)
4. Toggle auto-evaluate (optional)
```

#### Settings → Personalization 🆕
```
1. Enter your name (optional)
2. Add user context:
   - Your role/profession
   - Your goals
   - Your work style
   
3. Custom instructions:
   - "Be concise and action-focused"
   - "Challenge my perfectionism"
   - "Use MVP approach"
   
4. Upload context files:
   - パーソナライズ用.md
   - Project notes
   - Personal guidelines
```

#### Settings → Appearance
```
Select your preferred theme:
- Dashboard (blue/cyan)
- Ember (gray/pink) 🆕
- Neon (purple/pink)
- Forest (green/emerald)
```

### 2. Task Management

#### Adding Tasks
```
1. Select WANT or SHOULD tab
2. Click "ADD NEW TASK"
3. Enter task title
4. AI evaluates automatically
5. Tasks sorted by score
```

#### Starting Tasks
```
1. Click on any task card
2. Review AI-generated guide
3. Start 5-minute timer
4. Ask AI coach during execution
5. Mark complete/defer/drop
```

### 3. Personalization Examples

#### Example 1: Developer
```yaml
Name: John
Context: Full-stack developer, working on side projects
Instructions: Focus on MVP, shipping fast, avoid perfectionism
Files: personal-coding-principles.md
```

#### Example 2: Content Creator
```yaml
Name: Sarah
Context: Content creator, making videos and writing
Instructions: Help with ideation, prioritize audience value
Files: content-strategy.md, brand-guidelines.md
```

#### Example 3: Student
```yaml
Name: Alex
Context: CS student, learning web development
Instructions: Explain concepts simply, suggest resources
Files: study-notes.md, project-ideas.md
```

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Inline styles with dynamic theming
- **Icons**: Lucide React
- **AI**: Gemini 2.0 Flash API
- **Storage**: localStorage
- **Deployment**: Vercel

## 💰 API Cost Estimation

### Gemini 2.0 Flash Exp (Default)

```
Daily usage with personalization:
- Task evaluation: 10 × 700 tokens = 7,000 tokens
- Guide generation: 3 × 1,200 tokens = 3,600 tokens
- Chat: 20 × 400 tokens = 8,000 tokens
Total: ~18,600 tokens/day = 558,000 tokens/month

Pricing: $3.50 per 1M tokens
Monthly cost: ~$1.95
```

### Model Comparison

| Model | Speed | Quality | Cost | Use Case |
|-------|-------|---------|------|----------|
| 2.0 Flash Exp | Fastest | Good | Cheapest | Daily use |
| 2.0 Flash Thinking | Medium | Best | Medium | Important tasks |
| 1.5 Flash | Fast | Good | Low | Stable |
| 1.5 Pro | Slow | Best | High | Complex analysis |

## 📱 Features Breakdown

### Home Page
```
✓ WANT/SHOULD tab system
✓ Task cards with metrics
✓ Score-based sorting
✓ Quick actions (Start/Delete)
✓ AI guide generation
✓ 5-minute timer
✓ Real-time AI chat
```

### Analytics Page
```
✓ Total tasks count
✓ WANT/SHOULD breakdown
✓ Average score metric
✓ Weekly distribution chart
✓ Recent activity feed
```

### Settings Page
```
✓ AI Configuration
  - API Key management
  - Model selection
  - Feature toggles
  
✓ Personalization 🆕
  - User profile
  - Custom instructions
  - File uploads
  
✓ Appearance
  - Theme switcher
  - 4 design options
```

## 🎯 Development Status

### Phase 1: MVP ✅
- Basic UI implementation
- Task CRUD operations
- Timer & chat interface

### Phase 2: AI Integration ✅
- Gemini API connection
- Task evaluation
- Guide generation
- Chat responses

### Phase 3: Dashboard UI ✅
- Bottom navigation
- Analytics dashboard
- Settings panel
- Modern card design

### Phase 4: Personalization ✅ (Current - v1.1)
- Custom instructions
- User profile
- File upload support
- 4 theme options
- Context-aware AI

### Phase 5: Advanced Features (Planned)
- Push notifications
- Notion MCP integration
- Data export/import
- Advanced analytics
- Task templates

## 📖 Best Practices

### For Developers
```
Context: "Full-stack developer, focus on shipping MVPs"
Instructions: "Be concise, suggest minimal viable solutions"
Files: coding-standards.md, project-templates.md
Theme: Dashboard or Neon
```

### For Creators
```
Context: "Content creator, video production workflow"
Instructions: "Help prioritize audience value, suggest content ideas"
Files: content-strategy.md, audience-insights.md
Theme: Ember or Forest
```

### For Students
```
Context: "Computer science student, learning programming"
Instructions: "Explain concepts simply, break down complex tasks"
Files: study-notes.md, learning-roadmap.md
Theme: Forest or Dashboard
```

## 🔐 Privacy & Data

- **Local Storage**: All data stored in browser localStorage
- **No Server**: No data sent to external servers except Gemini API
- **API Key**: Stored locally, never transmitted except to Google
- **Files**: Uploaded files stored locally only

## 🤝 Related Projects

- [Decision Flow](https://github.com/I1031-h/decision-flow) - 2-hour MVP success pattern

## 🆕 What's New in v1.1

### Personalization System
```
✓ Custom instructions textarea
✓ User profile configuration
✓ Markdown/text file upload
✓ Context-aware AI responses
✓ File management UI
```

### New Theme: Ember
```
✓ Dark gray base (#0f0f0f)
✓ Pink/red accents (#ec4899)
✓ Sophisticated muted aesthetic
✓ Perfect for creative work
```

### Theme System Improvements
```
✓ 4 complete themes
✓ Real-time theme switching
✓ Consistent design language
✓ Enhanced shadows & gradients
```

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

## 💬 Feedback & Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing discussions
- Review documentation

---

**Version**: 1.1.0  
**Last Updated**: 2025-10-07  
**Status**: Active Development
