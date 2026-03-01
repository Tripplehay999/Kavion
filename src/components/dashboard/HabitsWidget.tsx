'use client'

import { useState, useTransition } from 'react'
import { toggleHabit } from '@/app/actions/habits'

interface Habit {
  id: string
  name: string
  color: string
  done: boolean
}

export default function HabitsWidget({ habits: initial, isLive }: { habits: Habit[]; isLive: boolean }) {
  const [habits, setHabits] = useState(initial)
  const [pending, setpending] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const toggle = (id: string) => {
    if (!isLive) return // mock mode — no server action

    setHabits(prev => prev.map(h => h.id === id ? { ...h, done: !h.done } : h))
    setpending(id)

    startTransition(async () => {
      try {
        await toggleHabit(id)
      } catch {
        // revert on error
        setHabits(prev => prev.map(h => h.id === id ? { ...h, done: !h.done } : h))
      } finally {
        setpending(null)
      }
    })
  }

  const done = habits.filter(h => h.done).length

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid var(--border)',
      }}>
        <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Today&apos;s Habits</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="num" style={{ fontSize: 12, color: '#EC4899', background: 'rgba(236,72,153,0.1)', padding: '2px 8px', borderRadius: 99 }}>
            {done} / {habits.length}
          </span>
          <a href="/habits" style={{ fontSize: 12, color: 'var(--violet-light)', textDecoration: 'none' }}>
            View all →
          </a>
        </div>
      </div>

      {habits.map((h, i) => (
        <div
          key={h.id}
          onClick={() => toggle(h.id)}
          style={{
            padding: '12px 20px',
            borderBottom: i < habits.length - 1 ? '1px solid var(--border)' : 'none',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: isLive ? 'pointer' : 'default',
            opacity: pending === h.id ? 0.6 : 1,
            transition: 'opacity 150ms',
          }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
            background: h.done ? h.color : 'transparent',
            border: h.done ? `2px solid ${h.color}` : '2px solid var(--border-hover)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 150ms',
            boxShadow: h.done ? `0 0 8px ${h.color}44` : 'none',
          }}>
            {h.done && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{
            fontSize: 13.5,
            color: h.done ? 'var(--text-muted)' : 'var(--text-secondary)',
            textDecoration: h.done ? 'line-through' : 'none',
            transition: 'all 150ms',
          }}>
            {h.name}
          </span>
        </div>
      ))}

      {habits.length === 0 && (
        <div style={{ padding: '28px 20px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          No habits yet ·{' '}
          <a href="/habits" style={{ color: 'var(--violet-light)', textDecoration: 'none' }}>Add your first habit →</a>
        </div>
      )}
    </div>
  )
}
