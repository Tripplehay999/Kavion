import { Target } from 'lucide-react'
import { getAllHabitsWithLogs, getHabitStreak } from '@/app/actions/habits'
import HabitsClient from '@/components/habits/HabitsClient'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

const MOCK_HABITS = [
  { id: 'mock-h1', name: 'Deep Work (2h)',  color: '#7C3AED', sort_order: 0, created_at: '' },
  { id: 'mock-h2', name: 'Exercise',         color: '#EC4899', sort_order: 1, created_at: '' },
  { id: 'mock-h3', name: 'Read (30 min)',    color: '#3B82F6', sort_order: 2, created_at: '' },
  { id: 'mock-h4', name: 'Cold Shower',      color: '#06B6D4', sort_order: 3, created_at: '' },
  { id: 'mock-h5', name: 'Review Goals',     color: '#F59E0B', sort_order: 4, created_at: '' },
  { id: 'mock-h6', name: 'No Social Media',  color: '#10B981', sort_order: 5, created_at: '' },
  { id: 'mock-h7', name: 'Journal',          color: '#F97316', sort_order: 6, created_at: '' },
]

const today = new Date().toISOString().split('T')[0]
const MOCK_LOGS = MOCK_HABITS.flatMap((h, hi) =>
  Array.from({ length: hi < 2 ? 14 : hi < 4 ? 9 : 5 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return { habit_id: h.id, date: d.toISOString().split('T')[0], done: true }
  })
)

export default async function HabitsPage() {
  const live = isConfigured()

  const { habits, logs } = live
    ? await getAllHabitsWithLogs(28)
    : { habits: MOCK_HABITS, logs: MOCK_LOGS }

  const streak = live ? await getHabitStreak() : 14

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{ background: 'rgba(236,72,153,0.08)', color: '#F472B6', border: '1px solid rgba(236,72,153,0.2)' }}>
            <Target size={12} />
            Habits
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Habit Tracker
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Consistency compounds. Every day counts.
          </p>
        </div>
      </div>

      <HabitsClient habits={habits} logs={logs} streak={streak} isLive={live} />

    </div>
  )
}
