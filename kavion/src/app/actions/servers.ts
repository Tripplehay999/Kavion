'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('servers').insert({ user_id: user.id, ...input })
  if (error) throw new Error(error.message)
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
  if (error) throw new Error(error.message)
  revalidatePath('/servers')
}

export async function deleteServer(id: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('servers').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/servers')
}

/** Ping a server's URL and update its status in the DB */
export async function pingServer(id: string, pingUrl: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
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
