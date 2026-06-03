# リモートバックアップ

リモート Supabase プロジェクト（link 済み）から DB と Storage をローカルに保存する．

## 事前準備

1. `npx supabase link` 済みであること（`supabase/.temp/project-ref` が存在）
2. `.env.local` に以下を設定:

```bash
SUPABASE_DB_PASSWORD=...   # Dashboard > Project Settings > Database
SUPABASE_SERVICE_ROLE_KEY=...   # Storage fallback 用
NEXT_PUBLIC_SUPABASE_URL=...
```

## 実行

```bash
pnpm backup:supabase
```

## 出力

`supabase/backups/YYYY-MM-DDTHH-mm-ss/` に以下が保存される（gitignore 対象）:

| ファイル | 内容 |
|---------|------|
| `schema.sql` | DB スキーマ全体 |
| `data.sql` | DB データ全体 |
| `storage/` | Storage バケットのファイル |
| `manifest.json` | バックアップメタデータ |

Storage が空の場合は `storage/` が空でも正常終了する．CLI が使えない場合は Storage API に fallback する．

## リストア（参考）

完全自動 restore は未提供．概略:

- スキーマ: `psql` またはローカル Supabase へ `schema.sql` を適用
- データ: `data.sql` を適用
- Storage: `storage/` 内のファイルを Dashboard または `supabase storage cp` で再アップロード
