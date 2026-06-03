-- NanoID 生成関数を作成
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
END $$;

-- 以下は bigint id から移行する既存環境向け
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION nanoid(size int DEFAULT 12)
RETURNS text AS $$
DECLARE
  id text := '';
  i int := 0;
  urlAlphabet char(64) := 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  bytes bytea := gen_random_bytes(size);
  byte int;
BEGIN
  WHILE i < size LOOP
    byte := get_byte(bytes, i);
    id := id || substr(urlAlphabet, (byte & 63) + 1, 1);
    i := i + 1;
  END LOOP;
  RETURN id;
END
$$ LANGUAGE plpgsql VOLATILE;

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

  ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS nanoid text;
  UPDATE public.tags SET nanoid = nanoid() WHERE nanoid IS NULL;
  ALTER TABLE public.tags ALTER COLUMN nanoid SET NOT NULL;
  ALTER TABLE public.tags ADD CONSTRAINT tags_nanoid_unique UNIQUE (nanoid);

  ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS nanoid text;
  UPDATE public.apps SET nanoid = nanoid() WHERE nanoid IS NULL;
  ALTER TABLE public.apps ALTER COLUMN nanoid SET NOT NULL;
  ALTER TABLE public.apps ADD CONSTRAINT apps_nanoid_unique UNIQUE (nanoid);

  ALTER TABLE public.galleries ADD COLUMN IF NOT EXISTS nanoid text;
  UPDATE public.galleries SET nanoid = nanoid() WHERE nanoid IS NULL;
  ALTER TABLE public.galleries ALTER COLUMN nanoid SET NOT NULL;
  ALTER TABLE public.galleries ADD CONSTRAINT galleries_nanoid_unique UNIQUE (nanoid);

  ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS nanoid text;
  UPDATE public.gallery_items SET nanoid = nanoid() WHERE nanoid IS NULL;
  ALTER TABLE public.gallery_items ALTER COLUMN nanoid SET NOT NULL;
  ALTER TABLE public.gallery_items ADD CONSTRAINT gallery_items_nanoid_unique UNIQUE (nanoid);

  ALTER TABLE public.tags ALTER COLUMN nanoid SET DEFAULT nanoid();
  ALTER TABLE public.apps ALTER COLUMN nanoid SET DEFAULT nanoid();
  ALTER TABLE public.galleries ALTER COLUMN nanoid SET DEFAULT nanoid();
  ALTER TABLE public.gallery_items ALTER COLUMN nanoid SET DEFAULT nanoid();

  CREATE INDEX IF NOT EXISTS idx_tags_nanoid ON public.tags(nanoid);
  CREATE INDEX IF NOT EXISTS idx_apps_nanoid ON public.apps(nanoid);
  CREATE INDEX IF NOT EXISTS idx_galleries_nanoid ON public.galleries(nanoid);
  CREATE INDEX IF NOT EXISTS idx_gallery_items_nanoid ON public.gallery_items(nanoid);
END $$;
