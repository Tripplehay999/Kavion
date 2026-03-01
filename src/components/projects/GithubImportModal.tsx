'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import { Search, Github, Star, Lock, Globe, Check, Loader2, AlertCircle, GitFork, ExternalLink } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { getGithubRepos, type GithubRepo } from '@/app/actions/github'
import { addProject } from '@/app/actions/projects'

const LANG_COLOR: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3776AB',
  Rust: '#DEA584', Go: '#00ADD8', Java: '#ED8B00', 'C#': '#239120',
  'C++': '#00599C', Ruby: '#CC342D', Swift: '#F05138', Kotlin: '#7F52FF',
  Dart: '#0175C2', PHP: '#777BB4', CSS: '#1572B6', HTML: '#E34F26',
  Shell: '#89E051', Vue: '#4FC08D', Svelte: '#FF3E00',
}

interface Props {
  open: boolean
  onClose: () => void
  githubConnected: boolean
  onImported: (repos: GithubRepo[]) => void
}

export default function GithubImportModal({ open, onClose, githubConnected, onImported }: Props) {
  const [repos, setRepos] = useState<GithubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [importing, startImport] = useTransition()

  useEffect(() => {
    if (!open || !githubConnected) return
    setLoading(true)
    setError('')
    setSelected(new Set())
    setSearch('')
    setRepos([])
    getGithubRepos().then(({ repos: r, error: e }) => {
      if (e && e !== 'not_connected') setError(e)
      else setRepos(r)
      setLoading(false)
    })
  }, [open, githubConnected])

  const filtered = useMemo(
    () => repos.filter(r => r.name.toLowerCase().includes(search.toLowerCase())),
    [repos, search]
  )

  const toggle = (id: number) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const toggleAll = () =>
    setSelected(selected.size === filtered.length && filtered.length > 0 ? new Set() : new Set(filtered.map(r => r.id)))

  const handleImport = () => {
    const toImport = repos.filter(r => selected.has(r.id))
    startImport(async () => {
      await Promise.all(toImport.map(r =>
        addProject({
          name: r.name,
          description: r.description || undefined,
          status: 'active',
          priority: 'medium',
          progress: 0,
          stack: r.language ? [r.language] : [],
          color: '#3B82F6',
          github_repo: r.html_url,
        })
      ))
      onImported(toImport)
      onClose()
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Import from GitHub" width={620}>

      {/* ── Not connected state ── */}
      {!githubConnected && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Github size={28} color="var(--text-secondary)" />
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
            Connect your GitHub account to import repositories as projects.
          </p>
          <a href="/api/github/auth" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Github size={14} /> Sign in with GitHub
          </a>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.6 }}>
            Requires <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>GITHUB_CLIENT_ID</code> and <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>GITHUB_CLIENT_SECRET</code> in <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>.env.local</code>.{' '}
            <a href="/settings" style={{ color: '#A78BFA' }}>Set up in Settings →</a>
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {githubConnected && loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 10, color: 'var(--text-muted)' }}>
          <Loader2 size={18} className="spin" /> Fetching your repositories…
        </div>
      )}

      {/* ── Error ── */}
      {githubConnected && !loading && error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, color: '#F87171', fontSize: 13 }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* ── Repo list ── */}
      {githubConnected && !loading && !error && repos.length > 0 && (
        <>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search repositories…"
              className="field-input"
              style={{ paddingLeft: 34, width: '100%', boxSizing: 'border-box' }}
              autoFocus
            />
          </div>

          {/* Select all bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
            <button onClick={toggleAll} style={{ fontSize: 12, color: '#A78BFA', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {selected.size === filtered.length && filtered.length > 0 ? 'Deselect all' : `Select all ${filtered.length}`}
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{repos.length} repos · {selected.size} selected</span>
          </div>

          {/* Repo rows */}
          <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 16 }}>
            {filtered.map(r => {
              const isSelected = selected.has(r.id)
              const langColor = LANG_COLOR[r.language ?? ''] ?? '#64748B'
              return (
                <div
                  key={r.id}
                  onClick={() => toggle(r.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px',
                    borderRadius: 9, cursor: 'pointer',
                    background: isSelected ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.015)',
                    border: `1px solid ${isSelected ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.1s',
                  }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 17, height: 17, borderRadius: 5, flexShrink: 0, marginTop: 2,
                    border: `1.5px solid ${isSelected ? '#7C3AED' : 'var(--border)'}`,
                    background: isSelected ? '#7C3AED' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s',
                  }}>
                    {isSelected && <Check size={10} color="white" strokeWidth={3} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                      {r.private
                        ? <Lock size={10} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        : <Globe size={10} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.name}
                      </span>
                      {r.language && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: langColor, display: 'inline-block' }} />
                          {r.language}
                        </span>
                      )}
                      <a
                        href={r.html_url} target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ marginLeft: 'auto', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}
                      >
                        <ExternalLink size={11} />
                      </a>
                    </div>

                    {/* Description */}
                    {r.description && (
                      <p style={{ margin: '0 0 5px', fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                      {r.stargazers_count > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={10} /> {r.stargazers_count}</span>
                      )}
                      {r.forks_count > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><GitFork size={10} /> {r.forks_count}</span>
                      )}
                      <span>pushed {new Date(r.pushed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: 'var(--text-muted)' }}>
                No repos match &ldquo;{search}&rdquo;
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={importing}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={selected.size === 0 || importing}
            >
              {importing
                ? <><Loader2 size={13} className="spin" /> Importing…</>
                : <><Github size={13} /> Import {selected.size > 0 ? `${selected.size} repo${selected.size !== 1 ? 's' : ''}` : 'selected'}</>}
            </button>
          </div>
        </>
      )}

      {githubConnected && !loading && !error && repos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: 'var(--text-muted)' }}>
          No repositories found in your GitHub account.
        </div>
      )}
    </Modal>
  )
}
