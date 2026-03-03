'use server'

import { createClient } from '@/lib/supabase/server'

export interface ActivityItem {
  text: string
  time: string
  dot:  string
  ts:   string   // ISO string for sorting
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d}d ago`
  return `${Math.floor(d / 7)}w ago`
}

function trunc(s: string, max = 30): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

const MOCK: ActivityItem[] = [
  { text: 'Project "Revenue API" updated',         time: '2h ago', dot: '#3B82F6', ts: '' },
  { text: 'New idea: "AI Changelog Writer" added', time: '5h ago', dot: '#F59E0B', ts: '' },
  { text: 'Habit "Deep Work" completed',           time: '6h ago', dot: '#EC4899', ts: '' },
  { text: 'Snippet "useDebounce" saved',           time: '1d ago', dot: '#06B6D4', ts: '' },
  { text: 'Todo "Launch beta" completed',          time: '2d ago', dot: '#8B5CF6', ts: '' },
]

export async function getRecentActivity(limit = 10): Promise<ActivityItem[]> {
  if (!isConfigured()) return MOCK

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const uid = user.id

  const [
    projects,
    ideas,
    snippets,
    habitLogs,
    todos,
    videos,
    acquisitions,
  ] = await Promise.all([
    supabase.from('projects')
      .select('name, color, created_at, updated_at')
      .eq('user_id', uid)
      .order('updated_at', { ascending: false })
      .limit(4),

    supabase.from('ideas')
      .select('title, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(3),

    supabase.from('snippets')
      .select('title, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(3),

    // Join habits table to get name + color via the habit_id FK
    supabase.from('habit_logs')
      .select('date, done, habits(name, color)')
      .eq('user_id', uid)
      .eq('done', true)
      .order('date', { ascending: false })
      .limit(4),

    supabase.from('workspace_blocks')
      .select('type, content, checked, created_at, updated_at')
      .eq('user_id', uid)
      .eq('type', 'todo')
      .order('updated_at', { ascending: false })
      .limit(3),

    supabase.from('youtube_videos')
      .select('title, stage, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(3),

    supabase.from('acquisitions')
      .select('name, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const items: ActivityItem[] = []

  // Projects — treat as "updated" if updated_at differs from created_at
  for (const p of projects.data ?? []) {
    const isEdit = p.updated_at && p.created_at && p.updated_at !== p.created_at
    items.push({
      text: isEdit
        ? `Project "${trunc(p.name)}" updated`
        : `Project "${trunc(p.name)}" created`,
      time: timeAgo(p.updated_at ?? p.created_at),
      dot:  p.color ?? '#3B82F6',
      ts:   p.updated_at ?? p.created_at,
    })
  }

  // Ideas
  for (const idea of ideas.data ?? []) {
    items.push({
      text: `New idea: "${trunc(idea.title)}" added`,
      time: timeAgo(idea.created_at),
      dot:  '#F59E0B',
      ts:   idea.created_at,
    })
  }

  // Snippets
  for (const s of snippets.data ?? []) {
    items.push({
      text: `Snippet "${trunc(s.title)}" saved`,
      time: timeAgo(s.created_at),
      dot:  '#06B6D4',
      ts:   s.created_at,
    })
  }

  // Habit completions — habit_logs has no created_at, use date as noon proxy
  for (const log of habitLogs.data ?? []) {
    const habit = log.habits as unknown as { name: string; color: string } | null
    if (!habit) continue
    const ts = new Date(log.date + 'T12:00:00').toISOString()
    items.push({
      text: `Habit "${trunc(habit.name)}" completed`,
      time: timeAgo(ts),
      dot:  habit.color ?? '#EC4899',
      ts,
    })
  }

  // Workspace todos
  for (const block of todos.data ?? []) {
    const label = block.content ? `"${trunc(block.content, 26)}"` : 'item'
    const ts = block.updated_at ?? block.created_at
    items.push({
      text: block.checked
        ? `Todo ${label} completed`
        : `Todo ${label} added`,
      time: timeAgo(ts),
      dot:  '#8B5CF6',
      ts,
    })
  }

  // YouTube pipeline
  for (const v of videos.data ?? []) {
    items.push({
      text: `"${trunc(v.title)}" added to pipeline`,
      time: timeAgo(v.created_at),
      dot:  '#EF4444',
      ts:   v.created_at,
    })
  }

  // Acquisitions watchlist
  for (const acq of acquisitions.data ?? []) {
    items.push({
      text: `"${trunc(acq.name)}" added to watchlist`,
      time: timeAgo(acq.created_at),
      dot:  '#F97316',
      ts:   acq.created_at,
    })
  }

  return items
    .filter(i => !!i.ts)
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, limit)
}
