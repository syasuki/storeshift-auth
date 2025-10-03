# Store Shift 認証ページ

Supabase認証のコールバック処理を行うためのWebページです。

## ディレクトリ構成

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
├── vercel.json               # Vercel設定
└── README.md                 # このファイル
```

## URLルーティング

Vercelにデプロイすると、以下のURLで各機能にアクセスできます：

- `/` - ランディングページ（認証パラメータがある場合は自動的にリダイレクト）
- `/auth/callback` - 汎用認証コールバック
- `/auth/confirm` - メール確認専用
- `/auth/reset-password` - パスワードリセット専用
- `/auth/invite` - 招待確認専用

## Supabase設定

Supabaseのダッシュボードで以下のURLを設定してください：

### Authentication > URL Configuration

```
Site URL: https://your-domain.vercel.app
Redirect URLs:
- https://your-domain.vercel.app/auth/callback
- https://your-domain.vercel.app/auth/confirm
- https://your-domain.vercel.app/auth/reset-password
- https://your-domain.vercel.app/auth/invite
- storeshift://auth-callback (アプリ用)
```

### Email Templates

各メールテンプレートのリンクを以下のように設定：

#### Confirm signup (サインアップ確認)
```html
<a href="{{ .ConfirmationURL }}/auth/confirm">メールアドレスを確認</a>
```

#### Reset Password (パスワードリセット)
```html
<a href="{{ .ConfirmationURL }}/auth/reset-password">パスワードをリセット</a>
```

#### Invite user (ユーザー招待)
```html
<a href="{{ .ConfirmationURL }}/auth/invite">招待を受ける</a>
```

## Vercelデプロイ

1. Vercelにログイン
2. 新しいプロジェクトを作成
3. このsiteディレクトリをルートディレクトリとして設定
4. デプロイ

### 環境変数

特に設定は不要です（Supabase URLとAnon Keyはコード内に含まれています）。

## セキュリティ

- Anon Keyは公開可能なキーです
- 重要な処理はすべてSupabaseのRow Level Security (RLS)で保護されています
- vercel.jsonでセキュリティヘッダーを設定済み

## カスタマイズ

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

## トラブルシューティング

### リダイレクトがうまくいかない

1. Supabaseの Redirect URLs に正しいURLが設定されているか確認
2. vercel.jsonのルーティング設定を確認

### 認証エラーが発生する

1. Supabase URLとAnon Keyが正しいか確認
2. ブラウザのコンソールでエラーログを確認

## サポート

問題がある場合は、アプリ内のサポートからお問い合わせください。