import { Lightbulb, Plus, Star } from 'lucide-react'

type IdeaStatus = 'exploring' | 'building' | 'launched' | 'shelved' | 'validated'

const IDEAS: {
  name: string
  tagline: string
  status: IdeaStatus
  score: number
  tags: string[]
  added: string
}[] = [
  {
    name: 'AI Changelog Writer',
    tagline: 'Auto-generates changelogs from git commits using GPT-4',
    status: 'building',
    score: 8,
    tags: ['AI', 'DevTools', 'SaaS'],
    added: '3d ago',
  },
  {
    name: 'Micro-SaaS Radar',
    tagline: 'Aggregates acquisition listings from Acquire.com, Flippa, MicroAcquire',
    status: 'validated',
    score: 9,
    tags: ['Automation', 'SaaS', 'Acquisitions'],
    added: '1w ago',
  },
  {
    name: 'Habit OS',
    tagline: 'Minimalist habit tracker with streak visualisation + iOS widget',
    status: 'exploring',
    score: 7,
    tags: ['Mobile', 'Productivity'],
    added: '2w ago',
  },
  {
    name: 'Code Review Copilot',
    tagline: 'GitHub bot that reviews PRs and leaves AI-powered inline comments',
    status: 'exploring',
    score: 8,
    tags: ['AI', 'DevTools', 'GitHub'],
    added: '2w ago',
  },
  {
    name: 'Startup Name Generator',
    tagline: 'Generates brandable names + checks domain availability instantly',
    status: 'shelved',
    score: 5,
    tags: ['Tools', 'Branding'],
    added: '1m ago',
  },
  {
    name: 'Newsletter Analytics',
    tagline: 'Cross-platform analytics for Substack, Beehiiv, Kit newsletters',
    status: 'exploring',
    score: 7,
    tags: ['Analytics', 'Creator', 'SaaS'],
    added: '1m ago',
  },
  {
    name: 'Kavion OS',
    tagline: 'Personal command center — projects, revenue, habits in one app',
    status: 'launched',
    score: 10,
    tags: ['ProductivityOS', 'SaaS', 'Personal'],
    added: '2d ago',
  },
  {
    name: 'Open Source to SaaS',
    tagline: 'Identifies under-monetised OSS projects and packages them as SaaS',
    status: 'exploring',
    score: 6,
    tags: ['OSS', 'SaaS', 'Research'],
    added: '3w ago',
  },
]

const STATUS_CONFIG: Record<IdeaStatus, { label: string; bg: string; color: string }> = {
  exploring: { label: 'Exploring',  bg: 'rgba(99,102,241,0.1)',  color: '#818CF8' },
  building:  { label: 'Building',   bg: 'rgba(59,130,246,0.1)',  color: '#60A5FA' },
  validated: { label: 'Validated',  bg: 'rgba(16,185,129,0.1)',  color: '#34D399' },
  launched:  { label: 'Launched',   bg: 'rgba(124,58,237,0.1)',  color: '#A78BFA' },
  shelved:   { label: 'Shelved',    bg: 'rgba(100,116,139,0.1)', color: '#64748B' },
}

const TAG_COLORS: Record<string, string> = {
  AI:         '#7C3AED',
  DevTools:   '#3B82F6',
  SaaS:       '#10B981',
  Automation: '#F59E0B',
  Mobile:     '#EC4899',
  Analytics:  '#06B6D4',
  Creator:    '#F97316',
  OSS:        '#64748B',
}

const stats = [
  { label: 'Total Ideas',  value: IDEAS.length, color: 'var(--text-primary)' },
  { label: 'Exploring',    value: IDEAS.filter(i => i.status === 'exploring').length,  color: '#818CF8' },
  { label: 'Building',     value: IDEAS.filter(i => i.status === 'building').length,   color: '#60A5FA' },
  { label: 'Validated',    value: IDEAS.filter(i => i.status === 'validated').length,  color: '#34D399' },
]

export default function IdeasPage() {
  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{
            background: 'rgba(245,158,11,0.08)',
            color: '#FBBF24',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <Lightbulb size={12} />
            Ideas
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Startup Ideas Vault
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Every idea captured, scored, and tracked.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} />
          New Idea
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ padding: '14px 20px', flex: 1 }}>
            <div className="num" style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 14,
      }}>
        {IDEAS.sort((a, b) => b.score - a.score).map((idea) => {
          const sc = STATUS_CONFIG[idea.status]
          return (
            <div
              key={idea.name}
              className="card"
              style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                  {sc.label}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 12,
                  color: '#FBBF24',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                }}>
                  <Star size={11} fill="#FBBF24" strokeWidth={0} />
                  {idea.score}/10
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5, letterSpacing: '-0.02em' }}>
                  {idea.name}
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {idea.tagline}
                </p>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {idea.tags.map((tag) => (
                  <span key={tag} className="badge" style={{
                    background: `${TAG_COLORS[tag] ?? '#64748B'}18`,
                    color: TAG_COLORS[tag] ?? '#64748B',
                    fontSize: 11,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {idea.added}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
