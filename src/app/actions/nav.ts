'use server'

import { createClient } from '@/lib/supabase/server'

export interface NavCounts {
  projects: number
  ideas: number
  habits: number
  snippets: number
  servers: number
}

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

const ZERO: NavCounts = { projects: 0, ideas: 0, habits: 0, snippets: 0, servers: 0 }

export async function getNavCounts(): Promise<NavCounts> {
  if (!isConfigured()) return ZERO
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return ZERO

    const [projects, ideas, habits, snippets, servers] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('ideas').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('habits').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('snippets').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('servers').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    return {
      projects: projects.count ?? 0,
      ideas:    ideas.count    ?? 0,
      habits:   habits.count   ?? 0,
      snippets: snippets.count ?? 0,
      servers:  servers.count  ?? 0,
    }
  } catch {
    return ZERO
  }
}
