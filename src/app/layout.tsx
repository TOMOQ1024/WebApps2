import { NextAuthProvider } from "@/components/NextAuthProvider";
import "./globals.scss";
import Header from "@/components/Header";
import { authOptions } from "@/lib/authOptions";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getServerSession } from "next-auth/next";
import "@fontsource-variable/roboto-mono";
import { IsClientCtxProvider } from "@/components/IsClientCtx";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <NextAuthProvider session={session}>
          <IsClientCtxProvider>
            <Header />
            {children}
          </IsClientCtxProvider>
        </NextAuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
