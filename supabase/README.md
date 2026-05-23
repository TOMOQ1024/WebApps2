# Supabase セットアップ手順

## 1. Supabase プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 新しいプロジェクトを作成
3. Settings > API から以下を取得:
   - Project URL → `.env.local` の `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `.env.local` の `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. 環境変数

`.env.local` に以下を設定する:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SIGNUP_SECRET_KEY=...

# アプリの公開 URL（パスワードリセットメールのリンク生成に使用）
NEXT_PUBLIC_SITE_URL=http://tomoq.localhost   # ローカル（portless 利用時）
# NEXT_PUBLIC_SITE_URL=https://tomoq.net      # 本番

# ローカル Supabase CLI 用（config.toml の env(...) から参照する場合のみ）
# 注: Supabase CLI は .env.local ではなくプロジェクトルートの .env のみ自動読込する
# 現在 config.toml の site_url は固定値のため SITE_URL の設定は不要
# SITE_URL=http://tomoq.localhost
```

## 3. DB スキーマ適用

### ローカル

```bash
npx supabase start
npx supabase db reset   # migrations を適用
```

### リモート

1. Supabase Dashboard > SQL Editor を開く
2. `supabase/schema.sql` の内容をコピー＆ペースト
3. Run をクリックして実行

## 4. データ投入

`.env.local` に Supabase の接続情報を設定後、以下を実行:

```bash
pnpm seed:supabase
```

または:

```bash
tsx scripts/seed-supabase.ts
```

## 5. パスワードリセット

### フロー

1. `/apps/forgot-password` でメールアドレスを入力
2. リセットメール内のリンクをクリック
3. `/apps/reset-password` で新しいパスワードを設定
4. `/apps/signin` でサインイン

### ローカル開発

ローカル Supabase ではメールは実際には送信されず，Mailpit にキャプチャされる:

- Mailpit UI: http://127.0.0.1:54324
- Supabase Studio: http://127.0.0.1:54323

メールテンプレート（`supabase/templates/recovery.html`）を変更した場合:

```bash
npx supabase stop --no-backup
npx supabase start
```

または:

```bash
pnpm supabase:stop
pnpm supabase:start
```

`content_path` はプロジェクトルートからの相対パス（`supabase/templates/recovery.html`）．`./templates/recovery.html` では見つからない．

### トラブルシューティング

#### storage: duplicate key value violates unique constraint "migrations_name_key"

`supabase stop` 後のバックアップ復元と storage マイグレーション状態が食い違ったときに発生する．

```bash
# バックアップ復元を避けて再起動
npx supabase stop --no-backup
npx supabase start
```

それでも解消しない場合は DB を初期化する（ローカル auth ユーザーは消える）:

```bash
npx supabase db reset
npx supabase start
```

#### config.toml 追加後に初回起動が失敗する

`000_initial_schema.sql` が最終スキーマのダンプのため，001 以降の migration と競合することがある．001–006 は新規環境向けに idempotent 化済み．

### 本番 Supabase Dashboard 設定

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

## 確認

Supabase Dashboard > Table Editor で以下が作成されていることを確認:

- `tags`
- `apps`
- `app_tags`
- `galleries`
- `gallery_tags`
- `gallery_items`
