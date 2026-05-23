-- nanoid を主キーとして使用するように変更
-- 既存の bigint id を廃止し、nanoid を id にリネーム

-- 1. 外部キー制約を削除
alter table public.app_tags drop constraint if exists app_tags_app_id_fkey;
alter table public.app_tags drop constraint if exists app_tags_tag_id_fkey;
alter table public.gallery_tags drop constraint if exists gallery_tags_gallery_id_fkey;
alter table public.gallery_tags drop constraint if exists gallery_tags_tag_id_fkey;
alter table public.gallery_items drop constraint if exists fk_gallery_items_gallery;

-- 2. 中間テーブルに nanoid ベースのカラムを追加
-- app_tags
alter table public.app_tags add column if not exists app_nanoid text;
alter table public.app_tags add column if not exists tag_nanoid text;
update public.app_tags at set 
  app_nanoid = (select nanoid from public.apps where id = at.app_id),
  tag_nanoid = (select nanoid from public.tags where id = at.tag_id);

-- gallery_tags
alter table public.gallery_tags add column if not exists gallery_nanoid text;
alter table public.gallery_tags add column if not exists tag_nanoid text;
update public.gallery_tags gt set 
  gallery_nanoid = (select nanoid from public.galleries where id = gt.gallery_id),
  tag_nanoid = (select nanoid from public.tags where id = gt.tag_id);

-- gallery_items
alter table public.gallery_items add column if not exists gallery_nanoid text;
update public.gallery_items gi set 
  gallery_nanoid = (select nanoid from public.galleries where id = gi.gallery_id);

-- 3. 主キー制約を削除
alter table public.tags drop constraint if exists tags_pkey;
alter table public.apps drop constraint if exists apps_pkey;
alter table public.galleries drop constraint if exists galleries_pkey;
alter table public.gallery_items drop constraint if exists gallery_items_pkey;
alter table public.app_tags drop constraint if exists app_tags_pkey;
alter table public.gallery_tags drop constraint if exists gallery_tags_pkey;

-- 4. 古い id カラムと外部キーカラムを削除
alter table public.app_tags drop column if exists app_id;
alter table public.app_tags drop column if exists tag_id;
alter table public.gallery_tags drop column if exists gallery_id;
alter table public.gallery_tags drop column if exists tag_id;
alter table public.gallery_items drop column if exists gallery_id;
alter table public.tags drop column if exists id;
alter table public.apps drop column if exists id;
alter table public.galleries drop column if exists id;
alter table public.gallery_items drop column if exists id;

-- 5. nanoid を id にリネーム
alter table public.tags rename column nanoid to id;
alter table public.apps rename column nanoid to id;
alter table public.galleries rename column nanoid to id;
alter table public.gallery_items rename column nanoid to id;

-- 6. 中間テーブルのカラムをリネーム
alter table public.app_tags rename column app_nanoid to app_id;
alter table public.app_tags rename column tag_nanoid to tag_id;
alter table public.gallery_tags rename column gallery_nanoid to gallery_id;
alter table public.gallery_tags rename column tag_nanoid to tag_id;
alter table public.gallery_items rename column gallery_nanoid to gallery_id;

-- 7. NOT NULL 制約を追加
alter table public.app_tags alter column app_id set not null;
alter table public.app_tags alter column tag_id set not null;
alter table public.gallery_tags alter column gallery_id set not null;
alter table public.gallery_tags alter column tag_id set not null;
alter table public.gallery_items alter column gallery_id set not null;

-- 8. 新しい主キー制約を追加
alter table public.tags add primary key (id);
alter table public.apps add primary key (id);
alter table public.galleries add primary key (id);
alter table public.gallery_items add primary key (id);
alter table public.app_tags add primary key (app_id, tag_id);
alter table public.gallery_tags add primary key (gallery_id, tag_id);

-- 9. 外部キー制約を追加
alter table public.app_tags add constraint app_tags_app_id_fkey 
  foreign key (app_id) references public.apps(id) on delete cascade;
alter table public.app_tags add constraint app_tags_tag_id_fkey 
  foreign key (tag_id) references public.tags(id) on delete cascade;
alter table public.gallery_tags add constraint gallery_tags_gallery_id_fkey 
  foreign key (gallery_id) references public.galleries(id) on delete cascade;
alter table public.gallery_tags add constraint gallery_tags_tag_id_fkey 
  foreign key (tag_id) references public.tags(id) on delete cascade;
alter table public.gallery_items add constraint gallery_items_gallery_id_fkey 
  foreign key (gallery_id) references public.galleries(id) on delete cascade;

-- 10. インデックスを再作成（古いものを削除して新しく作成）
drop index if exists idx_tags_nanoid;
drop index if exists idx_apps_nanoid;
drop index if exists idx_galleries_nanoid;
drop index if exists idx_gallery_items_nanoid;
drop index if exists idx_gallery_items_gallery_id;

create index if not exists idx_gallery_items_gallery_id on public.gallery_items(gallery_id);
create index if not exists idx_app_tags_app on public.app_tags(app_id);
create index if not exists idx_app_tags_tag on public.app_tags(tag_id);
create index if not exists idx_gallery_tags_gallery on public.gallery_tags(gallery_id);
create index if not exists idx_gallery_tags_tag on public.gallery_tags(tag_id);
