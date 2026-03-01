import { TrendingUp, ArrowUp, ArrowDown, Zap } from 'lucide-react'
import { getRevenueSources, getRevenueEntries, getTotalMrr, getStripeMrr } from '@/app/actions/revenue'
import MrrChart from '@/components/revenue/MrrChart'
import RevenueSourcesClient from '@/components/revenue/RevenueSourcesClient'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

const MOCK_SOURCES = [
  { id: 'mock-r1', name: 'SaaS Product A',      type: 'SaaS',       mrr: 4800, growth: 22,  status: 'active' },
  { id: 'mock-r2', name: 'Consulting Retainer', type: 'Consulting', mrr: 3500, growth: 5,   status: 'active' },
  { id: 'mock-r3', name: 'Affiliate Program',   type: 'Affiliate',  mrr: 2100, growth: 11,  status: 'active' },
  { id: 'mock-r4', name: 'Digital Product B',   type: 'Product',    mrr: 1200, growth: -3,  status: 'active' },
  { id: 'mock-r5', name: 'Old Freelance Gig',   type: 'Freelance',  mrr: 800,  growth: 0,   status: 'paused' },
]

const MOCK_ENTRIES = [
  { month: 'Sep', total_mrr: 7800,  expenses: 240 },
  { month: 'Oct', total_mrr: 9200,  expenses: 260 },
  { month: 'Nov', total_mrr: 10500, expenses: 250 },
  { month: 'Dec', total_mrr: 11200, expenses: 275 },
  { month: 'Jan', total_mrr: 11800, expenses: 260 },
  { month: 'Feb', total_mrr: 12400, expenses: 265 },
]

const MOCK_TRANSACTIONS = [
  { desc: 'SaaS Product A — Feb',      amount: 4800,  type: 'income',  date: 'Feb 01' },
  { desc: 'Consulting Retainer — Feb', amount: 3500,  type: 'income',  date: 'Feb 01' },
  { desc: 'AWS Hosting',               amount: -220,  type: 'expense', date: 'Feb 03' },
  { desc: 'Affiliate Commission',      amount: 2100,  type: 'income',  date: 'Feb 05' },
  { desc: 'Digital Product B',         amount: 1200,  type: 'income',  date: 'Feb 07' },
  { desc: 'Supabase Pro',              amount: -25,   type: 'expense', date: 'Feb 10' },
  { desc: 'Vercel Pro',                amount: -20,   type: 'expense', date: 'Feb 10' },
]

export default async function RevenuePage() {
  const live = isConfigured()

  const [sources, entries, mrrData, stripeData] = await Promise.all([
    live ? getRevenueSources() : Promise.resolve(MOCK_SOURCES),
    live ? getRevenueEntries() : Promise.resolve(MOCK_ENTRIES),
    live ? getTotalMrr()       : Promise.resolve({ mrr: 12400, growth: 18 }),
    getStripeMrr(),
  ])

  // Stripe overrides DB MRR if configured
  const mrr    = stripeData?.mrr  ?? mrrData.mrr    ?? 12400
  const arr    = stripeData?.arr  ?? mrr * 12
  const growth = mrrData.growth || 18
  const net    = mrr - 265
  const isStripeLive = !!stripeData

  const chartData = (entries as { month: string; total_mrr: number; expenses?: number }[]).map(e => ({
    month:     e.month,
    total_mrr: Number(e.total_mrr),
    expenses:  Number(e.expenses ?? 0),
  }))

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
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'MRR',     value: `$${mrr.toLocaleString()}`,  sub: isStripeLive ? 'Live from Stripe' : `+${growth}% MoM`,   color: '#10B981', trend: 'up', live: isStripeLive },
          { label: 'ARR',     value: `$${arr.toLocaleString()}`,  sub: 'Annualised',                                             color: '#10B981', trend: null, live: false },
          { label: 'Net MRR', value: `$${net.toLocaleString()}`,  sub: '$265 expenses',                                          color: '#34D399', trend: null, live: false },
          { label: 'Growth',  value: `+${growth}%`,               sub: 'vs last month',                                          color: '#22C55E', trend: 'up', live: false },
        ].map(s => (
          <div key={s.label} className="card stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</span>
              {s.live && (
                <span style={{ fontSize: 10, color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '1px 7px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Zap size={9} /> Stripe
                </span>
              )}
            </div>
            <div className="num" style={{ fontSize: 27, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 7 }}>{s.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              {s.trend === 'up' && <ArrowUp size={11} color="#22C55E" />}
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── MRR Trend ── */}
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

        {/* ── Revenue Sources (interactive) ── */}
        <RevenueSourcesClient initialSources={sources} isLive={live} />

        {/* ── Transactions ── */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Transactions</h2>
          </div>
          {MOCK_TRANSACTIONS.map((t, i) => (
            <div key={i} style={{ padding: '11px 20px', borderBottom: i < MOCK_TRANSACTIONS.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
