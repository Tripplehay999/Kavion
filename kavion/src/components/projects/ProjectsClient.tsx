'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, ExternalLink, AlertCircle } from 'lucide-react'
import Modal, { FormField, FieldInput, FieldSelect, FieldTextarea } from '@/components/ui/Modal'
import { addProject, updateProject, deleteProject } from '@/app/actions/projects'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  priority: string
  progress: number
  stack: string[]
  color: string
  updated_at: string
}

const STATUS_COLOR: Record<string, string> = {
  active:    '#22C55E',
  paused:    '#FBBF24',
  completed: '#A78BFA',
  archived:  '#64748B',
}
const PRIORITY_COLOR: Record<string, string> = {
  low:      '#64748B',
  medium:   '#FBBF24',
  high:     '#F97316',
  critical: '#F87171',
}

const BLANK = { name: '', description: '', status: 'active', priority: 'medium', progress: 0, stack: '', color: '#3B82F6' }

export default function ProjectsClient({
  initialProjects, isLive,
}: {
  initialProjects: Project[]
  isLive: boolean
}) {
  const [projects, setProjects] = useState(initialProjects)
  const [addOpen,    setAddOpen]    = useState(false)
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [viewTarget, setViewTarget] = useState<Project | null>(null)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const resetForm = (p?: Project) => {
    setError('')
    setForm(p ? {
      name: p.name, description: p.description ?? '',
      status: p.status, priority: p.priority,
      progress: p.progress, stack: p.stack.join(', '), color: p.color,
    } : BLANK)
  }

  const openAdd = () => { resetForm(); setAddOpen(true) }
  const openEdit = (p: Project) => { resetForm(p); setEditTarget(p) }

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    const payload = {
      name: form.name.trim(),
      description: form.description || undefined,
      status: form.status,
      priority: form.priority,
      progress: Number(form.progress),
      stack: form.stack.split(',').map(s => s.trim()).filter(Boolean),
      color: form.color,
    }

    startTransition(async () => {
      try {
        if (editTarget) {
          await updateProject(editTarget.id, payload)
          setProjects(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...payload } : p))
          setEditTarget(null)
        } else {
          await addProject(payload)
          setProjects(prev => [{ id: `temp-${Date.now()}`, user_id: '', updated_at: 'just now', ...payload }, ...prev])
          setAddOpen(false)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteProject(id)
        setProjects(prev => prev.filter(p => p.id !== id))
        setDeleteId(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed')
      }
    })
  }

  const modal = addOpen ? { title: 'New Project', open: true, close: () => setAddOpen(false) }
    : editTarget ? { title: 'Edit Project', open: true, close: () => setEditTarget(null) }
    : null

  return (
    <>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          {!isLive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#FBBF24', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', padding: '5px 12px', borderRadius: 8 }}>
              <AlertCircle size={12} />
              Demo data — add Supabase credentials to .env.local to use live data
            </div>
          )}
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd} disabled={!isLive}>
          <Plus size={13} /> New Project
        </button>
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Progress</th>
              <th>Stack</th>
              <th>Updated</th>
              {isLive && <th style={{ width: 80 }}></th>}
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr
                key={p.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setViewTarget(p)}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, boxShadow: `0 0 5px ${p.color}`, flexShrink: 0 }} />
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</span>
                  </div>
                </td>
                <td>
                  <span className="badge" style={{ background: `${STATUS_COLOR[p.status] ?? '#64748B'}18`, color: STATUS_COLOR[p.status] ?? '#64748B' }}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <span className="badge" style={{ background: `${PRIORITY_COLOR[p.priority] ?? '#64748B'}18`, color: PRIORITY_COLOR[p.priority] ?? '#64748B' }}>
                    {p.priority}
                  </span>
                </td>
                <td style={{ minWidth: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-track" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${p.progress}%`, background: p.color }} />
                    </div>
                    <span className="num" style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{p.progress}%</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(p.stack ?? []).slice(0, 3).map(s => (
                      <span key={s} className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontSize: 10 }}>{s}</span>
                    ))}
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.updated_at}</td>
                {isLive && (
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => openEdit(p)}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 8px', color: '#F87171' }}
                        onClick={() => setDeleteId(p.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            No projects yet — click <strong style={{ color: 'var(--text-secondary)' }}>New Project</strong> to add one.
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <Modal open={modal.open} onClose={modal.close} title={modal.title}>
          {error && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#F87171', display: 'flex', gap: 8 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}

          <FormField label="Project name" required>
            <FieldInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Kavion OS" />
          </FormField>

          <FormField label="Description">
            <FieldTextarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project?" rows={2} />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Status">
              <FieldSelect value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </FieldSelect>
            </FormField>
            <FormField label="Priority">
              <FieldSelect value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </FieldSelect>
            </FormField>
          </div>

          <FormField label={`Progress — ${form.progress}%`}>
            <input
              type="range" min={0} max={100} value={form.progress}
              onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))}
              style={{ width: '100%', accentColor: '#7C3AED', cursor: 'pointer' }}
            />
          </FormField>

          <FormField label="Tech stack (comma-separated)">
            <FieldInput value={form.stack} onChange={e => setForm(f => ({ ...f, stack: e.target.value }))} placeholder="Next.js, Supabase, Tailwind" />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={modal.close} disabled={isPending}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving…' : editTarget ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Detail View Modal ── */}
      {viewTarget && (
        <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={viewTarget.name} width={560}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: `${STATUS_COLOR[viewTarget.status]}18`, color: STATUS_COLOR[viewTarget.status] }}>{viewTarget.status}</span>
            <span className="badge" style={{ background: `${PRIORITY_COLOR[viewTarget.priority]}18`, color: PRIORITY_COLOR[viewTarget.priority] }}>{viewTarget.priority} priority</span>
          </div>

          {viewTarget.description && (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 20 }}>{viewTarget.description}</p>
          )}

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>Progress</span>
              <span className="num" style={{ color: viewTarget.color }}>{viewTarget.progress}%</span>
            </div>
            <div className="progress-track" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${viewTarget.progress}%`, background: viewTarget.color }} />
            </div>
          </div>

          {viewTarget.stack?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stack</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {viewTarget.stack.map(s => (
                  <span key={s} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            Last updated: {viewTarget.updated_at}
          </div>

          {isLive && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setViewTarget(null); openEdit(viewTarget) }}>
                <Pencil size={12} /> Edit
              </button>
              <button className="btn btn-ghost btn-sm" style={{ color: '#F87171' }} onClick={() => { setViewTarget(null); setDeleteId(viewTarget.id) }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete project?" width={380}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            This will permanently delete the project and all its data. This cannot be undone.
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
