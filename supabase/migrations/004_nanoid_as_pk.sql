-- nanoid を主キーとして使用するように変更
-- 000_initial_schema 適用済み環境（id が text）ではスキップ

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tags'
      AND column_name = 'id'
      AND data_type = 'text'
  ) THEN
    RETURN;
  END IF;

  ALTER TABLE public.app_tags DROP CONSTRAINT IF EXISTS app_tags_app_id_fkey;
  ALTER TABLE public.app_tags DROP CONSTRAINT IF EXISTS app_tags_tag_id_fkey;
  ALTER TABLE public.gallery_tags DROP CONSTRAINT IF EXISTS gallery_tags_gallery_id_fkey;
  ALTER TABLE public.gallery_tags DROP CONSTRAINT IF EXISTS gallery_tags_tag_id_fkey;
  ALTER TABLE public.gallery_items DROP CONSTRAINT IF EXISTS fk_gallery_items_gallery;

  ALTER TABLE public.app_tags ADD COLUMN IF NOT EXISTS app_nanoid text;
  ALTER TABLE public.app_tags ADD COLUMN IF NOT EXISTS tag_nanoid text;
  UPDATE public.app_tags at SET
    app_nanoid = (SELECT nanoid FROM public.apps WHERE id = at.app_id),
    tag_nanoid = (SELECT nanoid FROM public.tags WHERE id = at.tag_id);

  ALTER TABLE public.gallery_tags ADD COLUMN IF NOT EXISTS gallery_nanoid text;
  ALTER TABLE public.gallery_tags ADD COLUMN IF NOT EXISTS tag_nanoid text;
  UPDATE public.gallery_tags gt SET
    gallery_nanoid = (SELECT nanoid FROM public.galleries WHERE id = gt.gallery_id),
    tag_nanoid = (SELECT nanoid FROM public.tags WHERE id = gt.tag_id);

  ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS gallery_nanoid text;
  UPDATE public.gallery_items gi SET
    gallery_nanoid = (SELECT nanoid FROM public.galleries WHERE id = gi.gallery_id);

  ALTER TABLE public.tags DROP CONSTRAINT IF EXISTS tags_pkey;
  ALTER TABLE public.apps DROP CONSTRAINT IF EXISTS apps_pkey;
  ALTER TABLE public.galleries DROP CONSTRAINT IF EXISTS galleries_pkey;
  ALTER TABLE public.gallery_items DROP CONSTRAINT IF EXISTS gallery_items_pkey;
  ALTER TABLE public.app_tags DROP CONSTRAINT IF EXISTS app_tags_pkey;
  ALTER TABLE public.gallery_tags DROP CONSTRAINT IF EXISTS gallery_tags_pkey;

  ALTER TABLE public.app_tags DROP COLUMN IF EXISTS app_id;
  ALTER TABLE public.app_tags DROP COLUMN IF EXISTS tag_id;
  ALTER TABLE public.gallery_tags DROP COLUMN IF EXISTS gallery_id;
  ALTER TABLE public.gallery_tags DROP COLUMN IF EXISTS tag_id;
  ALTER TABLE public.gallery_items DROP COLUMN IF EXISTS gallery_id;
  ALTER TABLE public.tags DROP COLUMN IF EXISTS id;
  ALTER TABLE public.apps DROP COLUMN IF EXISTS id;
  ALTER TABLE public.galleries DROP COLUMN IF EXISTS id;
  ALTER TABLE public.gallery_items DROP COLUMN IF EXISTS id;

  ALTER TABLE public.tags RENAME COLUMN nanoid TO id;
  ALTER TABLE public.apps RENAME COLUMN nanoid TO id;
  ALTER TABLE public.galleries RENAME COLUMN nanoid TO id;
  ALTER TABLE public.gallery_items RENAME COLUMN nanoid TO id;

  ALTER TABLE public.app_tags RENAME COLUMN app_nanoid TO app_id;
  ALTER TABLE public.app_tags RENAME COLUMN tag_nanoid TO tag_id;
  ALTER TABLE public.gallery_tags RENAME COLUMN gallery_nanoid TO gallery_id;
  ALTER TABLE public.gallery_tags RENAME COLUMN tag_nanoid TO tag_id;
  ALTER TABLE public.gallery_items RENAME COLUMN gallery_nanoid TO gallery_id;

  ALTER TABLE public.app_tags ALTER COLUMN app_id SET NOT NULL;
  ALTER TABLE public.app_tags ALTER COLUMN tag_id SET NOT NULL;
  ALTER TABLE public.gallery_tags ALTER COLUMN gallery_id SET NOT NULL;
  ALTER TABLE public.gallery_tags ALTER COLUMN tag_id SET NOT NULL;
  ALTER TABLE public.gallery_items ALTER COLUMN gallery_id SET NOT NULL;

  ALTER TABLE public.tags ADD PRIMARY KEY (id);
  ALTER TABLE public.apps ADD PRIMARY KEY (id);
  ALTER TABLE public.galleries ADD PRIMARY KEY (id);
  ALTER TABLE public.gallery_items ADD PRIMARY KEY (id);
  ALTER TABLE public.app_tags ADD PRIMARY KEY (app_id, tag_id);
  ALTER TABLE public.gallery_tags ADD PRIMARY KEY (gallery_id, tag_id);

  ALTER TABLE public.app_tags ADD CONSTRAINT app_tags_app_id_fkey
    FOREIGN KEY (app_id) REFERENCES public.apps(id) ON DELETE CASCADE;
  ALTER TABLE public.app_tags ADD CONSTRAINT app_tags_tag_id_fkey
    FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;
  ALTER TABLE public.gallery_tags ADD CONSTRAINT gallery_tags_gallery_id_fkey
    FOREIGN KEY (gallery_id) REFERENCES public.galleries(id) ON DELETE CASCADE;
  ALTER TABLE public.gallery_tags ADD CONSTRAINT gallery_tags_tag_id_fkey
    FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;
  ALTER TABLE public.gallery_items ADD CONSTRAINT gallery_items_gallery_id_fkey
    FOREIGN KEY (gallery_id) REFERENCES public.galleries(id) ON DELETE CASCADE;

  DROP INDEX IF EXISTS idx_tags_nanoid;
  DROP INDEX IF EXISTS idx_apps_nanoid;
  DROP INDEX IF EXISTS idx_galleries_nanoid;
  DROP INDEX IF EXISTS idx_gallery_items_nanoid;
  DROP INDEX IF EXISTS idx_gallery_items_gallery_id;

  CREATE INDEX IF NOT EXISTS idx_gallery_items_gallery_id ON public.gallery_items(gallery_id);
  CREATE INDEX IF NOT EXISTS idx_app_tags_app ON public.app_tags(app_id);
  CREATE INDEX IF NOT EXISTS idx_app_tags_tag ON public.app_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_gallery_tags_gallery ON public.gallery_tags(gallery_id);
  CREATE INDEX IF NOT EXISTS idx_gallery_tags_tag ON public.gallery_tags(tag_id);
END $$;
