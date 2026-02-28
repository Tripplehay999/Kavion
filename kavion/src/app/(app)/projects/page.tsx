import { FolderKanban, Plus, ExternalLink } from 'lucide-react'

type Status = 'active' | 'paused' | 'completed' | 'archived'
type Priority = 'low' | 'medium' | 'high' | 'critical'

const PROJECTS: {
  name: string
  description: string
  status: Status
  priority: Priority
  progress: number
  stack: string[]
  updated: string
}[] = [
  {
    name: 'Kavion OS',
    description: 'Personal command center — the app you\'re building right now',
    status: 'active',
    priority: 'high',
    progress: 35,
    stack: ['Next.js', 'Supabase', 'Tailwind'],
    updated: '2h ago',
  },
  {
    name: 'Revenue API',
    description: 'Unified revenue aggregation layer for SaaS products',
    status: 'active',
    priority: 'high',
    progress: 72,
    stack: ['Node.js', 'Postgres', 'Stripe'],
    updated: '1d ago',
  },
  {
    name: 'Habit Engine',
    description: 'Streak tracking backend with smart reminders',
    status: 'paused',
    priority: 'medium',
    progress: 48,
    stack: ['Python', 'FastAPI', 'Redis'],
    updated: '3d ago',
  },
  {
    name: 'Snippet Vault',
    description: 'Private code snippet library with full-text search',
    status: 'active',
    priority: 'medium',
    progress: 88,
    stack: ['Next.js', 'Supabase'],
    updated: '5d ago',
  },
  {
    name: 'Acquisition Radar',
    description: 'Automated watchlist scraper for micro-SaaS deals',
    status: 'active',
    priority: 'low',
    progress: 20,
    stack: ['Playwright', 'Supabase', 'Cron'],
    updated: '1w ago',
  },
  {
    name: 'YouTube Scheduler',
    description: 'End-to-end automation for YT content pipeline',
    status: 'completed',
    priority: 'low',
    progress: 100,
    stack: ['Python', 'YouTube API'],
    updated: '2w ago',
  },
]

const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string }> = {
  active:    { label: 'Active',     bg: 'rgba(34,197,94,0.1)',   color: '#22C55E' },
  paused:    { label: 'Paused',     bg: 'rgba(251,191,36,0.1)',  color: '#FBBF24' },
  completed: { label: 'Completed',  bg: 'rgba(99,102,241,0.1)',  color: '#818CF8' },
  archived:  { label: 'Archived',   bg: 'rgba(100,116,139,0.1)', color: '#64748B' },
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low:      { label: 'Low',      color: '#64748B' },
  medium:   { label: 'Medium',   color: '#FBBF24' },
  high:     { label: 'High',     color: '#F97316' },
  critical: { label: 'Critical', color: '#EF4444' },
}

const stats = [
  { label: 'Total',     value: 6, color: 'var(--text-primary)' },
  { label: 'Active',    value: 4, color: '#22C55E' },
  { label: 'Paused',    value: 1, color: '#FBBF24' },
  { label: 'Completed', value: 1, color: '#818CF8' },
]

export default function ProjectsPage() {
  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{
            background: 'rgba(59,130,246,0.08)',
            color: '#60A5FA',
            border: '1px solid rgba(59,130,246,0.2)',
          }}>
            <FolderKanban size={12} />
            Projects
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Project Tracker
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Everything you&apos;re building, in one place.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} />
          New Project
        </button>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ padding: '14px 20px', flex: 1 }}>
            <div className="num" style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 3 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Priority</th>
              <th style={{ width: 160 }}>Progress</th>
              <th>Stack</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((p) => {
              const sc = STATUS_CONFIG[p.status]
              const pc = PRIORITY_CONFIG[p.priority]
              return (
                <tr key={p.name}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {p.description}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.color, display: 'inline-block' }} />
                      {sc.label}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: pc.color, fontWeight: 500 }}>
                      {pc.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-track" style={{ flex: 1 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${p.progress}%`,
                            background: p.status === 'completed' ? '#818CF8' : '#3B82F6',
                          }}
                        />
                      </div>
                      <span className="num" style={{ fontSize: 11, color: 'var(--text-muted)', width: 30, textAlign: 'right' }}>
                        {p.progress}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {p.stack.map((t) => (
                        <span key={t} className="badge" style={{
                          background: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-muted)',
                          fontSize: 11,
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                      {p.updated}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm">
                      <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}
