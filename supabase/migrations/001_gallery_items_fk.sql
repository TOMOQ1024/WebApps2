-- gallery_items を外部キー制約に移行
-- 000_initial_schema 適用済み環境では gallery_path が存在しないためスキップ

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'gallery_items'
      AND column_name = 'gallery_path'
  ) THEN
    RETURN;
  END IF;

  ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS gallery_id bigint;

  UPDATE public.gallery_items gi
  SET gallery_id = g.id
  FROM public.galleries g
  WHERE gi.gallery_path = g.path;

  ALTER TABLE public.gallery_items ALTER COLUMN gallery_id SET NOT NULL;

  ALTER TABLE public.gallery_items
    ADD CONSTRAINT fk_gallery_items_gallery
    FOREIGN KEY (gallery_id) REFERENCES public.galleries(id) ON DELETE CASCADE;

  CREATE INDEX IF NOT EXISTS idx_gallery_items_gallery_id ON public.gallery_items(gallery_id);

  DROP INDEX IF EXISTS idx_gallery_items_gallery;
  ALTER TABLE public.gallery_items DROP COLUMN IF EXISTS gallery_path;
END $$;
