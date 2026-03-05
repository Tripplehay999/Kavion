import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kavion.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Kavion — Personal Command Center for Founders & Builders',
    template: '%s | Kavion',
  },
  description:
    'Replace 12 scattered tools with one premium dashboard. Track projects, revenue, habits, ideas, servers, snippets, and YouTube — all from one screen. Built with Next.js and Supabase.',
  keywords: [
    'founder dashboard',
    'personal OS',
    'project tracker',
    'MRR tracking',
    'habit tracker',
    'developer dashboard',
    'solo founder tools',
    'startup dashboard',
    'productivity dashboard',
  ],
  authors: [{ name: 'Kavion' }],
  creator: 'Kavion',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Kavion',
    title: 'Kavion — Personal Command Center for Founders & Builders',
    description:
      'Replace 12 scattered tools with one premium dashboard. Track projects, revenue, habits, ideas, servers, snippets, and YouTube — all from one screen.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kavion — Personal Command Center for Founders & Builders',
    description:
      'Replace 12 scattered tools with one premium dashboard. Track projects, revenue, habits, ideas, servers, snippets, and YouTube — all from one screen.',
    creator: '@kavion',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
