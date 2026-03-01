'use client'

import { useState, useTransition } from 'react'
import { Flame, Plus, CheckCircle2, Trash2, AlertCircle, X, Trophy } from 'lucide-react'
import { toggleHabit, addHabit, deleteHabit } from '@/app/actions/habits'
import Modal, { FormField, FieldInput } from '@/components/ui/Modal'

interface Habit {
  id: string
  name: string
  color: string
  sort_order: number
  created_at: string
}

interface HabitLog {
  habit_id: string
  date: string
  done: boolean
}

const COLORS = [
  '#EC4899', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#7C3AED', '#A78BFA',
  '#10B981', '#EF4444', '#F59E0B', '#64748B',
]

const EMOJIS = ['🧠', '💪', '📚', '🧊', '🎯', '📵', '✍️', '🏃', '🥗', '💧', '🧘', '📝']

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getLast28Days(): string[] {
  const days: string[] = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function calcStreak(habitId: string, logs: HabitLog[]): number {
  const dateSet = new Set(logs.filter(l => l.habit_id === habitId && l.done).map(l => l.date))
  let streak = 0
  for (let i = 0; i <= 60; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    if (dateSet.has(d.toISOString().split('T')[0])) streak++
    else break
  }
  return streak
}

function formatToday(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

// SVG progress ring
function ProgressRing({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? done / total : 0
  const radius = 46
  const circ = 2 * Math.PI * radius
  const offset = circ * (1 - pct)
  const color = pct >= 0.8 ? '#22C55E' : pct >= 0.5 ? '#F59E0B' : '#EC4899'
  return (
    <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
      <svg width={110} height={110} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={55} cy={55} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={9} />
        <circle
          cx={55} cy={55} r={radius} fill="none"
          stroke={color} strokeWidth={9}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {done}/{total}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>TODAY</span>
      </div>
    </div>
  )
}

export default function HabitsClient({
  habits: initialHabits,
  logs,
  streak,
  isLive,
}: {
  habits: Habit[]
  logs: HabitLog[]
  streak: number
  isLive: boolean
}) {
  const today = getToday()
  const last28 = getLast28Days()

  const [habits, setHabits] = useState(initialHabits)
  const [doneToday, setDoneToday] = useState<Set<string>>(
    () => new Set(logs.filter(l => l.date === today && l.done).map(l => l.habit_id))
  )
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', color: COLORS[0] })
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const toggle = (id: string) => {
    if (!isLive) return
    setDoneToday(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    startTransition(async () => {
      try { await toggleHabit(id) }
      catch {
        setDoneToday(prev => {
          const next = new Set(prev)
          next.has(id) ? next.delete(id) : next.add(id)
          return next
        })
      }
    })
  }

  const handleAdd = () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    startTransition(async () => {
      try {
        await addHabit(form.name.trim(), form.color)
        setHabits(prev => [...prev, { id: `temp-${Date.now()}`, name: form.name.trim(), color: form.color, sort_order: prev.length, created_at: '' }])
        setForm({ name: '', color: COLORS[0] })
        setAddOpen(false)
        setError('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to add habit')
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteHabit(id)
        setHabits(prev => prev.filter(h => h.id !== id))
        setDeleteId(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed')
      }
    })
  }

  const totalDone    = doneToday.size
  const totalHabits  = habits.length
  const daysElapsed  = new Date().getDate()
  const monthLogs    = logs.filter(l => l.date.startsWith(new Date().toISOString().slice(0, 7)) && l.done)
  const monthRate    = totalHabits > 0 && daysElapsed > 0
    ? Math.round((monthLogs.length / (daysElapsed * totalHabits)) * 100)
    : 0
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => calcStreak(h.id, logs))) : 0

  // Day-of-week labels for heatmap header
  const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => { setAddOpen(true); setError('') }} disabled={!isLive}>
          <Plus size={13} /> Add Habit
        </button>
      </div>

      {/* ── Demo Banner ── */}
      {!isLive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#FBBF24', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', padding: '8px 14px', borderRadius: 8, marginBottom: 20 }}>
          <AlertCircle size={12} />
          Demo data — configure Supabase in <strong style={{ marginLeft: 3 }}>Settings</strong> for live tracking
        </div>
      )}

      {/* ── Stats Row ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 22, alignItems: 'stretch' }}>
        {/* Progress Ring card */}
        <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flex: '0 0 auto' }}>
          <ProgressRing done={totalDone} total={totalHabits} />
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Today&apos;s Score</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {totalHabits === 0
                ? 'No habits yet'
                : totalDone === totalHabits
                  ? '🎉 All done!'
                  : `${totalHabits - totalDone} remaining`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {totalHabits > 0 ? `${Math.round(totalDone / Math.max(totalHabits, 1) * 100)}% complete` : ''}
            </div>
          </div>
        </div>

        {/* Side stat cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, flex: 1 }}>
            {[
              { label: 'Current Streak', value: `${streak}d`, sub: 'Consecutive days', color: '#F97316', icon: <Flame size={16} color="#F97316" /> },
              { label: 'Best Streak',    value: `${longestStreak}d`, sub: 'Any single habit', color: '#FBBF24', icon: <Trophy size={16} color="#FBBF24" /> },
              { label: 'This Month',     value: `${monthRate}%`, sub: 'Completion rate',   color: '#10B981', icon: <CheckCircle2 size={16} color="#10B981" /> },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  {s.icon}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</span>
                </div>
                <div className="num" style={{ fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Today's Checklist ── */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
            Today — {formatToday()}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Flame size={14} color="#F97316" />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#F97316' }}>{streak}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>day streak</span>
          </div>
        </div>

        {habits.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            No habits yet — click <strong style={{ color: 'var(--text-secondary)' }}>Add Habit</strong> to get started.
          </div>
        ) : (
          <div>
            {habits.map((h, i) => {
              const done = doneToday.has(h.id)
              const streakVal = calcStreak(h.id, logs)
              return (
                <div
                  key={h.id}
                  onClick={() => toggle(h.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 20px',
                    borderBottom: i < habits.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: isLive ? 'pointer' : 'default',
                    transition: 'background 120ms',
                    background: done ? `${h.color}07` : 'transparent',
                    borderLeft: `3px solid ${done ? h.color : 'transparent'}`,
                    position: 'relative',
                  }}
                  className="habit-row"
                >
                  {/* Color dot / check */}
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: done ? h.color : 'rgba(255,255,255,0.04)',
                    border: done ? `1.5px solid ${h.color}` : `1.5px solid var(--border)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 150ms',
                  }}>
                    {done && <CheckCircle2 size={13} color="#fff" strokeWidth={2.5} />}
                  </div>

                  {/* Name + streak */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', marginBottom: 2 }}>
                      {h.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Flame size={10} color={streakVal > 0 ? h.color : 'var(--text-muted)'} />
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: streakVal > 0 ? h.color : 'var(--text-muted)' }}>
                        {streakVal}d streak
                      </span>
                    </div>
                  </div>

                  {/* Emoji */}
                  <span style={{ fontSize: 18, opacity: done ? 0.5 : 1, transition: 'opacity 150ms', userSelect: 'none' }}>
                    {EMOJIS[h.sort_order % EMOJIS.length]}
                  </span>

                  {/* Delete */}
                  {isLive && (
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteId(h.id) }}
                      style={{ opacity: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                      className="habit-delete-btn"
                    >
                      <X size={12} color="var(--text-muted)" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── 28-Day Heatmap ── */}
      <div className="card" style={{ padding: '20px 22px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>28-Day History</h2>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }} />
            Miss
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#22C55E', opacity: 0.7 }} />
            Done
          </div>
        </div>

        {habits.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No habits to display.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* DOW header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ width: 130, flexShrink: 0 }} />
              <div style={{ display: 'flex', gap: 4 }}>
                {last28.map((date, i) => {
                  const dow = new Date(date).getDay() // 0=Sun
                  const label = DOW_LABELS[dow === 0 ? 6 : dow - 1]
                  return (
                    <div key={date} style={{ width: 14, textAlign: 'center' }}>
                      <span style={{ fontSize: 9, color: i % 7 === 0 ? 'var(--text-secondary)' : 'transparent', fontWeight: 600 }}>{label}</span>
                    </div>
                  )
                })}
              </div>
              <span style={{ width: 40 }} />
            </div>

            {habits.map((h) => {
              const logSet = new Set(logs.filter(l => l.habit_id === h.id && l.done).map(l => l.date))
              const doneCount = last28.filter(d => logSet.has(d)).length
              return (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: h.color, flexShrink: 0 }} />
                    {h.name}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {last28.map((date) => (
                      <div
                        key={date}
                        title={`${date}: ${logSet.has(date) ? '✓ Done' : '✗ Missed'}`}
                        style={{
                          width: 14, height: 14, borderRadius: 3,
                          background: logSet.has(date) ? h.color : 'rgba(255,255,255,0.05)',
                          opacity: logSet.has(date) ? 0.85 : 1,
                          transition: 'transform 100ms',
                          cursor: 'default',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: h.color, width: 40, textAlign: 'right', flexShrink: 0, fontWeight: 600 }}>
                    {doneCount}/28
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Add Habit Modal ── */}
      {addOpen && (
        <Modal open title="New Habit" onClose={() => { setAddOpen(false); setError('') }}>
          {error && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#F87171', display: 'flex', gap: 8 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}
          <FormField label="Habit name" required>
            <FieldInput
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Morning run, Read 30 min"
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            />
          </FormField>

          <FormField label="Color">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 8, background: c,
                    border: form.color === c ? '2.5px solid white' : '2.5px solid transparent',
                    boxShadow: form.color === c ? `0 0 10px ${c}88` : 'none',
                    cursor: 'pointer', transition: 'all 150ms', padding: 0,
                  }}
                />
              ))}
            </div>
          </FormField>

          {/* Live preview */}
          {form.name && (
            <div style={{ marginTop: 4, marginBottom: 8, padding: '10px 14px', borderRadius: 8, background: `${form.color}10`, borderLeft: `3px solid ${form.color}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: form.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={13} color="#fff" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{form.name}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => { setAddOpen(false); setError('') }} disabled={isPending}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={isPending}>
              {isPending ? 'Adding…' : 'Add Habit'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <Modal open onClose={() => setDeleteId(null)} title="Delete habit?" width={380}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            This will delete the habit and all its history. This cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
            <button
              className="btn"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171', border: '1px solid rgba(248,113,113,0.25)' }}
              onClick={() => handleDelete(deleteId!)}
              disabled={isPending}
            >
              {isPending ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        .habit-row:hover { background: rgba(255,255,255,0.02) !important; }
        .habit-delete-btn { transition: opacity 150ms; }
        .habit-row:hover .habit-delete-btn { opacity: 1 !important; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
