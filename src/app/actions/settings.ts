'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

export async function getSetting(key: string): Promise<string | null> {
  if (!isConfigured()) return null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('user_settings')
      .select('value')
      .eq('user_id', user.id)
      .eq('key', key)
      .single()
    return data?.value ?? null
  } catch {
    return null
  }
}

export async function getSettings(): Promise<Record<string, string>> {
  if (!isConfigured()) return {}
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {}
    const { data } = await supabase
      .from('user_settings')
      .select('key, value')
      .eq('user_id', user.id)
    if (!data) return {}
    return Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]))
  } catch {
    return {}
  }
}

export async function saveSettings(settings: Record<string, string>) {
  if (!isConfigured()) throw new Error('Supabase not configured — add credentials to .env.local first')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  for (const [key, value] of Object.entries(settings)) {
    if (typeof key !== 'string' || key.length > 60) throw new Error(`Key "${key}" must be 60 characters or fewer`)
    if (typeof value !== 'string' || value.length > 2000) throw new Error(`Value for "${key}" must be 2000 characters or fewer`)
  }

  const rows = Object.entries(settings)
    .filter(([, v]) => v.trim().length > 0)
    .map(([key, value]) => ({ user_id: user.id, key, value: value.trim() }))

  if (rows.length === 0) return

  const { error } = await supabase
    .from('user_settings')
    .upsert(rows, { onConflict: 'user_id,key' })

  if (error) throw new Error('Failed to save settings')
  revalidatePath('/settings')
  revalidatePath('/youtube')
  revalidatePath('/revenue')
}

export async function deleteSetting(key: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  await supabase.from('user_settings').delete().eq('user_id', user.id).eq('key', key)
  revalidatePath('/settings')
}
