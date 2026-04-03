import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Supabase SSR のセッション Cookie が無いリクエストでは認証 API を呼ばない（Edge ミドルウェアのタイムアウト回避） */
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (c) => c.name.startsWith("sb-") && c.name.includes("auth-token")
  );
}

const SUPABASE_FETCH_TIMEOUT_MS = 8_000;

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const deadline = AbortSignal.timeout(SUPABASE_FETCH_TIMEOUT_MS);
  const upstream = init?.signal;
  const signal =
    upstream && typeof AbortSignal.any === "function"
      ? AbortSignal.any([upstream, deadline])
      : deadline;
  return fetch(input, { ...init, signal });
}

export async function middleware(request: NextRequest) {
  if (!hasSupabaseAuthCookie(request)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: fetchWithTimeout },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッションをリフレッシュ（重要: getUser() を呼ぶことでセッションが更新される）
  try {
    await supabase.auth.getUser();
  } catch {
    // Supabase への往復が遅い・失敗してもページは返す（504 MIDDLEWARE_INVOCATION_TIMEOUT の回避）
  }

  // 認証が必要なルートの保護（例: /admin 配下）
  // 必要に応じてカスタマイズしてください
  // if (
  //   !user &&
  //   request.nextUrl.pathname.startsWith('/admin')
  // ) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/signin';
  //   return NextResponse.redirect(url);
  // }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのリクエストパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコン)
     * - 公開ファイル (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
