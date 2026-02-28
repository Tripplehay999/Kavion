'use client'

import { useState, useTransition } from 'react'
import { Flame, Plus, CheckCircle2, Trash2, AlertCircle, X } from 'lucide-react'
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

const EMOJIS = ['🧠', '💪', '📚', '🧊', '🎯', '📵', '✍️', '🏃', '🥗', '💧', '🧘', '📝']
const COLORS = ['#EC4899', '#7C3AED', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#F97316', '#EF4444']

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
  const dateSet = new Set(logs.filter(l => l.habit_id === habitId).map(l => l.date))
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

  const totalDone = doneToday.size
  const totalHabits = habits.length

  // Compute this-month completion rate
  const daysElapsed = new Date().getDate()
  const monthLogs = logs.filter(l => l.date.startsWith(new Date().toISOString().slice(0, 7)))
  const monthRate = totalHabits > 0 && daysElapsed > 0
    ? Math.round((monthLogs.length / (daysElapsed * totalHabits)) * 100)
    : 0

  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => calcStreak(h.id, logs))) : 0

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
          Demo data — add Supabase credentials to .env.local for live tracking
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: "Today's Score",   value: `${totalDone}/${totalHabits}`, sub: totalHabits > 0 ? `${Math.round(totalDone / Math.max(totalHabits, 1) * 100)}% complete` : 'No habits yet', color: '#EC4899' },
          { label: 'Overall Streak',  value: `${streak}d`,                   sub: 'Consecutive days',  color: '#7C3AED' },
          { label: 'Best Streak',     value: `${longestStreak}d`,             sub: 'Any single habit',  color: '#10B981' },
          { label: 'This Month',      value: `${monthRate}%`,                 sub: 'Completion rate',   color: '#F59E0B' },
        ].map((s) => (
          <div key={s.label} className="card stat-card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>{s.label}</div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 7 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.sub}</div>
          </div>
        ))}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {habits.map((h, i) => {
              const done = doneToday.has(h.id)
              const emojiIdx = h.sort_order % EMOJIS.length
              const streakVal = calcStreak(h.id, logs)
              return (
                <div
                  key={h.id}
                  onClick={() => toggle(h.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 22px',
                    borderBottom: i < habits.length - 2 ? '1px solid var(--border)' : 'none',
                    borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
                    cursor: isLive ? 'pointer' : 'default',
                    transition: 'background 120ms',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: done ? `${h.color}22` : 'rgba(255,255,255,0.03)',
                    border: done ? `1.5px solid ${h.color}55` : '1.5px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, transition: 'all 150ms',
                  }}>
                    {EMOJIS[emojiIdx]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', marginBottom: 2 }}>
                      {h.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Flame size={10} color={streakVal > 7 ? '#F97316' : 'var(--text-muted)'} />
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: streakVal > 7 ? '#F97316' : 'var(--text-muted)' }}>
                        {streakVal}d streak
                      </span>
                    </div>
                  </div>
                  {done && <CheckCircle2 size={16} color={h.color} strokeWidth={2} style={{ flexShrink: 0 }} />}
                  {isLive && (
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteId(h.id) }}
                      style={{ position: 'absolute', top: 8, right: 8, opacity: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                      className="habit-delete-btn"
                    >
                      <X size={11} color="var(--text-muted)" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── 28-Day Heatmap ── */}
      <div className="card" style={{ padding: 22, overflow: 'hidden' }}>
        <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>
          28-Day History
        </h2>
        {habits.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No habits to display.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {habits.map((h) => {
              const logSet = new Set(logs.filter(l => l.habit_id === h.id).map(l => l.date))
              return (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 120, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.name}
                  </span>
                  <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                    {last28.map((date, i) => (
                      <div
                        key={date}
                        style={{
                          width: 14, height: 14, borderRadius: 3,
                          background: logSet.has(date) ? h.color : 'rgba(255,255,255,0.05)',
                          opacity: logSet.has(date) ? 0.7 + (i / 28) * 0.3 : 1,
                          transition: 'all 150ms',
                        }}
                        title={`${date}: ${logSet.has(date) ? 'Done' : 'Missed'}`}
                      />
                    ))}
                  </div>
                  <span className="num" style={{ fontSize: 12, color: h.color, width: 50, textAlign: 'right', flexShrink: 0 }}>
                    {calcStreak(h.id, logs)}d
                  </span>
                </div>
              )
            })}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <span style={{ width: 120, flexShrink: 0 }} />
              <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                {last28.map((_, i) => (
                  <div key={i} style={{ width: 14, textAlign: 'center' }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{i % 7 === 0 ? 'W' : ''}</span>
                  </div>
                ))}
              </div>
              <span style={{ width: 50 }} />
            </div>
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
            <FieldInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Morning run" />
          </FormField>
          <FormField label="Color">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <div
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{
                    width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer',
                    border: form.color === c ? `2px solid white` : '2px solid transparent',
                    boxShadow: form.color === c ? `0 0 8px ${c}` : 'none',
                    transition: 'all 150ms',
                  }}
                />
              ))}
            </div>
          </FormField>
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
              onClick={() => handleDelete(deleteId)}
              disabled={isPending}
            >
              {isPending ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </Modal>
      )}

      {/* Hover style for delete button */}
      <style>{`.habit-delete-btn { transition: opacity 150ms } div:hover > .habit-delete-btn { opacity: 1 !important }`}</style>
    </>
  )
}
