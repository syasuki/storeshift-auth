# GitHub + Vercel デプロイガイド

## 📝 前提条件

- GitHubアカウント
- Vercelアカウント（GitHubでサインアップ推奨）
- Git がインストールされていること

## 🚀 デプロイ手順

### ステップ1: GitHubリポジトリの作成

1. **GitHub.com にログイン**
2. **新しいリポジトリを作成**
   - 右上の「+」→「New repository」
   - Repository name: `storeshift-auth` （任意の名前）
   - Description: `Authentication pages for Store Shift app`
   - Public または Private を選択
   - **重要**: 「Add a README file」のチェックは**外す**
   - 「Create repository」をクリック

### ステップ2: ローカルからGitHubへプッシュ

ターミナルで以下のコマンドを実行：

```bash
# siteフォルダに移動
cd /Users/sugimotoyasuki/Desktop/shift_posi/site

# Gitリポジトリを初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Authentication pages for Store Shift"

# メインブランチに切り替え（必要な場合）
git branch -M main

# GitHubリポジトリをリモートとして追加
# ⚠️ YOUR_USERNAME を自分のGitHubユーザー名に置き換えてください
git remote add origin https://github.com/YOUR_USERNAME/storeshift-auth.git

# GitHubにプッシュ
git push -u origin main
```

**エラーが出た場合:**

認証エラーの場合:
```bash
# Personal Access Token を使用
# GitHub Settings → Developer settings → Personal access tokens → Generate new token
# repo スコープにチェックを入れて生成

git push -u origin main
# Username: YOUR_USERNAME
# Password: YOUR_PERSONAL_ACCESS_TOKEN
```

### ステップ3: Vercelでデプロイ

1. **Vercel.com にログイン**
   - https://vercel.com/login
   - 「Continue with GitHub」を推奨

2. **新しいプロジェクトを作成**
   - Dashboard → 「Add New...」→「Project」
   - または https://vercel.com/new にアクセス

3. **GitHubリポジトリをインポート**
   - 「Import Git Repository」セクション
   - `storeshift-auth` リポジトリを選択
   - 「Import」をクリック

4. **プロジェクト設定**
   ```
   Project Name: storeshift-auth（自動入力）
   Framework Preset: Other（または None）
   Root Directory: ./ （デフォルトのまま）
   Build Command: （空欄のまま）
   Output Directory: （空欄のまま）
   Install Command: （空欄のまま）
   ```

5. **環境変数**（必要な場合）
   - 今回は不要（Supabase URLとKeyはコード内に含まれている）

6. **デプロイ**
   - 「Deploy」をクリック
   - 1-2分でデプロイ完了

### ステップ4: デプロイ確認

1. **URLを確認**
   - Vercelが自動的に以下のようなURLを生成：
   - `https://storeshift-auth.vercel.app`
   - または
   - `https://storeshift-auth-YOUR_USERNAME.vercel.app`

2. **動作確認**
   - ブラウザでアクセス: `https://your-domain.vercel.app`
   - 各ページを確認:
     - `/auth/confirm`
     - `/auth/reset-password`
     - `/auth/invite`
     - `/auth/callback`

### ステップ5: Supabaseの設定更新

1. **Supabase Dashboard にログイン**

2. **Authentication → URL Configuration**

3. **Site URL を更新**
   ```
   https://storeshift-auth.vercel.app
   ```

4. **Redirect URLs を更新**
   ```
   https://storeshift-auth.vercel.app/auth/confirm
   https://storeshift-auth.vercel.app/auth/callback
   https://storeshift-auth.vercel.app/auth/reset-password
   https://storeshift-auth.vercel.app/auth/invite
   storeshift://auth-success
   storeshift://auth-callback
   ```

## 🔄 更新方法

コードを変更した後の更新手順：

```bash
# siteフォルダで作業
cd /Users/sugimotoyasuki/Desktop/shift_posi/site

# 変更をステージング
git add .

# コミット
git commit -m "Update: 変更内容の説明"

# GitHubにプッシュ
git push

# Vercelが自動的にデプロイ（1-2分）
```

## 🎯 カスタムドメインの設定（オプション）

1. **Vercel Dashboard → プロジェクト → Settings → Domains**
2. **Add Domain**
3. **ドメインを入力**（例: `auth.yourdomain.com`）
4. **DNSレコードを設定**
   - CNAMEレコード: `cname.vercel-dns.com`
   - または Aレコード: `76.76.21.21`

## ⚠️ トラブルシューティング

### ビルドエラー

```json
// vercel.json に追加
{
  "buildCommand": "",
  "outputDirectory": ".",
  "framework": null
}
```

### 404エラー

```json
// vercel.json の rewrites を確認
{
  "rewrites": [
    {
      "source": "/auth/confirm",
      "destination": "/auth/confirm.html"
    }
  ]
}
```

### CORS エラー

```json
// vercel.json に追加
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

## 📊 デプロイ状況の確認

1. **Vercel Dashboard**
   - https://vercel.com/dashboard
   - デプロイ履歴
   - ビルドログ
   - Analytics

2. **GitHub Actions（自動設定）**
   - リポジトリ → Actions タブ
   - Vercelのデプロイ状況

## 🔐 セキュリティ設定

1. **環境変数を使用する場合**
   ```javascript
   // 直接記述の代わりに
   const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
   ```

2. **Vercelで環境変数を設定**
   - Settings → Environment Variables
   - Add New Variable

## 📞 サポート

問題が発生した場合：

1. **Vercel Status**: https://vercel.com/support
2. **GitHub Status**: https://www.githubstatus.com
3. **ログを確認**: Vercel Dashboard → Functions → Logs

---

これで GitHub + Vercel のデプロイが完了です！ 🎉