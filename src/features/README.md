# features

目的別の機能モジュールを置くディレクトリ．

## 配置ルール

- **サイト全体**で使う → `src/shared/`
- **特定機能**（blog, gallery 等）に閉じる → `src/features/<name>/`

## 現構成

```
features/
├── blog/
│   ├── blogPosts.ts       # 一覧・詳細取得
│   ├── mdxOptions.ts      # MDX レンダリング設定
│   ├── types.ts
│   └── supabase/          # 記事 CRUD
└── gallery/
    └── actions.ts         # ギャラリー CRUD（Server Actions）
```

タグ操作は blog / gallery 共通のため `src/shared/supabase/tags.ts` に置く．
