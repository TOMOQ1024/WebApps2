/**
 * アプリの公開 URL を返す．
 * パスワードリセットメールの redirectTo や auth/confirm のリダイレクト先に使用．
 * portless 利用時は request.nextUrl ではなくこちらを使う（内部 URL へのリダイレクトを防ぐ）．
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (isLocalSupabase()) {
    return "http://tomoq.localhost";
  }

  return "http://127.0.0.1:3000";
}

/** ローカル Supabase を向いているか */
export function isLocalSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url.includes("127.0.0.1") || url.includes("localhost");
}

/** Mailpit の Web UI URL（ローカル開発用） */
export const MAILPIT_URL = "http://127.0.0.1:54324";

/**
 * リダイレクト先パスを検証する（オープンリダイレクト防止）．
 * 相対パスのみ許可し，不正な場合は fallback を返す．
 */
export function getSafeRedirectPath(
  next: string | null,
  fallback = "/auth/reset-password",
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}
