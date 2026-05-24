import { createClient } from "@supabase/supabase-js";

/**
 * ビルド時など cookies が使えない文脈向けの Supabase クライアント
 */
export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
