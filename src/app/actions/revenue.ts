'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getSetting } from '@/app/actions/settings'

const MOCK_SOURCES = [
  { id: 'mock-r1', user_id: '', name: 'SaaS Product A',     type: 'SaaS',       mrr: 4800, growth: 22,  status: 'active',   created_at: '', updated_at: '' },
  { id: 'mock-r2', user_id: '', name: 'Consulting Retainer', type: 'Consulting', mrr: 3500, growth: 5,   status: 'active',   created_at: '', updated_at: '' },
  { id: 'mock-r3', user_id: '', name: 'Affiliate — Dev Tools',type: 'Affiliate', mrr: 2100, growth: 38,  status: 'active',   created_at: '', updated_at: '' },
  { id: 'mock-r4', user_id: '', name: 'Digital Product B',   type: 'Product',   mrr: 1200, growth: -8,  status: 'active',   created_at: '', updated_at: '' },
  { id: 'mock-r5', user_id: '', name: 'Freelance Project X', type: 'Freelance', mrr: 800,  growth: 0,   status: 'inactive', created_at: '', updated_at: '' },
]

const MOCK_ENTRIES = [
  { month: 'Sep', total_mrr: 7200,  expenses: 200 },
  { month: 'Oct', total_mrr: 8400,  expenses: 220 },
  { month: 'Nov', total_mrr: 9100,  expenses: 240 },
  { month: 'Dec', total_mrr: 10200, expenses: 250 },
  { month: 'Jan', total_mrr: 11800, expenses: 260 },
  { month: 'Feb', total_mrr: 12400, expenses: 265 },
]

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

export async function getRevenueSources() {
  if (!isConfigured()) return MOCK_SOURCES
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return MOCK_SOURCES
  const { data } = await supabase.from('revenue_sources').select('*').eq('user_id', user.id).order('mrr', { ascending: false })
  return data && data.length > 0 ? data : []
}

export async function getRevenueEntries() {
  if (!isConfigured()) return MOCK_ENTRIES
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return MOCK_ENTRIES
  const { data } = await supabase
    .from('revenue_entries').select('*').eq('user_id', user.id)
    .order('month', { ascending: true }).limit(12)

  if (!data || data.length === 0) return MOCK_ENTRIES
  return data.map(e => ({
    ...e,
    month: new Date(e.month).toLocaleString('default', { month: 'short' }),
  }))
}

export async function addRevenueSource(input: {
  name: string; type: string; mrr: number; growth?: number; status?: string
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('revenue_sources').insert({ user_id: user.id, ...input })
  if (error) throw new Error(error.message)
  revalidatePath('/revenue')
  revalidatePath('/dashboard')
}

export async function updateRevenueSource(id: string, input: {
  name?: string; type?: string; mrr?: number; growth?: number; status?: string
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('revenue_sources').update(input).eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/revenue')
  revalidatePath('/dashboard')
}

export async function deleteRevenueSource(id: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('revenue_sources').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/revenue')
  revalidatePath('/dashboard')
}

export async function logMonthlyMrr(month: string, total_mrr: number, expenses = 0, notes?: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('revenue_entries').upsert({
    user_id: user.id, month, total_mrr, expenses, notes,
  }, { onConflict: 'user_id,month' })
  if (error) throw new Error(error.message)
  revalidatePath('/revenue')
}

export async function getTotalMrr() {
  if (!isConfigured()) return { mrr: 12400, growth: 18 }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { mrr: 0, growth: 0 }
  const { data } = await supabase
    .from('revenue_sources').select('mrr, growth').eq('user_id', user.id).eq('status', 'active')
  if (!data) return { mrr: 0, growth: 0 }
  const mrr = data.reduce((s, r) => s + (Number(r.mrr) || 0), 0)
  const growth = data.length > 0 ? data.reduce((s, r) => s + (Number(r.growth) || 0), 0) / data.length : 0
  return { mrr, growth: Math.round(growth) }
}

/** Fetch live MRR from Stripe — reads key from env or user_settings table */
export async function getStripeMrr(): Promise<{ mrr: number; arr: number; count: number; isLive: boolean } | null> {
  const stripeKey = await getSetting('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return null

  try {
    // Fetch all active subscriptions (paginated)
    let mrr = 0
    let count = 0
    let hasMore = true
    let startingAfter: string | undefined

    while (hasMore) {
      const url = new URL('https://api.stripe.com/v1/subscriptions')
      url.searchParams.set('status', 'active')
      url.searchParams.set('limit', '100')
      url.searchParams.set('expand[]', 'data.items.data.price')
      if (startingAfter) url.searchParams.set('starting_after', startingAfter)

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${stripeKey}` },
        next: { revalidate: 1800 }, // cache 30 min
      })

      if (!res.ok) return null
      const json = await res.json()

      for (const sub of json.data) {
        for (const item of sub.items.data) {
          const price = item.price
          const unitAmount = price.unit_amount ?? 0
          const qty = item.quantity ?? 1
          // Normalize to monthly
          const interval = price.recurring?.interval
          const intervalCount = price.recurring?.interval_count ?? 1
          let monthlyAmount = (unitAmount * qty) / 100
          if (interval === 'year')   monthlyAmount = monthlyAmount / 12 / intervalCount
          if (interval === 'week')   monthlyAmount = monthlyAmount * 4.33 / intervalCount
          if (interval === 'day')    monthlyAmount = monthlyAmount * 30 / intervalCount
          mrr += monthlyAmount
        }
        count++
      }

      hasMore = json.has_more
      if (hasMore && json.data.length > 0) {
        startingAfter = json.data[json.data.length - 1].id
      }
    }

    return { mrr: Math.round(mrr), arr: Math.round(mrr * 12), count, isLive: true }
  } catch {
    return null
  }
}
