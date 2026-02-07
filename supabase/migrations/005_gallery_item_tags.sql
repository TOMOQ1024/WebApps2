-- 005_gallery_item_tags.sql
-- ギャラリーアイテム用タグシステムの追加

-- 1. tags テーブルにスコープフラグを追加
alter table public.tags
  add column if not exists for_apps boolean default true,
  add column if not exists for_galleries boolean default true,
  add column if not exists for_gallery_items boolean default false;

-- 既存タグのスコープを設定（既存タグはアプリ/ギャラリー用）
update public.tags
set for_apps = true,
    for_galleries = true,
    for_gallery_items = false
where for_apps is null;

-- 2. gallery_item_tags テーブルを作成
create table if not exists public.gallery_item_tags (
  gallery_item_id text not null references public.gallery_items(id) on delete cascade,
  tag_id          text not null references public.tags(id) on delete cascade,
  primary key (gallery_item_id, tag_id)
);

-- 3. インデックス
create index if not exists idx_gallery_item_tags_item on public.gallery_item_tags(gallery_item_id);
create index if not exists idx_gallery_item_tags_tag on public.gallery_item_tags(tag_id);

-- 4. RLS ポリシー
alter table public.gallery_item_tags enable row level security;

-- 既存のポリシーがあれば削除（冪等性のため）
drop policy if exists "gallery_item_tags_select" on public.gallery_item_tags;
drop policy if exists "gallery_item_tags_insert" on public.gallery_item_tags;
drop policy if exists "gallery_item_tags_delete" on public.gallery_item_tags;

create policy "gallery_item_tags_select" on public.gallery_item_tags
  for select using (true);

create policy "gallery_item_tags_insert" on public.gallery_item_tags
  for insert with check (auth.role() = 'authenticated');

create policy "gallery_item_tags_delete" on public.gallery_item_tags
  for delete using (auth.role() = 'authenticated');
