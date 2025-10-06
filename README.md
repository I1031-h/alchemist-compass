# Alchemist's Compass

**AI-Powered Action Recommendation System**

完璧主義と分析麻痺を打ち破る、パーソナライズされた行動支援システム。

## ✨ Features

- **デュアルタブシステム**: Want（やりたいこと）/ Should（やるべきこと）を分離
- **AI評価**: Gemini APIでタスクをImpact × Easeで自動スコアリング
- **AIガイド生成**: あなた専用の実行ガイドを自動生成
- **5分タイマー**: 考えすぎを防ぐ時間制限付き実行モード
- **AIコーチング**: 実行中のリアルタイムQ&Aサポート
- **モダンUI**: Linear/Vercel風の洗練されたデザイン

## 🚀 Quick Start

### 1. インストール

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

### 2. Gemini API設定（推奨）

1. [Google AI Studio](https://aistudio.google.com/apikey) でAPI Keyを取得
2. アプリ右上の⚙️設定アイコンをクリック
3. API Keyを入力して保存

**API Key設定前**: Mock評価で動作（機能制限あり）  
**API Key設定後**: 本格的なAI評価とガイド生成が有効に

## 📦 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Gemini 2.0 Flash Exp API
- **Storage**: localStorage

## 🎯 Development Status

### Phase 1: MVP ✅
- 基本UI実装
- タスク管理（CRUD）
- デュアルタブシステム
- 5分アクションタイマー
- チャットインターフェース

### Phase 2: AI Integration ✅
- Gemini API統合
- リアルタイムタスク評価
- カスタムガイド生成
- AIチャット応答
- フォールバック機能

### Phase 3: Advanced Features (Planned)
- 統計・振り返り機能
- 通知システム
- Notion MCP連携
- データエクスポート

## 📱 PWA Support

このアプリはPWAとして動作し、ホーム画面に追加できます。

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Environment Variables

`.env.example`をコピーして`.env.local`を作成：

```bash
cp .env.example .env.local
```

必要な変数：
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 💰 API Cost Estimation

Gemini 2.0 Flash Exp使用時：

```
1日の使用例:
- タスク評価: 10回 × 500 tokens = 5,000 tokens
- ガイド生成: 3回 × 1,000 tokens = 3,000 tokens
- チャット: 20回 × 300 tokens = 6,000 tokens
合計: 約14,000 tokens/日 = 420,000 tokens/月

料金: $3.50 per 1M tokens
月額コスト: 約$1.50
```

## 🎨 Design Philosophy

**"Beautiful Systems"を体現：**
- モノスペースフォント（技術者の美学）
- グリッド背景（構造の可視化）
- シアン→バイオレットグラデーション
- ガラスモーフィズム
- 情報密度重視

**参考:** Linear, Vercel Dashboard, GitHub Copilot

## 🤝 Related Projects

- [Decision Flow](https://github.com/I1031-h/decision-flow) - 2時間で作ったMVP（成功パターン）

## 📄 License

MIT

---

**Built with 🔥 by [I1031-h](https://github.com/I1031-h)**

**Deployed:** [alchemist-compass.vercel.app](https://alchemist-compass.vercel.app)