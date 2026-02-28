import { TrendingUp, TrendingDown, Plus, ArrowUp, ArrowDown } from 'lucide-react'

const sources = [
  { name: 'SaaS Product A',    type: 'SaaS',        mrr: 4800,  growth: +22, status: 'active'   },
  { name: 'Consulting Retainer', type: 'Consulting',  mrr: 3500,  growth: +5,  status: 'active'   },
  { name: 'Affiliate — Dev Tools', type: 'Affiliate', mrr: 2100,  growth: +38, status: 'active'   },
  { name: 'Digital Product B',  type: 'Product',     mrr: 1200,  growth: -8,  status: 'active'   },
  { name: 'Freelance Project X', type: 'Freelance',  mrr: 800,   growth: 0,   status: 'inactive' },
]

const transactions = [
  { desc: 'SaaS Product A — Feb',    amount: 4800,  type: 'income',  date: 'Feb 01' },
  { desc: 'Consulting Retainer — Feb', amount: 3500, type: 'income',  date: 'Feb 01' },
  { desc: 'AWS Hosting',             amount: -220,  type: 'expense', date: 'Feb 03' },
  { desc: 'Affiliate Commission',    amount: 2100,  type: 'income',  date: 'Feb 05' },
  { desc: 'Digital Product B',       amount: 1200,  type: 'income',  date: 'Feb 07' },
  { desc: 'Supabase Pro',            amount: -25,   type: 'expense', date: 'Feb 10' },
  { desc: 'Vercel Pro',              amount: -20,   type: 'expense', date: 'Feb 10' },
]

const mrr = 12400
const arr = mrr * 12
const growth = 18
const expenses = 265
const net = mrr - expenses

const TYPE_COLOR: Record<string, string> = {
  SaaS:        '#7C3AED',
  Consulting:  '#3B82F6',
  Affiliate:   '#10B981',
  Product:     '#F59E0B',
  Freelance:   '#64748B',
}

export default function RevenuePage() {
  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{
            background: 'rgba(16,185,129,0.08)',
            color: '#34D399',
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <TrendingUp size={12} />
            Revenue
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Revenue Dashboard
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            All income streams, tracked in real time.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} />
          Add Source
        </button>
      </div>

      {/* ── Big stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'MRR',      value: `$${mrr.toLocaleString()}`, sub: `+${growth}% MoM`, trend: 'up', color: '#10B981' },
          { label: 'ARR',      value: `$${arr.toLocaleString()}`, sub: 'Annualised',       trend: null, color: '#10B981' },
          { label: 'Net MRR',  value: `$${net.toLocaleString()}`, sub: `$${expenses} expenses`, trend: null, color: '#34D399' },
          { label: 'Growth',   value: `+${growth}%`,              sub: 'vs last month',    trend: 'up', color: '#22C55E' },
        ].map((s) => (
          <div key={s.label} className="card stat-card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>
              {s.label}
            </div>
            <div className="num" style={{ fontSize: 27, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 7 }}>
              {s.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              {s.trend === 'up' && <ArrowUp size={11} color="#22C55E" />}
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Chart Placeholder ── */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>MRR Trend</h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last 6 months</span>
        </div>
        {/* CSS bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
          {[7200, 8400, 9100, 10200, 11800, 12400].map((v, i) => {
            const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
            const pct = (v / 12400) * 100
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span className="num" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  ${(v / 1000).toFixed(1)}k
                </span>
                <div style={{
                  width: '100%',
                  height: `${pct}%`,
                  background: i === 5
                    ? 'linear-gradient(180deg, #10B981 0%, #065F46 100%)'
                    : 'rgba(16,185,129,0.2)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 300ms',
                }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{months[i]}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>

        {/* Revenue Sources */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Revenue Sources</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Type</th>
                <th>MRR</th>
                <th>Growth</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</td>
                  <td>
                    <span className="badge" style={{
                      background: `${TYPE_COLOR[s.type]}18`,
                      color: TYPE_COLOR[s.type],
                    }}>
                      {s.type}
                    </span>
                  </td>
                  <td>
                    <span className="num" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${s.mrr.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 13,
                      color: s.growth > 0 ? '#22C55E' : s.growth < 0 ? '#F87171' : 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {s.growth > 0 ? <ArrowUp size={11} /> : s.growth < 0 ? <ArrowDown size={11} /> : null}
                      {s.growth > 0 ? `+${s.growth}` : s.growth}%
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: s.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                      color: s.status === 'active' ? '#22C55E' : '#64748B',
                    }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Transactions */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Transactions</h2>
          </div>
          {transactions.map((t, i) => (
            <div key={i} style={{
              padding: '11px 20px',
              borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: t.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {t.type === 'income'
                    ? <TrendingUp size={13} color="#10B981" />
                    : <TrendingDown size={13} color="#F87171" />
                  }
                </div>
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>{t.desc}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.date}</div>
                </div>
              </div>
              <span className="num" style={{
                fontSize: 13,
                fontWeight: 600,
                color: t.type === 'income' ? '#22C55E' : '#F87171',
              }}>
                {t.type === 'income' ? '+' : ''}{t.amount < 0 ? `-$${Math.abs(t.amount)}` : `$${t.amount}`}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
