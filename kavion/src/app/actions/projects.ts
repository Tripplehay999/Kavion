'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MOCK_PROJECTS = [
  { id: 'mock-1', user_id: '', name: 'Kavion OS',     description: 'Personal command center', status: 'active',    priority: 'high',   progress: 35, stack: ['Next.js','Supabase'], color: '#3B82F6', created_at: '', updated_at: '2h ago'  },
  { id: 'mock-2', user_id: '', name: 'Revenue API',   description: 'MRR tracking API',        status: 'active',    priority: 'high',   progress: 72, stack: ['Node.js','Stripe'],   color: '#3B82F6', created_at: '', updated_at: '1d ago'  },
  { id: 'mock-3', user_id: '', name: 'Habit Engine',  description: 'Daily habit tracker',     status: 'paused',    priority: 'medium', progress: 48, stack: ['React'],              color: '#64748B', created_at: '', updated_at: '3d ago'  },
  { id: 'mock-4', user_id: '', name: 'Snippet Vault', description: 'Code snippet library',    status: 'active',    priority: 'low',    progress: 88, stack: ['Next.js'],            color: '#3B82F6', created_at: '', updated_at: '5d ago'  },
]

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

export async function getProjects() {
  if (!isConfigured()) return MOCK_PROJECTS
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return MOCK_PROJECTS
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
  return data && data.length > 0 ? data : []
}

export async function getRecentProjects(limit = 4) {
  if (!isConfigured()) return MOCK_PROJECTS.slice(0, limit)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return MOCK_PROJECTS.slice(0, limit)
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(limit)
  return data ?? MOCK_PROJECTS.slice(0, limit)
}

export async function addProject(input: {
  name: string
  description?: string
  status?: string
  priority?: string
  progress?: number
  stack?: string[]
  color?: string
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('projects').insert({ user_id: user.id, ...input })
  if (error) throw new Error(error.message)
  revalidatePath('/projects')
  revalidatePath('/dashboard')
}

export async function updateProject(id: string, input: {
  name?: string
  description?: string
  status?: string
  priority?: string
  progress?: number
  stack?: string[]
  color?: string
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('projects').update(input).eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/projects')
  revalidatePath('/dashboard')
}

export async function deleteProject(id: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/projects')
  revalidatePath('/dashboard')
}

export async function getProjectStats() {
  if (!isConfigured()) return { active: 6, total: 8 }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { active: 0, total: 0 }
  const { data } = await supabase.from('projects').select('status').eq('user_id', user.id)
  const all = data ?? []
  return { active: all.filter(p => p.status === 'active').length, total: all.length }
}
