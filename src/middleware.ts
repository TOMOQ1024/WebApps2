import { JWT } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export default withAuth({
  secret: process.env.AUTH_SECRET,
  callbacks: {
    authorized({ req, token }: { req: NextRequest; token: JWT | null }) {
      // 認証済のユーザと自分のサーバーからのリクエストのみアクセス可能に
      if (token) return true; // If there is a token, the user is authenticated

      const referer = req.headers.get("referer");
      console.log(referer, process.env.NEXTAUTH_URL, process.env.VERCEL_URL);
      if (
        referer &&
        referer.startsWith(process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL!)
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
});

export const config = {
  matcher: "/private/:path*",
};
