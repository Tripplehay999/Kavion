import { NextResponse } from 'next/server'
import { getSetting } from '@/app/actions/settings'

export async function GET() {
  const clientId = await getSetting('GITHUB_CLIENT_ID') || process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(new URL('/settings?error=github_not_configured', process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:3000'))
  }

  const state = crypto.randomUUID()
  const params = new URLSearchParams({ client_id: clientId, scope: 'repo read:user', state })

  const res = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`)
  res.cookies.set('github_oauth_state', state, { httpOnly: true, maxAge: 600, path: '/' })
  return res
}
