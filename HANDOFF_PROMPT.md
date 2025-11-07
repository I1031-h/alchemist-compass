# Alchemist Compass - 引継ぎ用プロンプト

## 🚀 クイックスタート

```
@temp-alchemist-compass のプロジェクトを引き継ぎます。@PROGRESS.md を確認して、現在の状況を把握してください。
その後、未完了のタスクを優先順位に従って進めてください。
```

---

## 📋 プロジェクト概要

**Alchemist Compass** - AI-Powered Personalized Task Management System

- **リポジトリ**: https://github.com/I1031-h/alchemist-compass
- **デプロイ**: https://alchemist-compass.vercel.app
- **技術スタック**: React 18 + Vite + Gemini API

---

## 🔍 現在の状況確認コマンド

```bash
# 現在のブランチ確認
git branch

# オープンなPR確認
# GitHubで確認: https://github.com/I1031-h/alchemist-compass/pulls

# 最新のコミット確認
git log --oneline -5
```

---

## 📝 作業フロー

### 1. 状況確認
```
@PROGRESS.md を読んで、現在の状況を把握してください。
- 完了したタスク
- 進行中のタスク
- 未解決の問題
- 次のステップ
```

### 2. ブランチ作成
```bash
# mainブランチから最新を取得
git checkout main
git pull origin main

# 新しいブランチを作成
git checkout -b fix/your-feature-name
```

### 3. 作業とコミット
```bash
# 変更をコミット
git add -A
git commit -m "fix: your commit message"

# プッシュ
git push -u origin fix/your-feature-name
```

### 4. プルリクエスト作成
- GitHubでPRを作成
- 説明に変更内容を記載
- mainブランチにマージ

---

## 🎯 よくあるタスク

### バグ修正
1. `PROGRESS.md`で問題を確認
2. 再現手順を確認
3. 修正を実装
4. テスト
5. PR作成

### 新機能追加
1. `アルケミ修正案.md`で要件確認
2. 設計を検討
3. 実装
4. テスト
5. PR作成

---

## ⚠️ 重要な注意事項

1. **ブランチ管理**
   - mainブランチから新しいブランチを派生
   - 作業ブランチを明示する

2. **コミットメッセージ**
   - 形式: `fix:`, `feat:`, `refactor:` など
   - 簡潔で明確に

3. **プルリクエスト**
   - 必ずPRを作成してからマージ
   - 説明を充実させる

---

## 🔧 開発環境

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

---

## 📚 参考ドキュメント

- `README.md` - プロジェクト全体の説明
- `PROGRESS.md` - 開発進捗
- `CHANGELOG.md` - 変更履歴
- `アルケミ修正案.md` - 修正要件

---

## 💡 効率的な作業のコツ

1. **PROGRESS.mdを最初に読む** - 現在の状況を把握
2. **小さな単位でコミット** - 進捗を記録
3. **PRで進捗を共有** - 途中でもPRを作成可能
4. **エラーは詳細に記録** - 再現手順を含める

---

**このプロンプトを新しいセッションの最初に使用してください。**

