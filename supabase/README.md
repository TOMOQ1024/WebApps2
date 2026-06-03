# Supabase

tomoq.net の Supabase 設定・マイグレーション・ローカル開発用ディレクトリ．

## ドキュメント

| 目的 | ドキュメント |
|------|-------------|
| 初回セットアップ（プロジェクト作成，環境変数，スキーマ，シード） | [docs/setup.md](docs/setup.md) |
| ローカル開発（起動・停止，Mailpit，トラブルシューティング） | [docs/local-development.md](docs/local-development.md) |
| リモート DB / Storage のバックアップ | [docs/backup.md](docs/backup.md) |
| パスワードリセット（ローカル・本番） | [docs/password-reset.md](docs/password-reset.md) |

## よく使うコマンド

```bash
pnpm supabase:start      # ローカル Supabase 起動
pnpm supabase:stop       # 停止（--no-backup）
pnpm seed:supabase       # シードデータ投入
pnpm backup:supabase     # リモートバックアップ
```

## ディレクトリ構成

```
supabase/
├── config.toml          # ローカル Supabase 設定
├── migrations/          # DB マイグレーション
├── templates/           # Auth メールテンプレート
├── schema.sql           # スキーマ参照用（リモート手動適用）
├── backups/             # リモートバックアップ出力（gitignore）
└── docs/                # ドキュメント
```
