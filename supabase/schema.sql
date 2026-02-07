-- Supabase DB スキーマ
-- Supabase Dashboard > SQL Editor で実行してください

-- タグ（apps と galleries で共通利用）
create table if not exists public.tags (
  id   bigint generated always as identity primary key,
  name text unique not null
);

-- アプリ一覧（appList 相当）
create table if not exists public.apps (
  id          bigint generated always as identity primary key,
  path        text unique not null,
  app_name    text not null,
  description text default '',
  sort_order  int default 0
);

create table if not exists public.app_tags (
  app_id bigint not null references public.apps(id) on delete cascade,
  tag_id bigint not null references public.tags(id) on delete cascade,
  primary key (app_id, tag_id)
);

-- ギャラリー一覧（galleryList 相当）
create table if not exists public.galleries (
  id           bigint generated always as identity primary key,
  path         text unique not null,
  gallery_name text not null,
  description  text default '',
  sort_order   int default 0
);

create table if not exists public.gallery_tags (
  gallery_id bigint not null references public.galleries(id) on delete cascade,
  tag_id     bigint not null references public.tags(id) on delete cascade,
  primary key (gallery_id, tag_id)
);

-- ギャラリーアイテム（graph-2d と compdynam を統合）
-- gallery_id で参照するギャラリーの path からアイテムタイプを判別
-- data に JSONB で格納
create table if not exists public.gallery_items (
  id          bigint generated always as identity primary key,
  gallery_id  bigint not null references public.galleries(id) on delete cascade,
  data        jsonb not null,
  sort_order  int default 0
);

-- インデックス
create index if not exists idx_gallery_items_gallery_id on public.gallery_items(gallery_id);
create index if not exists idx_app_tags_app on public.app_tags(app_id);
create index if not exists idx_app_tags_tag on public.app_tags(tag_id);
create index if not exists idx_gallery_tags_gallery on public.gallery_tags(gallery_id);
create index if not exists idx_gallery_tags_tag on public.gallery_tags(tag_id);

-- RLS 有効化
alter table public.tags enable row level security;
alter table public.apps enable row level security;
alter table public.app_tags enable row level security;
alter table public.galleries enable row level security;
alter table public.gallery_tags enable row level security;
alter table public.gallery_items enable row level security;

-- RLS ポリシー: 読み取りは全員（anon + authenticated）
create policy "tags_select_all" on public.tags for select using (true);
create policy "apps_select_all" on public.apps for select using (true);
create policy "app_tags_select_all" on public.app_tags for select using (true);
create policy "galleries_select_all" on public.galleries for select using (true);
create policy "gallery_tags_select_all" on public.gallery_tags for select using (true);
create policy "gallery_items_select_all" on public.gallery_items for select using (true);

-- RLS ポリシー: 書き込みは認証済みユーザーのみ（管理用）
-- 注意: シードスクリプトは SUPABASE_SERVICE_ROLE_KEY を使用するため RLS をバイパスします
create policy "tags_insert_authenticated" on public.tags for insert to authenticated with check (true);
create policy "apps_insert_authenticated" on public.apps for insert to authenticated with check (true);
create policy "app_tags_insert_authenticated" on public.app_tags for insert to authenticated with check (true);
create policy "galleries_insert_authenticated" on public.galleries for insert to authenticated with check (true);
create policy "gallery_tags_insert_authenticated" on public.gallery_tags for insert to authenticated with check (true);
create policy "gallery_items_insert_authenticated" on public.gallery_items for insert to authenticated with check (true);

create policy "tags_update_authenticated" on public.tags for update to authenticated using (true);
create policy "apps_update_authenticated" on public.apps for update to authenticated using (true);
create policy "app_tags_update_authenticated" on public.app_tags for update to authenticated using (true);
create policy "galleries_update_authenticated" on public.galleries for update to authenticated using (true);
create policy "gallery_tags_update_authenticated" on public.gallery_tags for update to authenticated using (true);
create policy "gallery_items_update_authenticated" on public.gallery_items for update to authenticated using (true);

create policy "tags_delete_authenticated" on public.tags for delete to authenticated using (true);
create policy "apps_delete_authenticated" on public.apps for delete to authenticated using (true);
create policy "app_tags_delete_authenticated" on public.app_tags for delete to authenticated using (true);
create policy "galleries_delete_authenticated" on public.galleries for delete to authenticated using (true);
create policy "gallery_tags_delete_authenticated" on public.gallery_tags for delete to authenticated using (true);
create policy "gallery_items_delete_authenticated" on public.gallery_items for delete to authenticated using (true);
