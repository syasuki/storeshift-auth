# Store Shift 認証ページ

Supabase認証のコールバック処理を行うためのWebページです。

## 🚀 デプロイ状況

- **本番環境**: https://storeshift-auth.vercel.app
- **GitHub**: https://github.com/syasuki/storeshift-auth

## 📁 ディレクトリ構成

```
site/
├── index.html                # ランディングページ（自動リダイレクト）
├── auth/
│   ├── callback.html         # 汎用認証コールバック
│   ├── confirm.html          # メール確認
│   ├── reset-password.html   # パスワードリセット
│   └── invite.html           # 招待確認
├── scripts/
│   └── auth-handler.js       # 認証処理スクリプト
├── styles/
│   └── auth.css              # スタイルシート
├── email-templates/          # メールテンプレート（参考用）
│   └── signup-confirmation.html
├── vercel.json               # Vercel設定
├── package.json              # パッケージ設定
└── README.md                 # このファイル
```

## 🔄 対応している認証フロー

1. **メールサインアップ確認**
   - PKCE認証フロー（`code`パラメータ）✅
   - 新形式（`token_hash`パラメータ）✅
   - 旧形式（`token`パラメータ）✅
   - レガシー形式（`access_token`）✅

2. **パスワードリセット**
   - `token_hash`による検証 → パスワードフォーム表示
   - セッション確立後のパスワード更新

3. **ユーザー招待**
   - 招待トークンの検証
   - 新規パスワードの設定

## 🔗 URLルーティング

Vercelにデプロイ済みで、以下のURLで各機能にアクセスできます：

- `https://storeshift-auth.vercel.app/` - ランディングページ
- `https://storeshift-auth.vercel.app/auth/callback` - 汎用認証コールバック
- `https://storeshift-auth.vercel.app/auth/confirm` - メール確認専用
- `https://storeshift-auth.vercel.app/auth/reset-password` - パスワードリセット専用
- `https://storeshift-auth.vercel.app/auth/invite` - 招待確認専用

## ⚙️ Supabase設定

### Authentication > URL Configuration

```
Site URL: https://storeshift-auth.vercel.app
Redirect URLs:
- https://storeshift-auth.vercel.app/auth/callback
- https://storeshift-auth.vercel.app/auth/confirm
- https://storeshift-auth.vercel.app/auth/reset-password
- https://storeshift-auth.vercel.app/auth/invite
```

### Email Templates

#### Confirm signup (サインアップ確認)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      font-family: sans-serif;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4FC3F7;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Store Shift - アカウント確認</h2>
    <p>Store Shiftへの登録ありがとうございます。</p>
    <p>以下のボタンをクリックしてメールアドレスを確認してください：</p>
    <p>
      <a href="{{ .ConfirmationURL }}" class="button">
        メールアドレスを確認
      </a>
    </p>
    <p style="color: #666; font-size: 14px;">
      このリンクは24時間で期限切れになります。
    </p>
  </div>
</body>
</html>
```

#### Reset Password (パスワードリセット)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      font-family: sans-serif;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4FC3F7;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Store Shift - パスワードリセット</h2>
    <p>パスワードリセットのリクエストを受け付けました。</p>
    <p>以下のボタンをクリックして新しいパスワードを設定してください：</p>
    <p>
      <a href="{{ .SiteURL }}?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}" class="button">
        パスワードをリセット
      </a>
    </p>
    <p style="color: #666; font-size: 14px;">
      このリンクは24時間で期限切れになります。<br>
      心当たりがない場合は、このメールを無視してください。
    </p>
  </div>
</body>
</html>
```

## 🛠 更新とデプロイ

### GitHubへの更新

```bash
# 変更をステージング
git add .

# コミット
git commit -m "Update: 変更内容の説明"

# GitHubにプッシュ（Vercelが自動デプロイ）
git push
```

### 環境変数

特に設定は不要です（Supabase URLとAnon Keyはコード内に含まれています）。

## 🔐 セキュリティ

- Anon Keyは公開可能なキーです
- 重要な処理はすべてSupabaseのRow Level Security (RLS)で保護されています
- vercel.jsonでセキュリティヘッダーを設定済み

## 🎨 カスタマイズ

### スタイルの変更

`styles/auth.css`のCSS変数を変更することでカラーテーマをカスタマイズできます：

```css
:root {
    --primary: #4FC3F7;        /* メインカラー */
    --primary-dark: #29B6F6;    /* メインカラー（暗め） */
    --success: #4CAF50;         /* 成功メッセージ */
    --error: #f44336;           /* エラーメッセージ */
}
```

### ロゴの変更

各HTMLファイルの`.logo`要素内の絵文字を変更するか、画像に置き換えてください。

## ❓ トラブルシューティング

### メール確認リンクのエラー

- **`otp_expired`エラー**: リンクの有効期限切れ（24時間）
- **`code`パラメータがある場合**: 成功（PKCE認証フロー）
- **対策**: 新しいメールアドレスでサインアップし直す

### パスワードリセットが機能しない

1. Supabaseの Email Templates で正しいURLフォーマットを使用しているか確認
2. `{{ .SiteURL }}?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}`形式を使用

### 認証エラーが発生する

1. Supabase URLとAnon Keyが正しいか確認
2. ブラウザのコンソールでエラーログを確認
3. Supabaseダッシュボードでメール設定を確認

## 📞 サポート

問題がある場合は、GitHubのIssuesまたはアプリ内のサポートからお問い合わせください。