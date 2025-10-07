# Alchemist's Compass

**AI-Powered Action Recommendation System**

完璧主義と分析麻痺を打ち破る、パーソナライズされた行動支援システム。

## ✨ Features

- **デュアルタブシステム**: Want（やりたいこと）/ Should（やるべきこと）を分離
- **AI評価**: Gemini APIでタスクをImpact × Easeで自動スコアリング
- **AIモデル選択**: 4つのGeminiモデルから選択可能
- **UIテーマ切替**: 3つのデザインパターン（Linear/Systematic/Minimal）
- **AIガイド生成**: あなた専用の実行ガイドを自動生成
- **5分タイマー**: 考えすぎを防ぐ時間制限付き実行モード
- **AIコーチング**: 実行中のリアルタイムQ&Aサポート
- **タスク管理**: リストから直接削除可能

## 🚀 Quick Start

### 1. インストール

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

### 2. 設定（右上⚙️アイコンから）

**Gemini API設定**
1. [Google AI Studio](https://aistudio.google.com/apikey) でAPI Keyを取得
2. API Keyを入力して保存

**AIモデル選択**
- `Gemini 2.0 Flash Exp`: 最速・低コスト（デフォルト）
- `Gemini 2.0 Flash Thinking`: 思考プロセス付き・高精度
- `Gemini 1.5 Flash`: バランス型・安定版
- `Gemini 1.5 Pro`: 最高品質・複雑なタスク向け

**UIテーマ選択**
- `Linear`: モダン・洗練系（現在のデフォルト）
- `Systematic`: システマティック・開発ツール系
- `Minimal`: ミニマル・機能重視

## 📦 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + CSS Variables
- **Icons**: Lucide React
- **AI**: Gemini API (Multiple Models)
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

### Phase 2.5: Customization ✅ (New!)
- **UIテーマシステム**: 3つのデザインパターン
- **AIモデル選択**: 4つのGeminiモデル対応
- **タスク削除機能**: 完了前でも削除可能

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

### Gemini 2.0 Flash Exp（デフォルト）

```
1日の使用例:
- タスク評価: 10回 × 500 tokens = 5,000 tokens
- ガイド生成: 3回 × 1,000 tokens = 3,000 tokens
- チャット: 20回 × 300 tokens = 6,000 tokens
合計: 約14,000 tokens/日 = 420,000 tokens/月

料金: $3.50 per 1M tokens
月額コスト: 約$1.50
```

### モデル比較

| モデル | 速度 | 品質 | コスト | 推奨用途 |
|--------|------|------|--------|----------|
| 2.0 Flash Exp | 最速 | 良い | 最安 | 日常使用 |
| 2.0 Flash Thinking | 中速 | 最高 | 中 | 重要タスク |
| 1.5 Flash | 速い | 良い | 安 | 安定重視 |
| 1.5 Pro | 遅い | 最高 | 高 | 複雑な分析 |

## 🎨 Design Philosophy

### テーマシステム

**Linear（デフォルト）**
- モダン・洗練系
- シアン→バイオレットグラデーション
- Vercel/Linear風

**Systematic**
- プロフェッショナル・開発ツール系
- ダークブルー + コーラル
- 情報密度高

**Minimal**
- ミニマル・機能重視
- シアン + ホワイト
- 余白多め

## 🎯 使い方のコツ

### タスク追加
```
1. 「やりたいこと」または「やるべきこと」タブを選択
2. タスクを入力
3. AI評価を待つ（2-3秒）
4. 自動的にスコア順にソート
```

### タスク削除
```
- リスト上でタスクにホバー
- ゴミ箱アイコンが表示
- クリックで削除確認
```

### モデル変更
```
設定 → AIモデル → 選択
- タイマー時のチャット品質を高めたい → 2.0 Flash Thinking
- コストを抑えたい → 2.0 Flash Exp（デフォルト）
```

### テーマ変更
```
設定 → UIテーマ → 選択
- リアルタイムで反映
- 選択内容は自動保存
```

## 🤝 Related Projects

- [Decision Flow](https://github.com/I1031-h/decision-flow) - 2時間で作ったMVP（成功パターン）

## 📄 License

MIT

---

**Built with 🔥 by [I1031-h](https://github.com/I1031-h)**

**Deployed:** [alchemist-compass.vercel.app](https://alchemist-compass.vercel.app)