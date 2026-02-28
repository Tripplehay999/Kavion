import { TrendingUp, Plus, ArrowUp, ArrowDown } from 'lucide-react'
import { getRevenueSources, getRevenueEntries, getTotalMrr } from '@/app/actions/revenue'
import MrrChart from '@/components/revenue/MrrChart'

const TYPE_COLOR: Record<string, string> = {
  SaaS:       '#7C3AED',
  Consulting: '#3B82F6',
  Affiliate:  '#10B981',
  Product:    '#F59E0B',
  Freelance:  '#64748B',
}

export default async function RevenuePage() {
  const [sources, entries, mrrData] = await Promise.all([
    getRevenueSources(),
    getRevenueEntries(),
    getTotalMrr(),
  ])

  const mrr      = mrrData.mrr || 12400
  const growth   = mrrData.growth || 18
  const arr      = mrr * 12
  const expenses = sources.reduce((s, r) => s, 0) // computed below
  const totalExp = 265
  const net      = mrr - totalExp

  // Normalize entries for recharts
  const chartData = entries.map((e: { month: string; total_mrr: number; expenses?: number }) => ({
    month:     e.month,
    total_mrr: Number(e.total_mrr),
    expenses:  Number(e.expenses ?? 0),
  }))

  const transactions = [
    { desc: 'SaaS Product A — Feb',     amount: 4800,  type: 'income',  date: 'Feb 01' },
    { desc: 'Consulting Retainer — Feb', amount: 3500,  type: 'income',  date: 'Feb 01' },
    { desc: 'AWS Hosting',              amount: -220,  type: 'expense', date: 'Feb 03' },
    { desc: 'Affiliate Commission',     amount: 2100,  type: 'income',  date: 'Feb 05' },
    { desc: 'Digital Product B',        amount: 1200,  type: 'income',  date: 'Feb 07' },
    { desc: 'Supabase Pro',             amount: -25,   type: 'expense', date: 'Feb 10' },
    { desc: 'Vercel Pro',               amount: -20,   type: 'expense', date: 'Feb 10' },
  ]

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{ background: 'rgba(16,185,129,0.08)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }}>
            <TrendingUp size={12} /> Revenue
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Revenue Dashboard
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>All income streams, tracked in real time.</p>
        </div>
        <button className="btn btn-primary"><Plus size={14} /> Add Source</button>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'MRR',     value: `$${mrr.toLocaleString()}`,  sub: `+${growth}% MoM`,     color: '#10B981', trend: 'up'  },
          { label: 'ARR',     value: `$${arr.toLocaleString()}`,  sub: 'Annualised',            color: '#10B981', trend: null  },
          { label: 'Net MRR', value: `$${net.toLocaleString()}`,  sub: `$${totalExp} expenses`, color: '#34D399', trend: null  },
          { label: 'Growth',  value: `+${growth}%`,               sub: 'vs last month',         color: '#22C55E', trend: 'up'  },
        ].map(s => (
          <div key={s.label} className="card stat-card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>{s.label}</div>
            <div className="num" style={{ fontSize: 27, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 7 }}>{s.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              {s.trend === 'up' && <ArrowUp size={11} color="#22C55E" />}
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── MRR Trend (recharts) ── */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>MRR Trend</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monthly recurring revenue + expenses</p>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last {chartData.length} months</span>
        </div>
        <MrrChart data={chartData} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>

        {/* Revenue Sources */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Revenue Sources</h2>
            <button className="btn btn-ghost btn-sm"><Plus size={12} /> Add</button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Source</th><th>Type</th><th>MRR</th><th>Growth</th><th>Status</th></tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</td>
                  <td>
                    <span className="badge" style={{ background: `${TYPE_COLOR[s.type] ?? '#64748B'}18`, color: TYPE_COLOR[s.type] ?? '#64748B' }}>{s.type}</span>
                  </td>
                  <td><span className="num" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${Number(s.mrr).toLocaleString()}</span></td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, color: s.growth > 0 ? '#22C55E' : s.growth < 0 ? '#F87171' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {s.growth > 0 ? <ArrowUp size={11} /> : s.growth < 0 ? <ArrowDown size={11} /> : null}
                      {s.growth > 0 ? `+${s.growth}` : s.growth}%
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: s.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: s.status === 'active' ? '#22C55E' : '#64748B' }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Transactions */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Transactions</h2>
          </div>
          {transactions.map((t, i) => (
            <div key={i} style={{ padding: '11px 20px', borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: t.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.type === 'income' ? <TrendingUp size={13} color="#10B981" /> : <ArrowDown size={13} color="#F87171" />}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 500 }}>{t.desc}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.date}</div>
                </div>
              </div>
              <span className="num" style={{ fontSize: 13, fontWeight: 600, color: t.type === 'income' ? '#22C55E' : '#F87171' }}>
                {t.type === 'income' ? '+' : ''}{t.amount < 0 ? `-$${Math.abs(t.amount)}` : `$${t.amount}`}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
