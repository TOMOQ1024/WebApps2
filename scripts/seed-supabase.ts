/**
 * Supabase データ投入スクリプト
 *
 * 使用方法:
 *   tsx scripts/seed-supabase.ts
 *
 * または:
 *   pnpm exec tsx scripts/seed-supabase.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { galleryData as compdynamGalleryData } from "../src/app/galleries/compdynam/GalleryData";
import { galleryData as graph2dGalleryData } from "../src/app/galleries/graph-2d/GalleryData";
import { galleryList } from "../src/lib/galleryList";

// .env.local を読み込む
config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("環境変数が設定されていません:");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY:",
    supabaseServiceRoleKey ? "✓" : "✗",
  );
  process.exit(1);
}

// Service Role Key を使用（RLS をバイパス）
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// スキーマ確認用のヘルパー関数
async function checkSchema() {
  console.log("スキーマを確認中...");

  const tables = [
    "tags",
    "apps",
    "app_tags",
    "galleries",
    "gallery_tags",
    "gallery_items",
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select("count").limit(1);

    if (error) {
      if (error.code === "PGRST205") {
        console.error(
          `  ✗ テーブル "${table}" が見つかりません。スキーマが適用されているか確認してください。`,
        );
        return false;
      } else {
        console.warn(
          `  ⚠ テーブル "${table}" の確認中にエラー:`,
          error.message,
        );
      }
    } else {
      console.log(`  ✓ テーブル "${table}" は存在します`);
    }
  }

  return true;
}

async function seedTags() {
  console.log("タグを投入中...");

  // galleryList から全タグを収集
  const allTags = new Set<string>();

  Object.values(galleryList).forEach((gallery) => {
    gallery.tags.forEach((tag) => {
      allTags.add(tag);
    });
  });

  // タグを投入（既存のものは無視）
  const tagMap = new Map<string, string>();

  for (const tagName of allTags) {
    const { data, error } = await supabase
      .from("tags")
      .upsert({ name: tagName }, { onConflict: "name" })
      .select()
      .single();

    if (error && error.code !== "23505") {
      // 23505 = unique violation (既に存在)
      console.error(`タグ "${tagName}" の投入エラー:`, error);
      continue;
    }

    if (data) {
      tagMap.set(tagName, data.id);
      console.log(`  ✓ ${tagName} (id: ${data.id})`);
    } else {
      // 既に存在する場合は取得
      const { data: existing } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagName)
        .single();

      if (existing) {
        tagMap.set(tagName, existing.id);
        console.log(`  - ${tagName} (既存, id: ${existing.id})`);
      }
    }
  }

  return tagMap;
}

async function seedGalleries(tagMap: Map<string, string>) {
  console.log("\nギャラリーを投入中...");

  const galleryMap = new Map<string, string>();
  let sortOrder = 0;

  for (const [path, gallery] of Object.entries(galleryList)) {
    const { data, error } = await supabase
      .from("galleries")
      .upsert(
        {
          path,
          gallery_name: gallery.galleryName,
          description: gallery.description || "",
          sort_order: sortOrder++,
        },
        { onConflict: "path" },
      )
      .select()
      .single();

    if (error) {
      console.error(`ギャラリー "${path}" の投入エラー:`, error);
      continue;
    }

    if (data) {
      galleryMap.set(path, data.id);
      console.log(`  ✓ ${path} (id: ${data.id})`);

      // タグを関連付け
      for (const tagName of gallery.tags) {
        const tagId = tagMap.get(tagName);
        if (tagId) {
          await supabase
            .from("gallery_tags")
            .upsert(
              { gallery_id: data.id, tag_id: tagId },
              { onConflict: "gallery_id,tag_id" },
            );
        }
      }
    }
  }

  return galleryMap;
}

async function seedGalleryItems(galleryMap: Map<string, string>) {
  console.log("\nギャラリーアイテムを投入中...");

  // graph-2d ギャラリーアイテム
  const graph2dGalleryId = galleryMap.get("graph-2d");
  if (!graph2dGalleryId) {
    console.error("  ✗ graph-2d ギャラリーが見つかりません");
    return;
  }

  console.log("  graph-2d アイテム...");
  let sortOrder = 0;

  for (const item of graph2dGalleryData) {
    const { error } = await supabase.from("gallery_items").insert({
      gallery_id: graph2dGalleryId,
      data: {
        expressions: item.expressions,
        center: item.center,
        radius: item.radius,
      },
      sort_order: sortOrder++,
    });

    if (error) {
      console.error(`  graph-2d アイテム投入エラー:`, error);
    }
  }

  console.log(`  ✓ ${graph2dGalleryData.length} 件投入`);

  // compdynam ギャラリーアイテム
  const compdynamGalleryId = galleryMap.get("compdynam");
  if (!compdynamGalleryId) {
    console.error("  ✗ compdynam ギャラリーが見つかりません");
    return;
  }

  console.log("  compdynam アイテム...");
  sortOrder = 0;

  for (const item of compdynamGalleryData) {
    const { error } = await supabase.from("gallery_items").insert({
      gallery_id: compdynamGalleryId,
      data: {
        functionLatex: item.functionLatex,
        initialValueLatex: item.initialValueLatex,
        iterations: item.iterations,
        center: item.center,
        radius: item.radius,
      },
      sort_order: sortOrder++,
    });

    if (error) {
      console.error(`  compdynam アイテム投入エラー:`, error);
    }
  }

  console.log(`  ✓ ${compdynamGalleryData.length} 件投入`);
}

async function main() {
  console.log("Supabase データ投入を開始します...\n");

  try {
    // スキーマ確認
    const schemaOk = await checkSchema();
    if (!schemaOk) {
      console.error(
        "\n✗ スキーマが適用されていないか、テーブルが見つかりません。",
      );
      console.error(
        "Supabase Dashboard > SQL Editor で supabase/schema.sql を実行してください。",
      );
      process.exit(1);
    }

    console.log("");

    // 既存データをクリア（オプション - コメントアウトで無効化可能）
    // console.log('既存データをクリア中...')
    // await supabase.from('gallery_items').delete().neq('id', 0)
    // await supabase.from('gallery_tags').delete().neq('gallery_id', 0)
    // await supabase.from('app_tags').delete().neq('app_id', 0)
    // await supabase.from('galleries').delete().neq('id', 0)
    // await supabase.from('apps').delete().neq('id', 0)
    // await supabase.from('tags').delete().neq('id', 0)

    const tagMap = await seedTags();
    const galleryMap = await seedGalleries(tagMap);
    await seedGalleryItems(galleryMap);

    console.log("\n✓ データ投入完了");
  } catch (error) {
    console.error("\n✗ エラー:", error);
    process.exit(1);
  }
}

main();
