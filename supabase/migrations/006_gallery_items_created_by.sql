-- 006_gallery_items_created_by.sql
-- ギャラリーアイテムに作成者情報を追加

-- 1. created_by カラムを追加（auth.users への外部キー）
alter table public.gallery_items
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- 2. 既存アイテムを管理者ユーザーに紐付け
update public.gallery_items
set created_by = '2a0a320d-02a6-4d9d-8cb9-eaf424e9552d'::uuid
where created_by is null;

-- 3. インデックス追加
create index if not exists idx_gallery_items_created_by on public.gallery_items(created_by);

-- 4. RLS ポリシーを更新: 作成者のみが自分のアイテムを更新・削除可能
-- 既存ポリシーを削除
drop policy if exists "gallery_items_update_authenticated" on public.gallery_items;
drop policy if exists "gallery_items_delete_authenticated" on public.gallery_items;

-- 新しいポリシー: 作成者のみ更新可能
create policy "gallery_items_update_owner" on public.gallery_items
  for update to authenticated
  using (created_by = auth.uid());

-- 新しいポリシー: 作成者のみ削除可能
create policy "gallery_items_delete_owner" on public.gallery_items
  for delete to authenticated
  using (created_by = auth.uid());
