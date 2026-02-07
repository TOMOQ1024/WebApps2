-- 007_get_username_function.sql
-- ユーザー ID からユーザー名を取得する関数

create or replace function public.get_username(user_id uuid)
returns text
language sql
security definer
stable
as $$
  select raw_user_meta_data->>'username'
  from auth.users
  where id = user_id;
$$;

-- 関数の実行権限を付与
grant execute on function public.get_username(uuid) to authenticated;
grant execute on function public.get_username(uuid) to anon;
