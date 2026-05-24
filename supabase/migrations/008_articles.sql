-- 008_articles.sql
-- ブログ記事テーブルとタグ連携

-- 1. tags テーブルに for_articles フラグを追加
alter table public.tags
  add column if not exists for_articles boolean default false;

-- 2. articles テーブル
create table if not exists public.articles (
  id text primary key default public.nanoid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  body text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_articles_slug on public.articles(slug);
create index if not exists idx_articles_status on public.articles(status);
create index if not exists idx_articles_created_by on public.articles(created_by);
create index if not exists idx_articles_published_at on public.articles(published_at desc nulls last);

-- 3. article_tags テーブル
create table if not exists public.article_tags (
  article_id text not null references public.articles(id) on delete cascade,
  tag_id text not null references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create index if not exists idx_article_tags_article on public.article_tags(article_id);
create index if not exists idx_article_tags_tag on public.article_tags(tag_id);

-- 4. updated_at 自動更新
create or replace function public.set_articles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at
  before update on public.articles
  for each row
  execute function public.set_articles_updated_at();

-- 5. RLS
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;

-- 公開記事は全員閲覧可，下書きは作成者のみ
create policy "articles_select" on public.articles
  for select using (
    status = 'published'
    or (auth.role() = 'authenticated' and created_by = auth.uid())
  );

create policy "articles_insert_authenticated" on public.articles
  for insert to authenticated
  with check (created_by = auth.uid());

create policy "articles_update_owner" on public.articles
  for update to authenticated
  using (created_by = auth.uid());

create policy "articles_delete_owner" on public.articles
  for delete to authenticated
  using (created_by = auth.uid());

create policy "article_tags_select" on public.article_tags
  for select using (true);

create policy "article_tags_insert" on public.article_tags
  for insert to authenticated
  with check (true);

create policy "article_tags_delete" on public.article_tags
  for delete to authenticated
  using (true);
