'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MOCK_PROJECTS = [
  { id: 'mock-1', user_id: '', name: 'Kavion OS',     description: 'Personal command center', status: 'active',    priority: 'high',   progress: 35, stack: ['Next.js','Supabase'], color: '#3B82F6', created_at: '', updated_at: '2h ago'  },
  { id: 'mock-2', user_id: '', name: 'Revenue API',   description: 'MRR tracking API',        status: 'active',    priority: 'high',   progress: 72, stack: ['Node.js','Stripe'],   color: '#3B82F6', created_at: '', updated_at: '1d ago'  },
  { id: 'mock-3', user_id: '', name: 'Habit Engine',  description: 'Daily habit tracker',     status: 'paused',    priority: 'medium', progress: 48, stack: ['React'],              color: '#64748B', created_at: '', updated_at: '3d ago'  },
  { id: 'mock-4', user_id: '', name: 'Snippet Vault', description: 'Code snippet library',    status: 'active',    priority: 'low',    progress: 88, stack: ['Next.js'],            color: '#3B82F6', created_at: '', updated_at: '5d ago'  },
]

const VALID_STATUSES   = ['active', 'paused', 'completed', 'cancelled']
const VALID_PRIORITIES = ['high', 'medium', 'low']

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

// ── Validation ────────────────────────────────────────────────────────────────
function validateProject(input: {
  name?: string; description?: string; status?: string; priority?: string
  progress?: number; stack?: string[]; color?: string; github_repo?: string
}) {
  if (input.name !== undefined) {
    if (!input.name || input.name.trim().length === 0) throw new Error('Name is required')
    if (input.name.length > 120) throw new Error('Name must be 120 characters or fewer')
  }
  if (input.description !== undefined && input.description.length > 2000)
    throw new Error('Description must be 2000 characters or fewer')
  if (input.status !== undefined && !VALID_STATUSES.includes(input.status))
    throw new Error('Invalid status')
  if (input.priority !== undefined && !VALID_PRIORITIES.includes(input.priority))
    throw new Error('Invalid priority')
  if (input.progress !== undefined) {
    const p = Number(input.progress)
    if (isNaN(p) || p < 0 || p > 100) throw new Error('Progress must be 0–100')
  }
  if (input.stack !== undefined) {
    if (input.stack.length > 15) throw new Error('Maximum 15 stack tags allowed')
    for (const s of input.stack) {
      if (typeof s !== 'string' || s.length > 60) throw new Error('Each stack tag must be 60 characters or fewer')
    }
  }
  if (input.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(input.color))
    throw new Error('Invalid color format')
  if (input.github_repo !== undefined && input.github_repo.length > 200)
    throw new Error('GitHub repo URL must be 200 characters or fewer')
}

export async function getProjects() {
  if (!isConfigured()) return MOCK_PROJECTS
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
  return data && data.length > 0 ? data : []
}

export async function getRecentProjects(limit = 4) {
  if (!isConfigured()) return MOCK_PROJECTS.slice(0, limit)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('projects').select('*').eq('user_id', user.id)
    .order('updated_at', { ascending: false }).limit(limit)
  return data ?? []
}

export async function addProject(input: {
  name: string; description?: string; status?: string; priority?: string
  progress?: number; stack?: string[]; color?: string; github_repo?: string
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  validateProject(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('projects').insert({
    user_id: user.id, ...input, name: input.name.trim(),
  })
  if (error) throw new Error('Failed to add project')
  revalidatePath('/projects')
  revalidatePath('/dashboard')
}

export async function updateProject(id: string, input: {
  name?: string; description?: string; status?: string; priority?: string
  progress?: number; stack?: string[]; color?: string; github_repo?: string
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  if (!id || typeof id !== 'string') throw new Error('Invalid project ID')
  validateProject(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('projects').update(input).eq('id', id).eq('user_id', user.id)
  if (error) throw new Error('Failed to update project')
  revalidatePath('/projects')
  revalidatePath('/dashboard')
}

export async function deleteProject(id: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  if (!id || typeof id !== 'string') throw new Error('Invalid project ID')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error('Failed to delete project')
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
