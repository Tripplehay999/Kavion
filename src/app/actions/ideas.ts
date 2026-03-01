'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MOCK_IDEAS = [
  { id: 'mock-i1', title: 'AI Changelog Writer',     description: 'Auto-generates changelogs from git commits using GPT-4',                              status: 'building',  score: 8,  tags: ['AI', 'DevTools', 'SaaS'],       created_at: '3d ago' },
  { id: 'mock-i2', title: 'Micro-SaaS Radar',        description: 'Aggregates acquisition listings from Acquire.com, Flippa, MicroAcquire',             status: 'validated', score: 9,  tags: ['Automation', 'SaaS'],            created_at: '1w ago' },
  { id: 'mock-i3', title: 'Habit OS',                description: 'Minimalist habit tracker with streak visualisation + iOS widget',                    status: 'exploring', score: 7,  tags: ['Mobile'],                        created_at: '2w ago' },
  { id: 'mock-i4', title: 'Code Review Copilot',     description: 'GitHub bot that reviews PRs and leaves AI-powered inline comments',                  status: 'exploring', score: 8,  tags: ['AI', 'DevTools'],                created_at: '2w ago' },
  { id: 'mock-i5', title: 'Startup Name Generator',  description: 'Generates brandable names + checks domain availability instantly',                   status: 'shelved',   score: 5,  tags: ['SaaS'],                          created_at: '1m ago' },
  { id: 'mock-i6', title: 'Newsletter Analytics',    description: 'Cross-platform analytics for Substack, Beehiiv, Kit newsletters',                    status: 'exploring', score: 7,  tags: ['Analytics', 'Creator', 'SaaS'],  created_at: '1m ago' },
  { id: 'mock-i7', title: 'Kavion OS',               description: 'Personal command center — projects, revenue, habits in one app',                     status: 'launched',  score: 10, tags: ['SaaS'],                          created_at: '2d ago' },
  { id: 'mock-i8', title: 'Open Source to SaaS',     description: 'Identifies under-monetised OSS projects and packages them as SaaS',                  status: 'exploring', score: 6,  tags: ['OSS', 'SaaS'],                   created_at: '3w ago' },
]

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

export async function getIdeas() {
  if (!isConfigured()) return MOCK_IDEAS
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return MOCK_IDEAS
    const { data, error } = await supabase.from('ideas').select('*').eq('user_id', user.id).order('score', { ascending: false })
    if (error) return MOCK_IDEAS
    return data ?? MOCK_IDEAS
  } catch (e) {
    console.error('Error fetching ideas:', e)
    return MOCK_IDEAS
  }
}

export async function addIdea(input: {
  title: string; description?: string; score?: number; status?: string; tags?: string[]
}) {
  if (!isConfigured()) throw new Error('Configure Supabase to save ideas')
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data, error } = await supabase
      .from('ideas')
      .insert({ user_id: user.id, ...input })
      .select()
      .single()
    if (error) throw new Error(error.message)
    revalidatePath('/ideas')
    return data as { id: string; title: string; description?: string; score: number; status: string; tags: string[]; created_at: string }
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Failed to add idea')
  }
}

export async function updateIdea(id: string, input: {
  title?: string; description?: string; score?: number; status?: string; tags?: string[]
}) {
  if (!isConfigured()) throw new Error('Configure Supabase to update ideas')
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('ideas').update(input).eq('id', id).eq('user_id', user.id)
    if (error) throw new Error(error.message)
    revalidatePath('/ideas')
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Failed to update idea')
  }
}

export async function deleteIdea(id: string) {
  if (!isConfigured()) throw new Error('Configure Supabase to delete ideas')
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('ideas').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw new Error(error.message)
    revalidatePath('/ideas')
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Failed to delete idea')
  }
}
