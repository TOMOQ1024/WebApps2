/**
 * Supabase 接続テスト用（開発時のみ使用）
 *
 * 使用方法:
 * - Supabase プロジェクト作成後、.env.local に URL と ANON_KEY を設定
 * - このファイルを一時的に実行して接続確認
 */

import { createClient } from "./server";

export async function testConnection() {
  try {
    const supabase = await createClient();

    // 簡単なクエリで接続確認
    const { data, error } = await supabase
      .from("apps")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Supabase 接続エラー:", error);
      return false;
    }

    console.log("Supabase 接続成功");
    return true;
  } catch (e) {
    console.error("接続テスト失敗:", e);
    return false;
  }
}
