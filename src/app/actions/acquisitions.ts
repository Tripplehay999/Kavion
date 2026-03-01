'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

export async function getAcquisitions() {
  if (!isConfigured()) return []
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('acquisitions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  return data ?? []
}

export async function addAcquisition(input: {
  name: string; url?: string; asking_price?: number; monthly_revenue?: number;
  monthly_profit?: number; multiple?: number; status?: string; notes?: string; source?: string
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('acquisitions').insert({ user_id: user.id, ...input })
  if (error) throw new Error(error.message)
  revalidatePath('/acquisitions')
}

export async function updateAcquisition(id: string, input: {
  name?: string; url?: string; asking_price?: number; monthly_revenue?: number;
  monthly_profit?: number; multiple?: number; status?: string; notes?: string
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('acquisitions').update(input).eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/acquisitions')
}

export async function deleteAcquisition(id: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('acquisitions').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/acquisitions')
}
