import { Building2, Plus, ExternalLink } from 'lucide-react'

type AcqStatus = 'watching' | 'due-diligence' | 'negotiating' | 'passed' | 'acquired'

const WATCHLIST: {
  company: string; category: string; url: string; asking_price: number | null;
  revenue: number | null; profit: number | null; multiple: number | null;
  status: AcqStatus; notes: string; added: string
}[] = [
  { company: 'Pika.style',    category: 'Design Tools',   url: 'pika.style',   asking_price: 45000,  revenue: 3200,  profit: 1800, multiple: 25, status: 'watching',       notes: 'Good retention, niche CSS tools',           added: 'Jan 12' },
  { company: 'FormFlow.io',   category: 'SaaS Form',      url: 'formflow.io',  asking_price: 120000, revenue: 8400,  profit: 5100, multiple: 23, status: 'due-diligence',  notes: 'Solid recurring revenue, churn unclear',    added: 'Jan 28' },
  { company: 'DevPing',       category: 'Dev Tools',      url: 'devping.io',   asking_price: 18000,  revenue: 900,   profit: 700,  multiple: 20, status: 'watching',       notes: 'Small but sticky uptime monitoring niche',  added: 'Feb 02' },
  { company: 'LogoAI',        category: 'AI Tools',       url: 'logoai.io',    asking_price: 280000, revenue: 18000, profit: 9000, multiple: 31, status: 'passed',         notes: 'Too high multiple, crowded market',         added: 'Feb 08' },
  { company: 'ShipKit.dev',   category: 'Dev Boilerplate',url: 'shipkit.dev',  asking_price: 65000,  revenue: 4200,  profit: 3100, multiple: 21, status: 'negotiating',    notes: 'Strong community, Next.js focused',         added: 'Feb 15' },
]

const STATUS_CONFIG: Record<AcqStatus, { label: string; bg: string; color: string }> = {
  watching:        { label: 'Watching',      bg: 'rgba(96,165,250,0.10)',  color: '#60A5FA' },
  'due-diligence': { label: 'Due Diligence', bg: 'rgba(251,191,36,0.10)', color: '#FBBF24' },
  negotiating:     { label: 'Negotiating',   bg: 'rgba(167,139,250,0.10)',color: '#A78BFA' },
  passed:          { label: 'Passed',        bg: 'rgba(100,116,139,0.10)',color: '#64748B' },
  acquired:        { label: 'Acquired',      bg: 'rgba(34,197,94,0.10)',  color: '#22C55E' },
}

// Sample TrustMRR-style listings
// Add TRUSTMRR_API_KEY to .env.local for live data
const TRUSTMRR_LISTINGS = [
  { name: 'Newsletter SaaS', mrr: 2800, profit: 1900, asking: 67200,  multiple: 24, category: 'Newsletter'    },
  { name: 'API Proxy Tool',  mrr: 1400, profit: 1100, asking: 28600,  multiple: 26, category: 'Developer'     },
  { name: 'SEO Dashboard',   mrr: 5200, profit: 3800, asking: 136800, multiple: 36, category: 'SEO/Marketing' },
  { name: 'Micro SaaS CRM',  mrr: 3600, profit: 2700, asking: 86400,  multiple: 32, category: 'CRM'           },
  { name: 'Email Validator', mrr: 900,  profit: 750,  asking: 18000,  multiple: 24, category: 'Email Tools'   },
  { name: 'Link Shortener+', mrr: 1800, profit: 1400, asking: 39600,  multiple: 28, category: 'Utilities'     },
]

