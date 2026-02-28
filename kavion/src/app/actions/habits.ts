'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MOCK_HABITS = [
  { id: 'mock-h1', user_id: '', name: 'Deep Work (2h)', color: '#EC4899', sort_order: 0, done: true,  created_at: '' },
  { id: 'mock-h2', user_id: '', name: 'Exercise',        color: '#EC4899', sort_order: 1, done: true,  created_at: '' },
  { id: 'mock-h3', user_id: '', name: 'Read (30 min)',   color: '#EC4899', sort_order: 2, done: false, created_at: '' },
  { id: 'mock-h4', user_id: '', name: 'Cold Shower',     color: '#EC4899', sort_order: 3, done: false, created_at: '' },
  { id: 'mock-h5', user_id: '', name: 'Review Goals',    color: '#EC4899', sort_order: 4, done: false, created_at: '' },
]

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

export async function getHabitsWithToday() {
  if (!isConfigured()) return MOCK_HABITS
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return MOCK_HABITS

  const today = new Date().toISOString().split('T')[0]

  const { data: habits } = await supabase
    .from('habits').select('*').eq('user_id', user.id).order('sort_order')

  if (!habits || habits.length === 0) return []

  const { data: logs } = await supabase
    .from('habit_logs').select('habit_id').eq('user_id', user.id).eq('date', today)

  const doneSet = new Set(logs?.map(l => l.habit_id) ?? [])
  return habits.map(h => ({ ...h, done: doneSet.has(h.id) }))
}

export async function getAllHabitsWithLogs(days = 28) {
  if (!isConfigured()) return { habits: MOCK_HABITS, logs: [] }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { habits: [], logs: [] }

  const from = new Date()
  from.setDate(from.getDate() - days)

  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user.id).order('sort_order'),
    supabase.from('habit_logs').select('habit_id, date, done').eq('user_id', user.id).gte('date', from.toISOString().split('T')[0]),
  ])

  return { habits: habits ?? [], logs: logs ?? [] }
}

export async function toggleHabit(habitId: string) {
  if (!isConfigured()) throw new Error('Supabase not configured — add credentials to .env.local')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('habit_logs').select('id').eq('habit_id', habitId).eq('date', today).maybeSingle()

  if (existing) {
    await supabase.from('habit_logs').delete().eq('id', existing.id)
  } else {
    await supabase.from('habit_logs').insert({ habit_id: habitId, user_id: user.id, date: today, done: true })
  }

  revalidatePath('/dashboard')
  revalidatePath('/habits')
}

export async function addHabit(name: string, color = '#EC4899') {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('habits').insert({ user_id: user.id, name, color })
  if (error) throw new Error(error.message)
  revalidatePath('/habits')
  revalidatePath('/dashboard')
}

export async function deleteHabit(id: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/habits')
  revalidatePath('/dashboard')
}

export async function getHabitStreak() {
  if (!isConfigured()) return 14
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data: logs } = await supabase
    .from('habit_logs').select('date').eq('user_id', user.id).eq('done', true)
    .order('date', { ascending: false }).limit(60)

  if (!logs || logs.length === 0) return 0

  const dateSet = new Set(logs.map(l => l.date))
  let streak = 0
  const today = new Date()
  for (let i = 1; i <= 60; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (dateSet.has(d.toISOString().split('T')[0])) streak++
    else break
  }
  return streak
}
