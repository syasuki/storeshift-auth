# Supabase 認証設定ガイド

Store Shiftアプリのサインアップフローを正しく動作させるための設定手順です。

## サインアップフロー

1. **ユーザーがアプリでサインアップ**
   - メールアドレスとパスワードを入力
   - Supabaseにユーザー登録リクエスト

2. **確認メールの送信**
   - Supabaseから自動的に確認メールが送信される
   - メール内の「メールアドレスを確認」ボタンをクリック

3. **メール確認ページ**
   - `/auth/confirm`ページで認証処理
   - 成功時にアプリへのディープリンクで戻る

## Supabase Dashboard設定

### 1. Authentication > URL Configuration

```
Site URL: https://your-domain.vercel.app

Redirect URLs: (以下をすべて追加)
- https://your-domain.vercel.app/auth/confirm
- https://your-domain.vercel.app/auth/callback
- https://your-domain.vercel.app/auth/reset-password
- https://your-domain.vercel.app/auth/invite
- storeshift://auth-success
- storeshift://auth-callback
```

### 2. Authentication > Email Templates

#### Confirm signup (重要)

デフォルトのテンプレートを以下のように変更：

```html
<h2>メールアドレスの確認</h2>
<p>Store Shiftへのご登録ありがとうございます。</p>
<p>以下のボタンをクリックしてメールアドレスを確認してください：</p>
<p>
  <a href="{{ .ConfirmationURL }}"
     style="display: inline-block; padding: 12px 24px; background-color: #4FC3F7;
            color: white; text-decoration: none; border-radius: 6px;">
    メールアドレスを確認
  </a>
</p>
<p>このリンクは24時間有効です。</p>
```

**重要**: `{{ .ConfirmationURL }}` のままにしてください。Supabaseが自動的に適切なURLに置き換えます。

#### Reset Password

```html
<h2>パスワードのリセット</h2>
<p>パスワードをリセットするには、以下のボタンをクリックしてください：</p>
<p>
  <a href="{{ .ConfirmationURL }}"
     style="display: inline-block; padding: 12px 24px; background-color: #4FC3F7;
            color: white; text-decoration: none; border-radius: 6px;">
    パスワードをリセット
  </a>
</p>
<p>このリンクは1時間有効です。</p>
```

#### Invite user

```html
<h2>Store Shiftへの招待</h2>
<p>Store Shiftに招待されました。</p>
<p>以下のボタンをクリックしてアカウントを作成してください：</p>
<p>
  <a href="{{ .ConfirmationURL }}"
     style="display: inline-block; padding: 12px 24px; background-color: #4FC3F7;
            color: white; text-decoration: none; border-radius: 6px;">
    招待を受ける
  </a>
</p>
```

### 3. Authentication > Auth Providers

Email認証が有効になっていることを確認：

- **Enable Email provider**: ON
- **Confirm email**: ON（重要）
- **Secure email change**: ON（推奨）
- **Secure password change**: ON（推奨）

## Vercelでのデプロイ後の確認

### テスト手順

1. **サインアップテスト**
   ```
   1. アプリで新規アカウント作成
   2. 確認メールを受信
   3. メール内のボタンをクリック
   4. https://your-domain.vercel.app/auth/confirm にリダイレクトされる
   5. 成功メッセージが表示される
   6. 「アプリを開く」ボタンまたは自動リダイレクトでアプリに戻る
   ```

2. **URLパラメータの確認**

   Supabaseは以下の形式でパラメータを送信します：

   - 新形式（推奨）:
     ```
     /auth/confirm?token_hash=xxx&type=signup
     ```

   - 従来形式:
     ```
     /auth/confirm#access_token=xxx&refresh_token=xxx&type=signup
     ```

### トラブルシューティング

#### "Invalid authentication credentials" エラー

- Redirect URLsに正しいドメインが登録されているか確認
- HTTPSを使用しているか確認（HTTPは許可されません）

#### "Email link is invalid or has expired" エラー

- リンクの有効期限（24時間）が切れていないか確認
- 同じリンクを2回使用していないか確認

#### アプリが開かない

- ディープリンク `storeshift://` がアプリで正しく設定されているか確認
- iOSの場合: Info.plistに URL Scheme が設定されているか
- Androidの場合: AndroidManifest.xmlに Intent Filter が設定されているか

## セキュリティ考慮事項

1. **Rate Limiting**
   - Supabaseは自動的にレート制限を適用
   - 過度なサインアップ試行は自動的にブロック

2. **Email Verification**
   - 必ず `Confirm email` を有効にする
   - 未確認のアカウントはログインできないように設定

3. **SSL/TLS**
   - すべての認証ページはHTTPSで提供される必要がある
   - VercelはデフォルトでHTTPSを提供

## カスタムドメインを使用する場合

1. Vercelでカスタムドメインを設定
2. SupabaseのRedirect URLsを更新
3. SSL証明書が正しく設定されていることを確認

## サポート

設定に関する問題がある場合は、以下を確認してください：

1. Supabaseのログ（Dashboard > Logs）
2. ブラウザのコンソールログ
3. Vercelのデプロイログ

それでも解決しない場合は、エラーメッセージとログを添えてサポートにお問い合わせください。