export default function AcquisitionsPage() {
  const watching   = WATCHLIST.filter(a => a.status === 'watching').length
  const pipeline   = WATCHLIST.filter(a => a.status === 'due-diligence' || a.status === 'negotiating').length
  const totalValue = WATCHLIST.reduce((s, a) => s + (a.asking_price ?? 0), 0)
  const avgMult    = Math.round(
    WATCHLIST.filter(a => a.multiple).reduce((s, a) => s + (a.multiple ?? 0), 0) /
    WATCHLIST.filter(a => a.multiple).length
  )

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{ background: 'rgba(249,115,22,0.08)', color: '#FB923C', border: '1px solid rgba(249,115,22,0.2)' }}>
            <Building2 size={12} /> Acquisitions
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Acquisition Radar
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>Watchlist + TrustMRR live listings below.</p>
        </div>
        <button className="btn btn-primary"><Plus size={14} /> Add to Watchlist</button>
      </div>

      {/* ── Stats ── */}
      <div className="grid-cols-4" style={{ marginBottom: 22 }}>
        {[
          { label: 'Watching',       value: String(watching),                          color: '#60A5FA' },
          { label: 'In Pipeline',    value: String(pipeline),                          color: '#FBBF24' },
          { label: 'Watchlist Value',value: `$${(totalValue / 1000).toFixed(0)}k`,     color: '#F97316' },
          { label: 'Avg Multiple',   value: `${avgMult}x`,                             color: '#A78BFA' },
        ].map(s => (
          <div key={s.label} className="card stat-card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>{s.label}</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── My Watchlist table ── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>My Watchlist</h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{WATCHLIST.length} businesses</span>
        </div>
        <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr><th>Company</th><th>Category</th><th>Asking</th><th>MRR</th><th>Profit</th><th>Multiple</th><th>Status</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {WATCHLIST.map((a) => {
              const sc = STATUS_CONFIG[a.status]
              return (
                <tr key={a.company}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{a.company}</span>
                      <a href={`https://${a.url}`} target="_blank" rel="noreferrer"><ExternalLink size={11} color="var(--text-muted)" /></a>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>Added {a.added}</div>
                  </td>
                  <td><span className="badge" style={{ background: 'rgba(249,115,22,0.08)', color: '#FB923C' }}>{a.category}</span></td>
                  <td><span className="num" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.asking_price ? `$${a.asking_price.toLocaleString()}` : '—'}</span></td>
                  <td><span className="num" style={{ color: '#10B981' }}>{a.revenue ? `$${a.revenue.toLocaleString()}` : '—'}</span></td>
                  <td><span className="num" style={{ color: '#22C55E' }}>{a.profit ? `$${a.profit.toLocaleString()}` : '—'}</span></td>
                  <td><span className="num" style={{ color: '#A78BFA' }}>{a.multiple ? `${a.multiple}x` : '—'}</span></td>
                  <td><span className="badge" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span></td>
                  <td style={{ maxWidth: 200, fontSize: 12 }}>{a.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* ── TrustMRR Available for Sale ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Available for Sale
              </h2>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#FB923C', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', padding: '2px 9px', borderRadius: 99 }}>
                TrustMRR
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Sample listings — add <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: 11 }}>TRUSTMRR_API_KEY</code> to .env.local for live feed
            </p>
          </div>
          <a href="https://trustmrr.com" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            Browse TrustMRR <ExternalLink size={11} />
          </a>
        </div>

        <div className="grid-cols-3">
          {TRUSTMRR_LISTINGS.map((l, i) => (
            <div key={i} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5 }}>{l.name}</div>
                  <span className="badge" style={{ background: 'rgba(249,115,22,0.08)', color: '#FB923C', fontSize: 10 }}>{l.category}</span>
                </div>
                <a href="https://trustmrr.com" target="_blank" rel="noreferrer">
                  <ExternalLink size={12} color="var(--text-muted)" />
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Asking',   value: `$${(l.asking / 1000).toFixed(0)}k`, color: '#F97316' },
                  { label: 'MRR',      value: `$${l.mrr.toLocaleString()}`,         color: '#10B981' },
                  { label: 'Profit',   value: `$${l.profit.toLocaleString()}`,       color: '#22C55E' },
                  { label: 'Multiple', value: `${l.multiple}x`,                     color: '#A78BFA' },
                ].map(m => (
                  <div key={m.label} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 7, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{m.label}</div>
                    <div className="num" style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>

              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={12} /> Add to Watchlist
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
