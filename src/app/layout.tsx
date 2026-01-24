import { NextAuthProvider } from "@/components/NextAuthProvider";
import "./globals.scss";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getServerSession } from "next-auth/next";
import Header from "@/components/Header";
import { authOptions } from "@/lib/authOptions";
import "@fontsource-variable/roboto-mono";
import ClientProviders from "@/components/ClientProviders";

const themeInitScript = `(function() {
  try {
    var theme = localStorage.getItem('theme');
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.backgroundColor = theme === 'dark' ? 'black' : 'white';
    }
  } catch (e) {}
})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: blocking script to prevent theme flash
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body>
        <NextAuthProvider session={session}>
          <ClientProviders>
            <Header />
            {children}
          </ClientProviders>
        </NextAuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
