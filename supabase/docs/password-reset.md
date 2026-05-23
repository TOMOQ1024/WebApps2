# パスワードリセット

## アプリ内フロー

1. `/apps/forgot-password` でメールアドレスを入力
2. リセットメール内のリンクをクリック
3. `/apps/reset-password` で新しいパスワードを設定
4. `/apps/signin` でサインイン

## ローカル開発

ローカル Supabase ではメールは Gmail 等には送信されず，Mailpit にキャプチャされる:

- Mailpit UI: http://127.0.0.1:54324
- Supabase Studio: http://127.0.0.1:54323

メール内リンクは `http://tomoq.localhost/auth/confirm?...` 形式（PKCE）．

### 環境変数

`.env.local` に以下を推奨:

```bash
NEXT_PUBLIC_SITE_URL=http://tomoq.localhost
```

未設定時はローカル Supabase 利用時に `http://tomoq.localhost` がデフォルトになる．portless の内部 URL（`localhost:4978` 等）へリダイレクトされないよう，`/auth/confirm` は `getSiteUrl()` を使用する．

### 注意

- 未登録のメールアドレスではメールは送られない（セキュリティ上，UI は成功表示）
- DB 初期化後はアカウント再登録が必要

## 本番 Supabase Dashboard 設定

1. **Authentication → URL Configuration**
   - Site URL: `https://tomoq.net`（環境に応じて変更）
   - Redirect URLs に以下を追加:
     - `https://tomoq.net/auth/confirm`
     - `https://tomoq.net/apps/reset-password`
     - preview / development 環境の URL も同様に追加

2. **Authentication → Email Templates → Reset Password**

   `supabase/templates/recovery.html` と同じ PKCE 形式のリンクを使用する:

   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/apps/reset-password">
     Reset password
   </a>
   ```
