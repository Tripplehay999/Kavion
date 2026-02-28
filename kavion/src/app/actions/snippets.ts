'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

export async function getSnippets(language?: string) {
  if (!isConfigured()) return []
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  let q = supabase.from('snippets').select('*').eq('user_id', user.id)
  if (language && language !== 'all') q = q.eq('language', language)
  const { data } = await q.order('created_at', { ascending: false })
  return data ?? []
}

export async function addSnippet(input: {
  title: string; description?: string; code: string; language: string; tags?: string[]
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('snippets').insert({ user_id: user.id, ...input })
  if (error) throw new Error(error.message)
  revalidatePath('/snippets')
}

export async function updateSnippet(id: string, input: {
  title?: string; description?: string; code?: string; language?: string; tags?: string[]
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('snippets').update(input).eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/snippets')
}

export async function deleteSnippet(id: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('snippets').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/snippets')
}
