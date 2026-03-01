'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus, Pencil, Trash2, ExternalLink, AlertCircle, Github, Star, GitFork, CircleDot, Clock } from 'lucide-react'
import Modal, { FormField, FieldInput, FieldSelect, FieldTextarea } from '@/components/ui/Modal'
import { addProject, updateProject, deleteProject } from '@/app/actions/projects'
import GithubImportModal from '@/components/projects/GithubImportModal'
import type { GithubRepo } from '@/app/actions/github'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  priority: string
  progress: number
  stack: string[]
  color: string
  github_repo?: string | null
  updated_at: string
}

interface GithubRepoData {
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  pushed_at: string
  default_branch: string
}

function parseGithubRepo(input: string): string | null {
  if (!input) return null
  // Handle full URL: https://github.com/owner/repo
  try {
    const url = new URL(input)
    if (url.hostname === 'github.com') {
      const parts = url.pathname.replace(/^\//, '').split('/')
      if (parts.length >= 2) return `${parts[0]}/${parts[1]}`
    }
  } catch { /* not a URL */ }
  // Handle owner/repo format
  if (/^[\w.-]+\/[\w.-]+$/.test(input)) return input
  return null
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

const BLANK = { name: '', description: '', status: 'active', priority: 'medium', progress: 0, stack: '', color: '#3B82F6', github_repo: '' }

export default function ProjectsClient({
  initialProjects, isLive, githubConnected, autoOpenGithub,
}: {
  initialProjects: Project[]
  isLive: boolean
  githubConnected: boolean
  autoOpenGithub: boolean
}) {
  const [projects, setProjects] = useState(initialProjects)
  const [addOpen,    setAddOpen]    = useState(false)
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [viewTarget, setViewTarget] = useState<Project | null>(null)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [ghData, setGhData] = useState<GithubRepoData | null>(null)
  const [ghLoading, setGhLoading] = useState(false)
  const [githubModalOpen, setGithubModalOpen] = useState(autoOpenGithub)

  useEffect(() => {
    const slug = parseGithubRepo(viewTarget?.github_repo ?? '')
    if (!slug) { setGhData(null); return }
    setGhLoading(true)
    setGhData(null)
    fetch(`https://api.github.com/repos/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: GithubRepoData | null) => setGhData(d))
      .catch(() => setGhData(null))
      .finally(() => setGhLoading(false))
  }, [viewTarget?.github_repo])

  const resetForm = (p?: Project) => {
    setError('')
    setForm(p ? {
      name: p.name, description: p.description ?? '',
      status: p.status, priority: p.priority,
      progress: p.progress, stack: p.stack.join(', '), color: p.color,
      github_repo: p.github_repo ?? '',
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
      github_repo: form.github_repo.trim() || undefined,
    }

    startTransition(async () => {
      try {
        if (editTarget) {
          await updateProject(editTarget.id, payload)
          setProjects(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...payload } : p))
          setEditTarget(null)
        } else {
          await addProject(payload)
          setProjects(prev => [{ id: `temp-${Date.now()}`, updated_at: 'just now', ...payload, github_repo: payload.github_repo ?? null }, ...prev])
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setGithubModalOpen(true)}
            disabled={!isLive}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Github size={13} /> Import from GitHub
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd} disabled={!isLive}>
            <Plus size={13} /> New Project
          </button>
        </div>
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
                    {p.github_repo && (() => {
                      const slug = parseGithubRepo(p.github_repo)
                      return slug ? (
                        <a
                          href={`https://github.com/${slug}`}
                          target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                          title={slug}
                        >
                          <Github size={12} />
                        </a>
                      ) : null
                    })()}
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

          <FormField label="GitHub repo (optional)">
            <FieldInput value={form.github_repo} onChange={e => setForm(f => ({ ...f, github_repo: e.target.value }))} placeholder="https://github.com/owner/repo  or  owner/repo" />
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

          {/* ── GitHub Repo Stats ── */}
          {viewTarget.github_repo && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Github size={12} /> GitHub
              </div>
              {ghLoading && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '10px 0' }}>Loading repo data…</div>
              )}
              {!ghLoading && ghData && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Github size={14} color="var(--text-secondary)" />
                      <a href={ghData.html_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {ghData.full_name}
                      </a>
                    </div>
                    <a href={ghData.html_url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', display: 'flex' }}>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  {ghData.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.55 }}>{ghData.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <Star size={12} color="#FBBF24" /> <span className="num">{ghData.stargazers_count.toLocaleString()}</span> stars
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <GitFork size={12} color="#60A5FA" /> <span className="num">{ghData.forks_count.toLocaleString()}</span> forks
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <CircleDot size={12} color="#F87171" /> <span className="num">{ghData.open_issues_count.toLocaleString()}</span> issues
                    </div>
                    {ghData.language && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED', display: 'inline-block' }} /> {ghData.language}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Clock size={11} /> pushed {new Date(ghData.pushed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              )}
              {!ghLoading && !ghData && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Could not load repo — may be private or URL is invalid.</div>
              )}
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

      {/* ── GitHub Import Modal ── */}
      <GithubImportModal
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        githubConnected={githubConnected}
        onImported={(imported: GithubRepo[]) => {
          setProjects(prev => [
            ...imported.map(r => ({
              id: `gh-${r.id}`,
              updated_at: 'just now',
              name: r.name,
              description: r.description ?? undefined,
              status: 'active',
              priority: 'medium',
              progress: 0,
              stack: r.language ? [r.language] : [],
              color: '#3B82F6',
              github_repo: r.html_url,
            })),
            ...prev,
          ])
        }}
      />

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
