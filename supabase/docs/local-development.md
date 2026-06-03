# ローカル開発

## 起動・停止

```bash
pnpm supabase:start
# または: npx supabase start

pnpm supabase:stop
# または: npx supabase stop --no-backup
```

`supabase stop` は DB バックアップを作成し，次回起動時に復元する．storage マイグレーション不整合を避けるため，通常は `--no-backup` 付きで停止する．

## 開発ツール

| ツール | URL |
|--------|-----|
| Supabase Studio | http://127.0.0.1:54323 |
| Mailpit（メール確認） | http://127.0.0.1:54324 |
| API | http://127.0.0.1:54321 |

## メールテンプレート

`supabase/templates/recovery.html` を変更した場合は再起動が必要:

```bash
pnpm supabase:stop
pnpm supabase:start
```

`config.toml` の `content_path` はプロジェクトルートからの相対パス（`supabase/templates/recovery.html`）．`./templates/recovery.html` では見つからない．

## トラブルシューティング

### storage: duplicate key value violates unique constraint "migrations_name_key"

`supabase stop` 後のバックアップ復元と storage マイグレーション状態が食い違ったときに発生する．

```bash
npx supabase stop --no-backup
npx supabase start
```

それでも解消しない場合は DB を初期化する（ローカル auth ユーザーは消える）:

```bash
npx supabase db reset
npx supabase start
```

### config.toml 追加後に初回起動が失敗する

`000_initial_schema.sql` が最終スキーマのダンプのため，001 以降の migration と競合することがある．001–006 は新規環境向けに idempotent 化済み．

### パスワードリセットメールが届かない

- ローカルでは Gmail ではなく Mailpit に届く
- `auth.users` に未登録のメールアドレスではメールは送られない（API は 200 を返す）

詳細は [password-reset.md](password-reset.md) を参照．
