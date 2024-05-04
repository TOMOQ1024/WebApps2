import { NextAuthProvider } from '@/components/NextAuthProvider';
import './globals.scss'
import Header from '@/components/header'
import { authOptions } from '@/lib/authOptions';
import { Analytics } from '@vercel/analytics/react';
import { getServerSession } from 'next-auth/next';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <NextAuthProvider session={session} >
          <Header/>
          {children}
          <Analytics />
        </NextAuthProvider>
      </body>
    </html>
  )
}
