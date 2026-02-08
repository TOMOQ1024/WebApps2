-- gallery_items を外部キー制約に移行
-- 既存データがある環境で実行可能

-- 1. 新しいカラムを追加
alter table public.gallery_items add column if not exists gallery_id bigint;

-- 2. 既存データを移行（gallery_path から gallery_id を設定）
update public.gallery_items gi
set gallery_id = g.id
from public.galleries g
where gi.gallery_path = g.path;

-- 3. NOT NULL 制約を追加
alter table public.gallery_items alter column gallery_id set not null;

-- 4. 外部キー制約を追加
alter table public.gallery_items
  add constraint fk_gallery_items_gallery
  foreign key (gallery_id) references public.galleries(id) on delete cascade;

-- 5. 新しいインデックスを作成
create index if not exists idx_gallery_items_gallery_id on public.gallery_items(gallery_id);

-- 6. 古いカラムとインデックスを削除
drop index if exists idx_gallery_items_gallery;
alter table public.gallery_items drop column if exists gallery_path;
