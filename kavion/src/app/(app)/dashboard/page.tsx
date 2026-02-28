import {
  FolderKanban,
  TrendingUp,
  Target,
  Server,
  ArrowUp,
  Plus,
  Clock,
  Zap,
} from 'lucide-react'

const stats = [
  {
    label: 'Active Projects',
    value: '6',
    sub: '2 due this week',
    icon: FolderKanban,
    trend: null,
    color: '#3B82F6',
  },
  {
    label: 'Monthly Revenue',
    value: '$12,400',
    sub: '+18% vs last month',
    icon: TrendingUp,
    trend: 'up',
    color: '#10B981',
  },
  {
    label: 'Habit Streak',
    value: '14 days',
    sub: 'Best: 21 days',
    icon: Target,
    trend: 'up',
    color: '#EC4899',
  },
  {
    label: 'Servers Online',
    value: '8 / 9',
    sub: '1 degraded',
    icon: Server,
    trend: null,
    color: '#22C55E',
  },
]

const recentProjects = [
  { name: 'Kavion OS',      status: 'active',    progress: 35, color: '#3B82F6', updated: '2h ago'  },
  { name: 'Revenue API',    status: 'active',    progress: 72, color: '#3B82F6', updated: '1d ago'  },
  { name: 'Habit Engine',   status: 'paused',    progress: 48, color: '#64748B', updated: '3d ago'  },
  { name: 'Snippet Vault',  status: 'active',    progress: 88, color: '#3B82F6', updated: '5d ago'  },
]

const habits = [
  { name: 'Deep Work (2h)',  done: true  },
  { name: 'Exercise',        done: true  },
  { name: 'Read (30 min)',   done: false },
  { name: 'Cold Shower',     done: false },
  { name: 'Review Goals',    done: false },
]

const activity = [
  { text: 'Revenue API reached 72% completion',        time: '2h ago',  dot: '#3B82F6' },
  { text: 'Server prod-02 response time spiked',       time: '4h ago',  dot: '#FBBF24' },
  { text: 'New idea added: "AI Changelog Writer"',     time: '6h ago',  dot: '#F59E0B' },
  { text: 'Snippet: useDebounce hook saved',           time: '1d ago',  dot: '#06B6D4' },
  { text: 'Acquired watchlist: Pika.style added',      time: '2d ago',  dot: '#F97316' },
]

export default function DashboardPage() {
  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-accent" style={{
            background: 'var(--violet-dim)',
            color: 'var(--violet-light)',
            border: '1px solid rgba(124,58,237,0.2)',
          }}>
            <Zap size={12} />
            Command Center
          </div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}>
            Good morning, Kavion
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Thursday, Feb 27 · 14-day streak on track
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} />
          Quick Add
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
        marginBottom: 22,
      }}>
        {stats.map((s) => (
          <div key={s.label} className="card stat-card">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}>
              <span style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                {s.label}
              </span>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: `${s.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <s.icon size={14} color={s.color} strokeWidth={2} />
              </div>
            </div>
            <div className="num" style={{
              fontSize: 27,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.04em',
              marginBottom: 7,
            }}>
              {s.value}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}>
              {s.trend === 'up' && <ArrowUp size={11} color="#22C55E" />}
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Recent Projects */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Projects
            </h2>
            <a href="/projects" style={{
              fontSize: 12,
              color: 'var(--violet-light)',
              textDecoration: 'none',
            }}>
              View all →
            </a>
          </div>
          {recentProjects.map((p, i) => (
            <div key={p.name} style={{
              padding: '13px 20px',
              borderBottom: i < recentProjects.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {p.name}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span className="num" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {p.progress}%
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                  }}>
                    <Clock size={10} />
                    {p.updated}
                  </div>
                </div>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${p.progress}%`, background: p.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Today's Habits */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
          }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
              Today&apos;s Habits
            </h2>
            <span className="num" style={{
              fontSize: 12,
              color: '#EC4899',
              background: 'rgba(236,72,153,0.1)',
              padding: '2px 8px',
              borderRadius: 99,
            }}>
              2 / 5
            </span>
          </div>
          {habits.map((h, i) => (
            <div key={h.name} style={{
              padding: '12px 20px',
              borderBottom: i < habits.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
            }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                flexShrink: 0,
                background: h.done ? '#EC4899' : 'transparent',
                border: h.done ? '2px solid #EC4899' : '2px solid var(--border-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms',
              }}>
                {h.done && (
                  <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: 1 }}>✓</span>
                )}
              </div>
              <span style={{
                fontSize: 13.5,
                color: h.done ? 'var(--text-muted)' : 'var(--text-secondary)',
                textDecoration: h.done ? 'line-through' : 'none',
              }}>
                {h.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity Feed ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
            Recent Activity
          </h2>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last 48h</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activity.map((a, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '11px 20px',
              borderBottom: i < activity.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: a.dot,
                boxShadow: `0 0 6px ${a.dot}`,
                flexShrink: 0,
              }} />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>
                {a.text}
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                {a.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
