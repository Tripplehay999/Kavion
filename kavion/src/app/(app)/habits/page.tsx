import { Target, Flame, Plus, CheckCircle2 } from 'lucide-react'

const HABITS = [
  { name: 'Deep Work (2h)',   streak: 14, best: 21, color: '#7C3AED', done: true,  emoji: '🧠' },
  { name: 'Exercise',         streak: 14, best: 30, color: '#EC4899', done: true,  emoji: '💪' },
  { name: 'Read (30 min)',    streak: 9,  best: 21, color: '#3B82F6', done: false, emoji: '📚' },
  { name: 'Cold Shower',      streak: 7,  best: 7,  color: '#06B6D4', done: false, emoji: '🧊' },
  { name: 'Review Goals',     streak: 5,  best: 14, color: '#F59E0B', done: false, emoji: '🎯' },
  { name: 'No Social Media',  streak: 3,  best: 10, color: '#10B981', done: true,  emoji: '📵' },
  { name: 'Journal',          streak: 12, best: 19, color: '#F97316', done: false, emoji: '✍️' },
]

// Generate last 28 days of completion data
function genWeek(streak: number) {
  const days: boolean[] = []
  for (let i = 27; i >= 0; i--) {
    days.push(i < streak)
  }
  return days
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function HabitsPage() {
  const totalDone = HABITS.filter(h => h.done).length
  const totalHabits = HABITS.length

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{
            background: 'rgba(236,72,153,0.08)',
            color: '#F472B6',
            border: '1px solid rgba(236,72,153,0.2)',
          }}>
            <Target size={12} />
            Habits
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Habit Tracker
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Consistency compounds. Every day counts.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} />
          Add Habit
        </button>
      </div>

      {/* ── Overview ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: "Today's Score",  value: `${totalDone}/${totalHabits}`, sub: `${Math.round(totalDone/totalHabits*100)}% complete`, color: '#EC4899' },
          { label: 'Longest Streak', value: '14 days',  sub: 'Deep Work',          color: '#7C3AED' },
          { label: 'Best Streak',    value: '30 days',  sub: 'Exercise (all-time)', color: '#10B981' },
          { label: 'This Month',     value: '87%',      sub: 'Completion rate',     color: '#F59E0B' },
        ].map((s) => (
          <div key={s.label} className="card stat-card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>
              {s.label}
            </div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 7 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Today's Checklist ── */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
            Today — Thursday, Feb 27
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Flame size={14} color="#F97316" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#F97316' }}>14</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>day streak</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {HABITS.map((h, i) => (
            <div
              key={h.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 22px',
                borderBottom: i < HABITS.length - 2 ? '1px solid var(--border)' : 'none',
                borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                transition: 'background 120ms',
              }}
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: h.done ? `${h.color}22` : 'rgba(255,255,255,0.03)',
                border: h.done ? `1.5px solid ${h.color}55` : '1.5px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
                transition: 'all 150ms',
              }}>
                {h.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: h.done ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: h.done ? 'line-through' : 'none',
                  marginBottom: 2,
                }}>
                  {h.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Flame size={10} color={h.streak > 7 ? '#F97316' : 'var(--text-muted)'} />
                  <span style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: h.streak > 7 ? '#F97316' : 'var(--text-muted)',
                  }}>
                    {h.streak}d streak
                  </span>
                </div>
              </div>
              {h.done && (
                <CheckCircle2 size={16} color={h.color} strokeWidth={2} style={{ flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4-week Heatmap ── */}
      <div className="card" style={{ padding: 22, overflow: 'hidden' }}>
        <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>
          28-Day History
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {HABITS.map((h) => {
            const days = genWeek(h.streak)
            return (
              <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 120, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {h.name}
                </span>
                <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                  {days.map((done, i) => (
                    <div
                      key={i}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        background: done ? h.color : 'rgba(255,255,255,0.05)',
                        opacity: done ? 0.7 + (i / days.length) * 0.3 : 1,
                        transition: 'all 150ms',
                      }}
                      title={done ? 'Done' : 'Missed'}
                    />
                  ))}
                </div>
                <span className="num" style={{ fontSize: 12, color: h.color, width: 50, textAlign: 'right', flexShrink: 0 }}>
                  {h.streak}d
                </span>
              </div>
            )
          })}
          {/* Day labels */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <span style={{ width: 120, flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 4, flex: 1 }}>
              {Array.from({ length: 28 }, (_, i) => (
                <div key={i} style={{ width: 14, textAlign: 'center' }}>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                    {i % 7 === 0 ? DAYS[0] : ''}
                  </span>
                </div>
              ))}
            </div>
            <span style={{ width: 50 }} />
          </div>
        </div>
      </div>

    </div>
  )
}
