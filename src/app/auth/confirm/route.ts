import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectPath, getSiteUrl } from "@/lib/supabase/site-url";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = getSafeRedirectPath(searchParams.get("next"));

  const buildRedirect = (pathname: string, params?: Record<string, string>) => {
    const url = new URL(pathname, getSiteUrl());
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return url;
  };

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(buildRedirect(next));
    }
  }

  return NextResponse.redirect(
    buildRedirect("/apps/forgot-password", { error: "invalid_link" }),
  );
}
