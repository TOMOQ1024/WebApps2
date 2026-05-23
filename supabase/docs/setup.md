# 初回セットアップ

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
```

バックアップ用の `SUPABASE_DB_PASSWORD` は [backup.md](backup.md) を参照．

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

`.env.local` に Supabase の接続情報を設定後:

```bash
pnpm seed:supabase
```

または:

```bash
tsx scripts/seed-supabase.ts
```

## 5. 確認

Supabase Dashboard > Table Editor で以下が作成されていることを確認:

- `tags`
- `apps`
- `app_tags`
- `galleries`
- `gallery_tags`
- `gallery_items`
