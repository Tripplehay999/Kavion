import { Building2, Plus, ExternalLink, Eye } from 'lucide-react'

type AcqStatus = 'watching' | 'due-diligence' | 'negotiating' | 'passed' | 'acquired'

const ACQUISITIONS: {
  company: string
  category: string
  url: string
  asking_price: number | null
  revenue: number | null
  profit: number | null
  multiple: number | null
  status: AcqStatus
  notes: string
  added: string
}[] = [
  {
    company:       'Pika.style',
    category:      'Design Tools',
    url:           'pika.style',
    asking_price:  85000,
    revenue:       28000,
    profit:        21000,
    multiple:      4.0,
    status:        'watching',
    notes:         'Clean ARR, growing organic traffic. Worth monitoring.',
    added:         '2d ago',
  },
  {
    company:       'FormBold',
    category:      'DevTools',
    url:           'formbold.com',
    asking_price:  120000,
    revenue:       48000,
    profit:        38000,
    multiple:      3.2,
    status:        'due-diligence',
    notes:         'Requested metrics from seller. Good MoM growth.',
    added:         '5d ago',
  },
  {
    company:       'DontBugMe',
    category:      'Productivity',
    url:           'dontbugme.app',
    asking_price:  45000,
    revenue:       14400,
    profit:        11000,
    multiple:      4.1,
    status:        'passed',
    notes:         'Declining traffic. Not worth the multiple.',
    added:         '1w ago',
  },
  {
    company:       'Clipbot.ai',
    category:      'AI / Video',
    url:           'clipbot.ai',
    asking_price:  null,
    revenue:       null,
    profit:        null,
    multiple:      null,
    status:        'watching',
    notes:         'No financials shared yet. Watching for more data.',
    added:         '1w ago',
  },
  {
    company:       'LogSnag',
    category:      'Monitoring',
    url:           'logsnag.com',
    asking_price:  200000,
    revenue:       72000,
    profit:        54000,
    multiple:      3.7,
    status:        'watching',
    notes:         'Strong revenue, excellent product. Watching valuation.',
    added:         '2w ago',
  },
  {
    company:       'Tinyhost',
    category:      'Hosting',
    url:           'tinyhost.dev',
    asking_price:  30000,
    revenue:       9600,
    profit:        7800,
    multiple:      3.8,
    status:        'negotiating',
    notes:         'In talks. Asking for lower multiple.',
    added:         '3w ago',
  },
]

const STATUS_CONFIG: Record<AcqStatus, { label: string; bg: string; color: string }> = {
  watching:        { label: 'Watching',       bg: 'rgba(99,102,241,0.1)',  color: '#818CF8' },
  'due-diligence': { label: 'Due Diligence',  bg: 'rgba(59,130,246,0.1)',  color: '#60A5FA' },
  negotiating:     { label: 'Negotiating',    bg: 'rgba(245,158,11,0.1)', color: '#FBBF24' },
  passed:          { label: 'Passed',         bg: 'rgba(100,116,139,0.1)', color: '#64748B' },
  acquired:        { label: 'Acquired',       bg: 'rgba(16,185,129,0.1)',  color: '#34D399' },
}

const fmt = (n: number | null, prefix = '$') =>
  n == null ? '—' : `${prefix}${(n / 1000).toFixed(0)}k`

export default function AcquisitionsPage() {
  const watching = ACQUISITIONS.filter(a => a.status === 'watching').length
  const active   = ACQUISITIONS.filter(a => ['due-diligence', 'negotiating'].includes(a.status)).length

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{
            background: 'rgba(249,115,22,0.08)',
            color: '#FB923C',
            border: '1px solid rgba(249,115,22,0.2)',
          }}>
            <Building2 size={12} />
            Acquisitions
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Acquisition Watchlist
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Micro-SaaS and indie products worth buying.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} />
          Add Company
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Tracking',       value: ACQUISITIONS.length, color: 'var(--text-primary)' },
          { label: 'Watching',       value: watching,            color: '#818CF8' },
          { label: 'Active Process', value: active,              color: '#FBBF24' },
          { label: 'Avg Multiple',   value: '3.8×',              color: '#F97316' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '14px 20px', flex: 1 }}>
            <div className="num" style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Category</th>
              <th>Asking</th>
              <th>Revenue</th>
              <th>Profit</th>
              <th>Multiple</th>
              <th>Status</th>
              <th>Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {ACQUISITIONS.map((a) => {
              const sc = STATUS_CONFIG[a.status]
              return (
                <tr key={a.company}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.company}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.url}</div>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: 'rgba(249,115,22,0.1)',
                      color: '#FB923C',
                      fontSize: 11,
                    }}>
                      {a.category}
                    </span>
                  </td>
                  <td>
                    <span className="num" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {fmt(a.asking_price)}
                    </span>
                  </td>
                  <td>
                    <span className="num" style={{ color: '#34D399' }}>{fmt(a.revenue)}</span>
                  </td>
                  <td>
                    <span className="num" style={{ color: '#22C55E' }}>{fmt(a.profit)}</span>
                  </td>
                  <td>
                    <span className="num" style={{
                      color: a.multiple == null ? 'var(--text-muted)' : a.multiple < 3 ? '#22C55E' : a.multiple < 5 ? '#FBBF24' : '#F87171',
                      fontWeight: 600,
                    }}>
                      {a.multiple == null ? '—' : `${a.multiple}×`}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={{ maxWidth: 180 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {a.notes}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" title="View details">
                        <Eye size={12} />
                      </button>
                      <button className="btn btn-ghost btn-sm" title="Open site">
                        <ExternalLink size={12} />
                      </button>
                    </div>
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
