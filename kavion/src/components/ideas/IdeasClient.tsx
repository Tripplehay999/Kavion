'use client'

import { useState, useTransition } from 'react'
import { Plus, Star, Pencil, Trash2, AlertCircle } from 'lucide-react'
import Modal, { FormField, FieldInput, FieldSelect, FieldTextarea } from '@/components/ui/Modal'
import { addIdea, updateIdea, deleteIdea } from '@/app/actions/ideas'

type IdeaStatus = 'exploring' | 'building' | 'launched' | 'shelved' | 'validated'

interface Idea {
  id: string
  title: string
  description?: string
  score: number
  status: string
  tags: string[]
  created_at: string
}

const STATUS_CONFIG: Record<IdeaStatus, { label: string; bg: string; color: string }> = {
  exploring: { label: 'Exploring',  bg: 'rgba(99,102,241,0.1)',  color: '#818CF8' },
  building:  { label: 'Building',   bg: 'rgba(59,130,246,0.1)',  color: '#60A5FA' },
  validated: { label: 'Validated',  bg: 'rgba(16,185,129,0.1)',  color: '#34D399' },
  launched:  { label: 'Launched',   bg: 'rgba(124,58,237,0.1)',  color: '#A78BFA' },
  shelved:   { label: 'Shelved',    bg: 'rgba(100,116,139,0.1)', color: '#64748B' },
}

const TAG_COLORS: Record<string, string> = {
  AI: '#7C3AED', DevTools: '#3B82F6', SaaS: '#10B981', Automation: '#F59E0B',
  Mobile: '#EC4899', Analytics: '#06B6D4', Creator: '#F97316', OSS: '#64748B',
}

const BLANK = { title: '', description: '', status: 'exploring', score: 7, tags: '' }

function statusCfg(s: string) {
  return STATUS_CONFIG[s as IdeaStatus] ?? { label: s, bg: 'rgba(100,116,139,0.1)', color: '#64748B' }
}

export default function IdeasClient({
  initialIdeas,
  isLive,
}: {
  initialIdeas: Idea[]
  isLive: boolean
}) {
  const [ideas, setIdeas] = useState(() => [...initialIdeas].sort((a, b) => b.score - a.score))
  const [addOpen,    setAddOpen]    = useState(false)
  const [editTarget, setEditTarget] = useState<Idea | null>(null)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const resetForm = (idea?: Idea) => {
    setError('')
    setForm(idea ? {
      title: idea.title, description: idea.description ?? '',
      status: idea.status, score: idea.score, tags: (idea.tags ?? []).join(', '),
    } : BLANK)
  }

  const openAdd  = () => { resetForm(); setAddOpen(true) }
  const openEdit = (idea: Idea) => { resetForm(idea); setEditTarget(idea) }

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    const payload = {
      title: form.title.trim(),
      description: form.description || undefined,
      status: form.status,
      score: Number(form.score),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    startTransition(async () => {
      try {
        if (editTarget) {
          await updateIdea(editTarget.id, payload)
          setIdeas(prev => [...prev.map(i => i.id === editTarget.id ? { ...i, ...payload } : i)].sort((a, b) => b.score - a.score))
          setEditTarget(null)
        } else {
          await addIdea(payload)
          setIdeas(prev => [{ id: `temp-${Date.now()}`, created_at: 'just now', ...payload }, ...prev].sort((a, b) => b.score - a.score))
          setAddOpen(false)
        }
        setError('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteIdea(id)
        setIdeas(prev => prev.filter(i => i.id !== id))
        setDeleteId(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed')
      }
    })
  }

  const modal = addOpen
    ? { title: 'New Idea', open: true, close: () => setAddOpen(false) }
    : editTarget
    ? { title: 'Edit Idea', open: true, close: () => setEditTarget(null) }
    : null

  const stats = [
    { label: 'Total Ideas',  value: ideas.length,                                              color: 'var(--text-primary)' },
    { label: 'Exploring',    value: ideas.filter(i => i.status === 'exploring').length,        color: '#818CF8'             },
    { label: 'Building',     value: ideas.filter(i => i.status === 'building').length,         color: '#60A5FA'             },
    { label: 'Validated',    value: ideas.filter(i => i.status === 'validated').length,        color: '#34D399'             },
  ]

  return (
    <>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          {!isLive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#FBBF24', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', padding: '5px 12px', borderRadius: 8 }}>
              <AlertCircle size={12} />
              Demo data — add Supabase credentials to .env.local
            </div>
          )}
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd} disabled={!isLive}>
          <Plus size={13} /> New Idea
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ padding: '14px 20px', flex: 1 }}>
            <div className="num" style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Grid ── */}
      {ideas.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          No ideas yet — click <strong style={{ color: 'var(--text-secondary)' }}>New Idea</strong> to capture your first one.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {ideas.map((idea) => {
            const sc = statusCfg(idea.status)
            return (
              <div
                key={idea.id}
                className="card"
                style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#FBBF24', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    <Star size={11} fill="#FBBF24" strokeWidth={0} />
                    {idea.score}/10
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5, letterSpacing: '-0.02em' }}>
                    {idea.title}
                  </h3>
                  {idea.description && (
                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {idea.description}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {(idea.tags ?? []).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {(idea.tags ?? []).map((tag) => (
                      <span key={tag} className="badge" style={{ background: `${TAG_COLORS[tag] ?? '#64748B'}18`, color: TAG_COLORS[tag] ?? '#64748B', fontSize: 11 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {idea.created_at
                      ? (typeof idea.created_at === 'string' && idea.created_at.includes('T')
                        ? new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : idea.created_at)
                      : ''}
                  </span>
                  {isLive && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '3px 7px' }} onClick={() => openEdit(idea)}>
                        <Pencil size={11} />
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '3px 7px', color: '#F87171' }} onClick={() => setDeleteId(idea.id)}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <Modal open={modal.open} onClose={modal.close} title={modal.title}>
          {error && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#F87171', display: 'flex', gap: 8 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}
          <FormField label="Idea title" required>
            <FieldInput value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. AI Changelog Writer" />
          </FormField>
          <FormField label="Description">
            <FieldTextarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does it do? Who's it for?" rows={2} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Status">
              <FieldSelect value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="exploring">Exploring</option>
                <option value="building">Building</option>
                <option value="validated">Validated</option>
                <option value="launched">Launched</option>
                <option value="shelved">Shelved</option>
              </FieldSelect>
            </FormField>
            <FormField label={`Score — ${form.score}/10`}>
              <input
                type="range" min={1} max={10} value={form.score}
                onChange={e => setForm(f => ({ ...f, score: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#F59E0B', cursor: 'pointer', marginTop: 8 }}
              />
            </FormField>
          </div>
          <FormField label="Tags (comma-separated)">
            <FieldInput value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="AI, SaaS, DevTools" />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={modal.close} disabled={isPending}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving…' : editTarget ? 'Save changes' : 'Add Idea'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <Modal open onClose={() => setDeleteId(null)} title="Delete idea?" width={380}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            This idea will be permanently removed. This cannot be undone.
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
    </>
  )
}
