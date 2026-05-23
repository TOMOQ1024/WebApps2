-- NanoID 生成関数を作成
-- 参考: https://github.com/viascom/nanoid-postgres

create extension if not exists pgcrypto;

create or replace function nanoid(size int default 12)
returns text as $$
declare
  id text := '';
  i int := 0;
  urlAlphabet char(64) := 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  bytes bytea := gen_random_bytes(size);
  byte int;
begin
  while i < size loop
    byte := get_byte(bytes, i);
    id := id || substr(urlAlphabet, (byte & 63) + 1, 1);
    i := i + 1;
  end loop;
  return id;
end
$$ language plpgsql volatile;

-- 1. tags テーブル
alter table public.tags add column if not exists nanoid text;
update public.tags set nanoid = nanoid() where nanoid is null;
alter table public.tags alter column nanoid set not null;
alter table public.tags add constraint tags_nanoid_unique unique (nanoid);

-- 2. apps テーブル
alter table public.apps add column if not exists nanoid text;
update public.apps set nanoid = nanoid() where nanoid is null;
alter table public.apps alter column nanoid set not null;
alter table public.apps add constraint apps_nanoid_unique unique (nanoid);

-- 3. galleries テーブル
alter table public.galleries add column if not exists nanoid text;
update public.galleries set nanoid = nanoid() where nanoid is null;
alter table public.galleries alter column nanoid set not null;
alter table public.galleries add constraint galleries_nanoid_unique unique (nanoid);

-- 4. gallery_items テーブル
alter table public.gallery_items add column if not exists nanoid text;
update public.gallery_items set nanoid = nanoid() where nanoid is null;
alter table public.gallery_items alter column nanoid set not null;
alter table public.gallery_items add constraint gallery_items_nanoid_unique unique (nanoid);

-- デフォルト値を設定（新規レコード用）
alter table public.tags alter column nanoid set default nanoid();
alter table public.apps alter column nanoid set default nanoid();
alter table public.galleries alter column nanoid set default nanoid();
alter table public.gallery_items alter column nanoid set default nanoid();

-- インデックス作成
create index if not exists idx_tags_nanoid on public.tags(nanoid);
create index if not exists idx_apps_nanoid on public.apps(nanoid);
create index if not exists idx_galleries_nanoid on public.galleries(nanoid);
create index if not exists idx_gallery_items_nanoid on public.gallery_items(nanoid);
