'use server'

import { createClient } from '@/lib/supabase/server'
import { getSetting } from '@/app/actions/settings'
import { revalidatePath } from 'next/cache'

export interface GithubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  private: boolean
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  pushed_at: string
  topics: string[]
}

async function getToken(): Promise<string | null> {
  return await getSetting('GITHUB_ACCESS_TOKEN') || process.env.GITHUB_ACCESS_TOKEN || null
}

export async function getGithubStatus(): Promise<{ connected: boolean; username: string | null; avatarUrl: string | null }> {
  const token = await getToken()
  if (!token) return { connected: false, username: null, avatarUrl: null }

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
      cache: 'no-store',
    })
    if (!res.ok) return { connected: false, username: null, avatarUrl: null }
    const user = await res.json()
    return { connected: true, username: user.login, avatarUrl: user.avatar_url }
  } catch {
    return { connected: false, username: null, avatarUrl: null }
  }
}

export async function getGithubRepos(): Promise<{ repos: GithubRepo[]; error: string | null }> {
  const token = await getToken()
  if (!token) return { repos: [], error: 'not_connected' }

  try {
    const res = await fetch(
      'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner',
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
        cache: 'no-store',
      }
    )
    if (!res.ok) {
      const err = await res.json()
      return { repos: [], error: err.message ?? 'GitHub API error' }
    }
    const repos: GithubRepo[] = await res.json()
    return { repos, error: null }
  } catch (e) {
    return { repos: [], error: e instanceof Error ? e.message : 'Failed to fetch repos' }
  }
}

export async function disconnectGithub() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  await supabase.from('user_settings').delete().eq('user_id', user.id).eq('key', 'GITHUB_ACCESS_TOKEN')
  revalidatePath('/projects')
  revalidatePath('/settings')
}
