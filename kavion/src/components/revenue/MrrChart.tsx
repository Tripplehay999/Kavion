'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

interface Entry { month: string; total_mrr: number; expenses?: number }

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name: string }[]; label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-hover)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.name === 'total_mrr' ? '#10B981' : '#F87171', margin: '2px 0', fontFamily: 'var(--font-mono)' }}>
          {p.name === 'total_mrr' ? 'MRR' : 'Expenses'}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function MrrChart({ data }: { data: Entry[] }) {
  const maxVal = Math.max(...data.map(d => d.total_mrr), 1)

  return (
    <ResponsiveContainer width="100%" height={190}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10B981" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#F87171" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#F87171" stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          stroke="transparent"
          tick={{ fill: '#3D4559', fontSize: 11 }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          stroke="transparent"
          tick={{ fill: '#3D4559', fontSize: 11 }}
          axisLine={false} tickLine={false}
          domain={[0, maxVal * 1.15]}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone" dataKey="total_mrr"
          stroke="#10B981" strokeWidth={2}
          fill="url(#mrrGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
        />
        {data.some(d => d.expenses) && (
          <Area
            type="monotone" dataKey="expenses"
            stroke="#F87171" strokeWidth={1.5}
            fill="url(#expGrad)"
            dot={false}
            activeDot={{ r: 3, fill: '#F87171', strokeWidth: 0 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
