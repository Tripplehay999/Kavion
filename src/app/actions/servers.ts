'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

// ── Validation helpers ────────────────────────────────────────────────────────
function maxLen(val: string, max: number, field = 'Field') {
  if (typeof val !== 'string' || val.length > max)
    throw new Error(`${field} must be ${max} characters or fewer`)
}

/** Block private/loopback/metadata IPs — SSRF prevention */
function isSafeUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol)) return false
    const h = url.hostname
    if (/^(localhost|127\.|0\.0\.0\.0|::1$)/i.test(h)) return false
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/i.test(h)) return false
    if (/^169\.254\./i.test(h)) return false // cloud metadata (AWS/GCP/Azure)
    return true
  } catch { return false }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function getServers() {
  if (!isConfigured()) return []
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('servers').select('*').eq('user_id', user.id).order('name')
  return data ?? []
}

export async function addServer(input: {
  name: string; host: string; provider?: string; region?: string; ping_url?: string
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  maxLen(input.name, 80, 'Name')
  maxLen(input.host, 200, 'Host')
  if (input.ping_url) {
    maxLen(input.ping_url, 500, 'Ping URL')
    if (!isSafeUrl(input.ping_url)) throw new Error('Invalid or disallowed ping URL')
  }
  if (input.provider) maxLen(input.provider, 60, 'Provider')
  if (input.region)   maxLen(input.region,   60, 'Region')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('servers').insert({ user_id: user.id, ...input })
  if (error) throw new Error('Failed to add server')
  revalidatePath('/servers')
}

export async function updateServerStatus(id: string, input: {
  status?: string; cpu_pct?: number; memory_pct?: number; uptime_pct?: number; response_ms?: number
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('servers').update({ ...input, last_checked: new Date().toISOString() })
    .eq('id', id).eq('user_id', user.id)
  if (error) throw new Error('Failed to update server status')
  revalidatePath('/servers')
}

export async function deleteServer(id: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('servers').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error('Failed to delete server')
  revalidatePath('/servers')
}

/** Ping a server's URL and update its status in the DB */
export async function pingServer(id: string, pingUrl: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  if (!isSafeUrl(pingUrl)) throw new Error('Invalid or disallowed ping URL')
  const start = Date.now()
  let status: string
  let responseMs: number

  try {
    const res = await fetch(pingUrl, { cache: 'no-store', signal: AbortSignal.timeout(5000) })
    responseMs = Date.now() - start
    status = res.ok ? (responseMs > 2000 ? 'degraded' : 'online') : 'degraded'
  } catch {
    responseMs = Date.now() - start
    status = 'offline'
  }

  await updateServerStatus(id, { status, response_ms: responseMs })
  return { status, response_ms: responseMs }
}
