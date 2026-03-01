import { FolderKanban, TrendingUp, Target, Server, ArrowUp, Plus, Clock, Zap } from 'lucide-react'
import Link from 'next/link'
import { getHabitsWithToday, getHabitStreak } from '@/app/actions/habits'
import { getRecentProjects, getProjectStats } from '@/app/actions/projects'
import { getTotalMrr } from '@/app/actions/revenue'
import { getServers } from '@/app/actions/servers'
import HabitsWidget from '@/components/dashboard/HabitsWidget'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

const MOCK_ACTIVITY = [
  { text: 'Revenue API reached 72% completion',     time: '2h ago', dot: '#3B82F6' },
  { text: 'Server prod-02 response time spiked',    time: '4h ago', dot: '#FBBF24' },
  { text: 'New idea added: "AI Changelog Writer"',  time: '6h ago', dot: '#F59E0B' },
  { text: 'Snippet: useDebounce hook saved',         time: '1d ago', dot: '#06B6D4' },
  { text: 'Acquired watchlist: Pika.style added',   time: '2d ago', dot: '#F97316' },
]

export default async function DashboardPage() {
  const live = isConfigured()

  const [habits, projects, mrrData, servers, streak, projectStats] = await Promise.all([
    getHabitsWithToday(),
    getRecentProjects(4),
    getTotalMrr(),
    getServers(),
    getHabitStreak(),
    getProjectStats(),
  ])

  const onlineServers = servers.filter(s => s.status === 'online').length
  const totalServers  = servers.length || 9
  const displayServers = live ? `${onlineServers} / ${totalServers}` : '8 / 9'
  const degraded = servers.some(s => s.status === 'degraded')

  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const stats = [
    { label: 'Active Projects', value: live ? String(projectStats.active) : '6',          sub: `${live ? projectStats.total : 8} total`,     icon: FolderKanban, trend: null, color: '#3B82F6', href: '/projects' },
    { label: 'Monthly Revenue', value: live ? `$${mrrData.mrr.toLocaleString()}` : '$12,400', sub: `+${live ? mrrData.growth : 18}% vs last month`, icon: TrendingUp, trend: 'up', color: '#10B981', href: '/revenue' },
    { label: 'Habit Streak',    value: `${live ? streak : 14} days`,                          sub: 'Keep it going 🔥',                               icon: Target, trend: 'up',  color: '#EC4899', href: '/habits' },
    { label: 'Servers Online',  value: displayServers,                                        sub: degraded ? '⚠ 1 degraded' : 'All healthy',         icon: Server, trend: null,  color: '#22C55E', href: '/servers' },
  ]

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-accent" style={{ background: 'var(--violet-dim)', color: 'var(--violet-light)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <Zap size={12} /> Command Center
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Good morning, Kavion
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            {dayName}, {dateStr} · {live ? `${streak}-day streak` : '14-day streak'} on track
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} /> Quick Add
        </button>
      </div>

      {/* ── Stats Row (clickable) ── */}
      <div className="grid-cols-4" style={{ marginBottom: 22 }}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div className="card stat-card" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</span>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={14} color={s.color} strokeWidth={2} />
                </div>
              </div>
              <div className="num" style={{ fontSize: 27, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.04em', marginBottom: 7 }}>
                {s.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                {s.trend === 'up' && <ArrowUp size={11} color="#22C55E" />}
                {s.sub}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid-cols-2" style={{ marginBottom: 16 }}>

        {/* Recent Projects */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Projects</h2>
            <Link href="/projects" style={{ fontSize: 12, color: 'var(--violet-light)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {projects.map((p, i) => (
            <Link key={p.id} href="/projects" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ padding: '13px 20px', borderBottom: i < projects.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="num" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.progress}%</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)' }}>
                      <Clock size={10} />{p.updated_at}
                    </div>
                  </div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${p.progress}%`, background: p.color ?? '#3B82F6' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Habits — interactive client component */}
        <HabitsWidget habits={habits} isLive={live} />
      </div>

      {/* ── Activity Feed ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Activity</h2>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last 48h</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {MOCK_ACTIVITY.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px', borderBottom: i < MOCK_ACTIVITY.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.dot, boxShadow: `0 0 6px ${a.dot}`, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{a.text}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
