-- 000_initial_schema.sql
-- 初期スキーマ: すべてのテーブル，関数，RLS ポリシーを含む

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;


--
-- Name: get_username(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_username(user_id uuid) RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  select raw_user_meta_data->>'username'
  from auth.users
  where id = user_id;
$$;


--
-- Name: nanoid(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.nanoid(size integer DEFAULT 12) RETURNS text
    LANGUAGE plpgsql
    AS $$
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
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_tags (
    app_id text NOT NULL,
    tag_id text NOT NULL
);


--
-- Name: apps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.apps (
    path text NOT NULL,
    app_name text NOT NULL,
    description text DEFAULT ''::text,
    sort_order integer DEFAULT 0,
    id text DEFAULT public.nanoid() NOT NULL
);


--
-- Name: galleries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.galleries (
    path text NOT NULL,
    gallery_name text NOT NULL,
    description text DEFAULT ''::text,
    sort_order integer DEFAULT 0,
    id text DEFAULT public.nanoid() NOT NULL
);


--
-- Name: gallery_item_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_item_tags (
    gallery_item_id text NOT NULL,
    tag_id text NOT NULL
);


--
-- Name: gallery_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_items (
    data jsonb NOT NULL,
    sort_order integer DEFAULT 0,
    id text DEFAULT public.nanoid() NOT NULL,
    gallery_id text NOT NULL,
    created_by uuid
);


--
-- Name: gallery_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_tags (
    gallery_id text NOT NULL,
    tag_id text NOT NULL
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    name text NOT NULL,
    id text DEFAULT public.nanoid() NOT NULL,
    for_apps boolean DEFAULT true,
    for_galleries boolean DEFAULT true,
    for_gallery_items boolean DEFAULT false
);


--
-- Name: app_tags app_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_tags
    ADD CONSTRAINT app_tags_pkey PRIMARY KEY (app_id, tag_id);


--
-- Name: apps apps_nanoid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_nanoid_unique UNIQUE (id);


--
-- Name: apps apps_path_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_path_key UNIQUE (path);


--
-- Name: apps apps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apps
    ADD CONSTRAINT apps_pkey PRIMARY KEY (id);


--
-- Name: galleries galleries_nanoid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.galleries
    ADD CONSTRAINT galleries_nanoid_unique UNIQUE (id);


--
-- Name: galleries galleries_path_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.galleries
    ADD CONSTRAINT galleries_path_key UNIQUE (path);


--
-- Name: galleries galleries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.galleries
    ADD CONSTRAINT galleries_pkey PRIMARY KEY (id);


--
-- Name: gallery_item_tags gallery_item_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_item_tags
    ADD CONSTRAINT gallery_item_tags_pkey PRIMARY KEY (gallery_item_id, tag_id);


--
-- Name: gallery_items gallery_items_nanoid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items
    ADD CONSTRAINT gallery_items_nanoid_unique UNIQUE (id);


--
-- Name: gallery_items gallery_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items
    ADD CONSTRAINT gallery_items_pkey PRIMARY KEY (id);


--
-- Name: gallery_tags gallery_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_tags
    ADD CONSTRAINT gallery_tags_pkey PRIMARY KEY (gallery_id, tag_id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_nanoid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_nanoid_unique UNIQUE (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: idx_app_tags_app; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_tags_app ON public.app_tags USING btree (app_id);


--
-- Name: idx_app_tags_tag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_app_tags_tag ON public.app_tags USING btree (tag_id);


--
-- Name: idx_gallery_item_tags_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gallery_item_tags_item ON public.gallery_item_tags USING btree (gallery_item_id);


--
-- Name: idx_gallery_item_tags_tag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gallery_item_tags_tag ON public.gallery_item_tags USING btree (tag_id);


--
-- Name: idx_gallery_items_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gallery_items_created_by ON public.gallery_items USING btree (created_by);


--
-- Name: idx_gallery_items_gallery_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gallery_items_gallery_id ON public.gallery_items USING btree (gallery_id);


--
-- Name: idx_gallery_tags_gallery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gallery_tags_gallery ON public.gallery_tags USING btree (gallery_id);


--
-- Name: idx_gallery_tags_tag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gallery_tags_tag ON public.gallery_tags USING btree (tag_id);


--
-- Name: app_tags app_tags_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_tags
    ADD CONSTRAINT app_tags_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;


--
-- Name: app_tags app_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_tags
    ADD CONSTRAINT app_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: gallery_item_tags gallery_item_tags_gallery_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_item_tags
    ADD CONSTRAINT gallery_item_tags_gallery_item_id_fkey FOREIGN KEY (gallery_item_id) REFERENCES public.gallery_items(id) ON DELETE CASCADE;


--
-- Name: gallery_item_tags gallery_item_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_item_tags
    ADD CONSTRAINT gallery_item_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: gallery_items gallery_items_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items
    ADD CONSTRAINT gallery_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: gallery_items gallery_items_gallery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items
    ADD CONSTRAINT gallery_items_gallery_id_fkey FOREIGN KEY (gallery_id) REFERENCES public.galleries(id) ON DELETE CASCADE;


--
-- Name: gallery_tags gallery_tags_gallery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_tags
    ADD CONSTRAINT gallery_tags_gallery_id_fkey FOREIGN KEY (gallery_id) REFERENCES public.galleries(id) ON DELETE CASCADE;


--
-- Name: gallery_tags gallery_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_tags
    ADD CONSTRAINT gallery_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: app_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.app_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: app_tags app_tags_delete_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY app_tags_delete_authenticated ON public.app_tags FOR DELETE TO authenticated USING (true);


--
-- Name: app_tags app_tags_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY app_tags_insert_authenticated ON public.app_tags FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: app_tags app_tags_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY app_tags_select_all ON public.app_tags FOR SELECT USING (true);


--
-- Name: app_tags app_tags_update_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY app_tags_update_authenticated ON public.app_tags FOR UPDATE TO authenticated USING (true);


--
-- Name: apps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

--
-- Name: apps apps_delete_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY apps_delete_authenticated ON public.apps FOR DELETE TO authenticated USING (true);


--
-- Name: apps apps_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY apps_insert_authenticated ON public.apps FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: apps apps_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY apps_select_all ON public.apps FOR SELECT USING (true);


--
-- Name: apps apps_update_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY apps_update_authenticated ON public.apps FOR UPDATE TO authenticated USING (true);


--
-- Name: galleries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

--
-- Name: galleries galleries_delete_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY galleries_delete_authenticated ON public.galleries FOR DELETE TO authenticated USING (true);


--
-- Name: galleries galleries_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY galleries_insert_authenticated ON public.galleries FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: galleries galleries_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY galleries_select_all ON public.galleries FOR SELECT USING (true);


--
-- Name: galleries galleries_update_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY galleries_update_authenticated ON public.galleries FOR UPDATE TO authenticated USING (true);


--
-- Name: gallery_item_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gallery_item_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: gallery_item_tags gallery_item_tags_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gallery_item_tags_delete ON public.gallery_item_tags FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: gallery_item_tags gallery_item_tags_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gallery_item_tags_insert ON public.gallery_item_tags FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: gallery_item_tags gallery_item_tags_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gallery_item_tags_select ON public.gallery_item_tags FOR SELECT USING (true);


--
-- Name: gallery_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

--
-- Name: gallery_items gallery_items_delete_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gallery_items_delete_owner ON public.gallery_items FOR DELETE TO authenticated USING ((created_by = auth.uid()));


--
-- Name: gallery_items gallery_items_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gallery_items_insert_authenticated ON public.gallery_items FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: gallery_items gallery_items_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gallery_items_select_all ON public.gallery_items FOR SELECT USING (true);


--
-- Name: gallery_items gallery_items_update_owner; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gallery_items_update_owner ON public.gallery_items FOR UPDATE TO authenticated USING ((created_by = auth.uid()));


--
-- Name: gallery_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gallery_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: gallery_tags gallery_tags_delete_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gallery_tags_delete_authenticated ON public.gallery_tags FOR DELETE TO authenticated USING (true);


--
-- Name: gallery_tags gallery_tags_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gallery_tags_insert_authenticated ON public.gallery_tags FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: gallery_tags gallery_tags_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gallery_tags_select_all ON public.gallery_tags FOR SELECT USING (true);


--
-- Name: gallery_tags gallery_tags_update_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY gallery_tags_update_authenticated ON public.gallery_tags FOR UPDATE TO authenticated USING (true);


--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

--
-- Name: tags tags_delete_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tags_delete_authenticated ON public.tags FOR DELETE TO authenticated USING (true);


--
-- Name: tags tags_insert_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tags_insert_authenticated ON public.tags FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: tags tags_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tags_select_all ON public.tags FOR SELECT USING (true);


--
-- Name: tags tags_update_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tags_update_authenticated ON public.tags FOR UPDATE TO authenticated USING (true);


-- 初期スキーマ完了

