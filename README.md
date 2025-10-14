# Alchemist's Compass

**AI-Powered Personalized Task Management System**

スマートなタスク管理とAIコーチング、そして**あなた専用のパーソナライゼーション**で行動を加速させるダッシュボードアプリケーション。

[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://alchemist-compass.vercel.app)
[![Status](https://img.shields.io/badge/status-active-success)]()
[![Version](https://img.shields.io/badge/version-1.2.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## 🎯 Core Features

### AI-Powered Task Management
- **AI評価**: Gemini APIによる自動タスク評価（Impact × Ease）
- **パーソナライズ推奨**: ユーザーの価値観と行動パターンに基づく推奨
- **実行ガイド**: AIが生成するカスタム実行戦略
- **🆕 カスタムタイマー**: 5/10/15/25/30分から選択可能
- **AIコーチ**: リアルタイムでの質問対応

### 🆕 v1.2 New Features

#### 1. Bulk Task Input
- **一括タスク追加**: NotionやObsidianからコピペで複数タスクを追加
- **AI自動分類**: Want/Shouldを自動判定
- **自動評価**: 最大20タスクを一度に評価
- **時短**: 複数タスクを手動で入力する手間を削減

#### 2. Customizable Timer
- **5段階選択**: 5/10/15/25/30分から選択
- **Pomodoro対応**: 25分設定でポモドーロテクニックに対応
- **柔軟性**: タスクの性質に合わせた時間設定

#### 3. Action Log
- **完了履歴**: 完了したタスクを時系列で記録
- **振り返り機能**: 過去の行動パターンを可視化
- **学習データ**: 実行時間や達成状況を保存
- **専用タブ**: 独立したLOGSタブで管理

#### 4. Sticky Notes
- **行動前メモ**: タスク開始前の意図・目標を記録
- **行動後メモ**: 完了後の学び・気づきを記録
- **振り返り支援**: 行動ログに両方のメモが保存
- **継続的改善**: 過去の学びを次のアクションに活かす

### Personalization Features (v1.1)
- **カスタムインストラクション**: AIの振る舞いをカスタマイズ
- **ユーザープロフィール**: 名前、背景、目標を設定
- **ファイルアップロード**: .md/.txtファイルで詳細なコンテキストを提供
- **コンテキスト連携**: アップロードしたファイルがAI評価・ガイド・チャットに反映

### Dashboard Features
- **📊 Analytics Dashboard**: タスクの統計情報とグラフ表示
- **📖 Action Log Tab**: 完了タスクの履歴管理 🆕
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

### 2. Ember
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
   - Free tier available (〜$2/month for daily use)

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

#### Settings → Personalization
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
- Ember (gray/pink)
- Neon (purple/pink)
- Forest (green/emerald)
```

### 2. Task Management

#### Adding Single Task
```
1. Select WANT or SHOULD tab
2. Click "ADD TASK"
3. Enter task title
4. AI evaluates automatically
5. Tasks sorted by score
```

#### Bulk Task Input 🆕
```
1. Click "BULK ADD" button
2. Paste tasks (one per line):
   新しいロゴを作成
   ブログ記事を書く
   データベースを整理
   ...
3. AI automatically:
   - Classifies as Want/Should
   - Evaluates Impact × Ease
   - Estimates time
4. All tasks added instantly
```

#### Starting Tasks
```
1. Click on any task card
2. Add pre-action note (optional) 🆕
   - Your intention
   - Core beliefs
   - Goals for this task
3. Review AI-generated guide
4. Select timer duration (5/10/15/25/30min) 🆕
5. Start timer
6. Ask AI coach during execution
7. Add post-action note (optional) 🆕
   - What you learned
   - Improvements for next time
8. Mark complete/defer/drop
```

### 3. Action Log Review 🆕

```
1. Navigate to LOGS tab
2. See completed tasks with:
   - Completion timestamp
   - Actual duration
   - Impact/Ease scores
   - Pre-action notes
   - Post-action notes
3. Use for:
   - Weekly review
   - Pattern recognition
   - Continuous improvement
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
Daily usage with bulk add & personalization:
- Task evaluation: 10 × 700 tokens = 7,000 tokens
- Bulk add: 2 × 1,500 tokens = 3,000 tokens 🆕
- Guide generation: 3 × 1,200 tokens = 3,600 tokens
- Chat: 20 × 400 tokens = 8,000 tokens
Total: ~21,600 tokens/day = 648,000 tokens/month

Pricing: $3.50 per 1M tokens
Monthly cost: ~$2.27
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
✓ Single task add
✓ Bulk task add 🆕
✓ AI guide generation
✓ Pre-action sticky note 🆕
✓ Customizable timer (5-30min) 🆕
✓ Real-time AI chat
✓ Post-action sticky note 🆕
```

### Action Log Page 🆕
```
✓ Completed tasks list
✓ Timestamp tracking
✓ Actual duration vs estimate
✓ Impact/Ease review
✓ Pre-action notes display
✓ Post-action notes display
✓ Weekly insights
```

### Analytics Page
```
✓ Total tasks count
✓ Completed tasks count 🆕
✓ WANT/SHOULD breakdown
✓ Average score metric
✓ Recent activity chart
```

### Settings Page
```
✓ AI Configuration
  - API Key management
  - Model selection
  - Feature toggles
  
✓ Personalization
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

### Phase 4: Personalization ✅ (v1.1)
- Custom instructions
- User profile
- File upload support
- 4 theme options
- Context-aware AI

### Phase 5: Action Management ✅ (Current - v1.2)
- Bulk task input
- Customizable timer
- Action log tracking
- Sticky notes system
- Enhanced analytics

### Phase 6: Advanced Features (Planned)
- Push notifications
- Notion MCP integration
- Data export/import
- Advanced analytics
- Task templates
- Calendar sync

## 📖 Use Cases & Examples

### Use Case 1: Notion Migration
```
Problem: 50 tasks in Notion need to be added
Solution:
1. Copy all tasks from Notion
2. Click "BULK ADD"
3. Paste & let AI classify
4. Done in 10 seconds
```

### Use Case 2: Pomodoro Workflow
```
Setup:
1. Add focused work tasks
2. Select 25min timer
3. Start task with pre-action note
4. Work in focused sprints
5. Log learnings after completion
```

### Use Case 3: Weekly Review
```
Process:
1. Navigate to LOGS tab
2. Review completed tasks
3. Read pre/post-action notes
4. Identify patterns
5. Plan improvements for next week
```

## 🔐 Privacy & Data

- **Local Storage**: All data stored in browser localStorage
- **No Server**: No data sent to external servers except Gemini API
- **API Key**: Stored locally, never transmitted except to Google
- **Files**: Uploaded files stored locally only
- **Action Logs**: Stored locally, never leave your device

## 🤝 Related Projects

- [Decision Flow](https://github.com/I1031-h/decision-flow) - 2-hour MVP success pattern

## 🆕 What's New in v1.2

### 🎯 Bulk Task Management
```
✓ One-click paste from Notion/Obsidian
✓ AI auto-classification (Want/Should)
✓ Batch evaluation (up to 20 tasks)
✓ Instant import workflow
```

### ⏱️ Timer Customization
```
✓ 5 duration options
✓ Pomodoro-compatible (25min)
✓ Flexible for different tasks
✓ Better time management
```

### 📖 Action Log System
```
✓ Completion history tracking
✓ Dedicated LOGS tab
✓ Visual timeline
✓ Performance insights
```

### 📝 Sticky Notes
```
✓ Pre-action intention tracking
✓ Post-action learning capture
✓ Integrated with action log
✓ Continuous improvement support
```

## 📊 Workflow Improvements (v1.2)

### Before v1.2
```
1. Add task manually (one by one)
2. Fixed 5-minute timer
3. No completion history
4. No learning capture
```

### After v1.2
```
1. Bulk add from Notion/Obsidian ⚡
2. Choose optimal timer duration ⏱️
3. Review action log anytime 📖
4. Capture & learn from every task 📝
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

*「時間とエネルギーを「行動」に直結させる」*

## 💬 Feedback & Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing discussions
- Review documentation

---

**Version**: 1.2.0  
**Last Updated**: 2025-10-14  
**Status**: Active Development
