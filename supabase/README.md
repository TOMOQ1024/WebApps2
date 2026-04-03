# Supabase セットアップ手順

## 1. Supabase プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 新しいプロジェクトを作成
3. Settings > API から以下を取得:
   - Project URL → `.env.local` の `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `.env.local` の `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. DB スキーマ適用

1. Supabase Dashboard > SQL Editor を開く
2. `supabase/schema.sql` の内容をコピー＆ペースト
3. Run をクリックして実行

## 3. データ投入

`.env.local` に Supabase の接続情報を設定後、以下を実行:

```bash
pnpm seed:supabase
```

または:

```bash
tsx scripts/seed-supabase.ts
```

## 確認

Supabase Dashboard > Table Editor で以下が作成されていることを確認:

- `tags`
- `apps`
- `app_tags`
- `galleries`
- `gallery_tags`
- `gallery_items`
