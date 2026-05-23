-- gallery_items.item_type カラムを削除
-- gallery_id から gallery.path を参照することでアイテムタイプを判別可能

alter table public.gallery_items drop column if exists item_type;
