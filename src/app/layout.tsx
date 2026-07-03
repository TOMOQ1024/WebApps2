import { SupabaseAuthProvider } from "@/components/SupabaseAuthProvider";
import { createClient } from "@/shared/supabase/server";
import "./globals.scss";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/Header";
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
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

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
        <SupabaseAuthProvider initialSession={session}>
          <ClientProviders>
            <Header />
            {children}
          </ClientProviders>
        </SupabaseAuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
