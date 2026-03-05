import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kavion.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/projects', '/revenue', '/habits', '/ideas', '/snippets', '/acquisitions', '/servers', '/youtube', '/profile', '/settings', '/tasks'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
