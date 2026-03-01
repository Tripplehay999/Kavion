import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSetting } from '@/app/actions/settings'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const savedState = req.cookies.get('github_oauth_state')?.value

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${origin}/settings?error=github_auth_failed`)
  }

  const [clientId, clientSecret] = await Promise.all([
    getSetting('GITHUB_CLIENT_ID').then(v => v || process.env.GITHUB_CLIENT_ID),
    getSetting('GITHUB_CLIENT_SECRET').then(v => v || process.env.GITHUB_CLIENT_SECRET),
  ])

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/settings?error=github_not_configured`)
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  const { access_token, error } = await tokenRes.json()

  if (error || !access_token) {
    return NextResponse.redirect(`${origin}/settings?error=github_token_failed`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  await supabase
    .from('user_settings')
    .upsert({ user_id: user.id, key: 'GITHUB_ACCESS_TOKEN', value: access_token }, { onConflict: 'user_id,key' })

  const res = NextResponse.redirect(`${origin}/projects?github=connected`)
  res.cookies.delete('github_oauth_state')
  return res
}
