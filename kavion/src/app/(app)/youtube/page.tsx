import { Youtube, Plus, ArrowUp, Eye, ThumbsUp, Users } from 'lucide-react'

type VideoStatus = 'idea' | 'scripting' | 'recording' | 'editing' | 'scheduled' | 'published'

const CHANNEL = {
  name:         '@kavionbuilds',
  subscribers:  12400,
  total_views:  842000,
  videos:       87,
  sub_growth:   '+340 this month',
  view_growth:  '+28%',
}

const VIDEOS: { title: string; status: VideoStatus; views?: number; published?: string }[] = [
  { title: 'I built my own OS in Next.js',                    status: 'published',  views: 48200, published: 'Feb 14' },
  { title: 'How I track $12k MRR as a solo founder',         status: 'published',  views: 31500, published: 'Feb 07' },
  { title: 'My full Supabase auth setup (2025)',              status: 'scheduled',  published: 'Mar 01' },
  { title: 'Building a habit tracker that actually works',    status: 'editing'   },
  { title: 'Acquisition diaries: how I found a $45k deal',   status: 'recording' },
  { title: 'Tailwind v4 deep dive for builders',             status: 'scripting' },
  { title: '5 code snippets I use every project',            status: 'scripting' },
  { title: 'From idea to $1k MRR in 30 days',               status: 'idea'      },
  { title: 'Why I track my servers from a dashboard',        status: 'idea'      },
]

const STATUS_CONFIG: Record<VideoStatus, { label: string; bg: string; color: string; order: number }> = {
  idea:       { label: 'Idea',       bg: 'rgba(100,116,139,0.1)',  color: '#64748B', order: 0 },
  scripting:  { label: 'Scripting',  bg: 'rgba(245,158,11,0.1)',  color: '#FBBF24', order: 1 },
  recording:  { label: 'Recording',  bg: 'rgba(249,115,22,0.1)',  color: '#FB923C', order: 2 },
  editing:    { label: 'Editing',    bg: 'rgba(59,130,246,0.1)',  color: '#60A5FA', order: 3 },
  scheduled:  { label: 'Scheduled',  bg: 'rgba(124,58,237,0.1)', color: '#A78BFA', order: 4 },
  published:  { label: 'Published',  bg: 'rgba(34,197,94,0.1)',   color: '#22C55E', order: 5 },
}

const PIPELINE_STAGES: VideoStatus[] = ['idea', 'scripting', 'recording', 'editing', 'scheduled']

function fmtNum(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function YouTubePage() {
  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{
            background: 'rgba(239,68,68,0.08)',
            color: '#F87171',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <Youtube size={12} />
            YouTube
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            YouTube Automation
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            {CHANNEL.name} · Content pipeline & analytics
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} />
          New Video Idea
        </button>
      </div>

      {/* ── Channel Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Subscribers', value: fmtNum(CHANNEL.subscribers), sub: CHANNEL.sub_growth,   icon: Users,    color: '#EF4444' },
          { label: 'Total Views',  value: fmtNum(CHANNEL.total_views), sub: CHANNEL.view_growth,  icon: Eye,      color: '#F97316' },
          { label: 'Videos',       value: CHANNEL.videos,              sub: '4 in pipeline',      icon: Youtube,  color: '#FBBF24' },
          { label: 'Avg Views',    value: fmtNum(Math.round(CHANNEL.total_views / CHANNEL.videos)), sub: 'per video', icon: ThumbsUp, color: '#FB923C' },
        ].map((s) => (
          <div key={s.label} className="card stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {s.label}
              </span>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: `${s.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={14} color={s.color} strokeWidth={2} />
              </div>
            </div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 7 }}>
              {s.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              <ArrowUp size={11} color="#22C55E" />
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Content Pipeline (Kanban) ── */}
      <div className="card" style={{ padding: '0 0 4px', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Content Pipeline</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 0,
          padding: 16,
        }}>
          {PIPELINE_STAGES.map((stage, si) => {
            const sc = STATUS_CONFIG[stage]
            const videos = VIDEOS.filter(v => v.status === stage)
            return (
              <div key={stage} style={{
                borderRight: si < PIPELINE_STAGES.length - 1 ? '1px solid var(--border)' : 'none',
                padding: '0 12px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}>
                  <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                    {sc.label}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {videos.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {videos.length === 0 ? (
                    <div style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      padding: '10px 0',
                      textAlign: 'center',
                    }}>
                      —
                    </div>
                  ) : (
                    videos.map((v) => (
                      <div
                        key={v.title}
                        style={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          padding: '10px 12px',
                          fontSize: 12.5,
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45,
                          cursor: 'pointer',
                          transition: 'border-color 140ms',
                        }}
                      >
                        {v.title}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Published Videos ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Published</h2>
          <a href="#" style={{ fontSize: 12, color: 'var(--violet-light)', textDecoration: 'none' }}>View all →</a>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Published</th>
              <th>Views</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {VIDEOS.filter(v => v.status === 'published' || v.status === 'scheduled').map((v) => {
              const sc = STATUS_CONFIG[v.status]
              return (
                <tr key={v.title}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{v.title}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
                      {v.published ?? '—'}
                    </span>
                  </td>
                  <td>
                    <span className="num" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {v.views != null ? fmtNum(v.views) : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
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
