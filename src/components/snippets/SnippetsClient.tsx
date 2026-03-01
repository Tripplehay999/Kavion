'use client'

import { useState, useTransition, useMemo } from 'react'
import { Plus, Copy, Check, Trash2, Search, AlertCircle, X } from 'lucide-react'
import Modal, { FormField, FieldInput, FieldSelect, FieldTextarea } from '@/components/ui/Modal'
import { addSnippet, deleteSnippet } from '@/app/actions/snippets'

interface Snippet {
  id: string
  title: string
  description?: string
  code: string
  language: string
  tags: string[]
  created_at: string
}

const LANG_COLOR: Record<string, { bg: string; color: string }> = {
  TypeScript: { bg: 'rgba(59,130,246,0.12)',  color: '#60A5FA' },
  JavaScript: { bg: 'rgba(251,191,36,0.12)',  color: '#FBBF24' },
  Python:     { bg: 'rgba(234,179,8,0.12)',   color: '#EAB308' },
  SQL:        { bg: 'rgba(16,185,129,0.12)',  color: '#34D399' },
  Bash:       { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8' },
  CSS:        { bg: 'rgba(167,139,250,0.12)', color: '#A78BFA' },
  Go:         { bg: 'rgba(6,182,212,0.12)',   color: '#22D3EE' },
  Rust:       { bg: 'rgba(249,115,22,0.12)',  color: '#FB923C' },
}
const TAG_COLOR: Record<string, string> = {
  React: '#61DAFB', 'Next.js': '#fff', Supabase: '#3ECF8E', Tailwind: '#38BDF8',
  Redis: '#FF6B6B', API: '#F97316', Auth: '#7C3AED', Hooks: '#EC4899',
  Postgres: '#4169E1', Database: '#64748B', Async: '#06B6D4', Security: '#EF4444',
}

const LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Bash', 'CSS', 'Go', 'Rust']
const BLANK = { title: '', description: '', language: 'TypeScript', code: '', tags: '' }

export default function SnippetsClient({
  initialSnippets,
  isLive,
}: {
  initialSnippets: Snippet[]
  isLive: boolean
}) {
  const [snippets, setSnippets] = useState(initialSnippets)
  const [activeLang, setActiveLang] = useState('All')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const languages = ['All', ...Array.from(new Set(snippets.map(s => s.language)))]

  const filtered = useMemo(() => snippets.filter(s => {
    const matchLang = activeLang === 'All' || s.language === activeLang
    const q = search.toLowerCase()
    const matchSearch = !q || s.title.toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q) || (s.tags ?? []).some(t => t.toLowerCase().includes(q))
    return matchLang && matchSearch
  }), [snippets, activeLang, search])

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handleAdd = () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.code.trim())  { setError('Code is required');  return }
    const payload = {
      title: form.title.trim(),
      description: form.description || undefined,
      language: form.language,
      code: form.code,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    startTransition(async () => {
      try {
        await addSnippet(payload)
        setSnippets(prev => [{ id: `temp-${Date.now()}`, created_at: 'just now', ...payload, tags: payload.tags }, ...prev])
        setForm(BLANK)
        setAddOpen(false)
        setError('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to add snippet')
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteSnippet(id)
        setSnippets(prev => prev.filter(s => s.id !== id))
        setDeleteId(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed')
      }
    })
  }

  return (
    <>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          {!isLive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#FBBF24', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', padding: '5px 12px', borderRadius: 8 }}>
              <AlertCircle size={12} />
              Demo data — add Supabase credentials to .env.local
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSearchOpen(v => !v)}>
            <Search size={13} /> Search
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setAddOpen(true); setError('') }} disabled={!isLive}>
            <Plus size={13} /> New Snippet
          </button>
        </div>
      </div>

      {/* ── Search Bar ── */}
      {searchOpen && (
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
          <Search size={13} color="var(--text-muted)" />
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, description, tags…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-geist-sans)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <X size={13} color="var(--text-muted)" />
            </button>
          )}
        </div>
      )}

      {/* ── Language Filter ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {languages.map((lang) => {
          const active = activeLang === lang
          const lc = LANG_COLOR[lang]
          return (
            <button
              key={lang}
              className="btn btn-ghost btn-sm"
              onClick={() => setActiveLang(lang)}
              style={active ? {
                background: lc ? `${lc.color}18` : 'rgba(6,182,212,0.1)',
                color: lc?.color ?? '#22D3EE',
                border: `1px solid ${lc ? `${lc.color}40` : 'rgba(6,182,212,0.3)'}`,
              } : {}}
            >
              {lang}
            </button>
          )
        })}
        {filtered.length !== snippets.length && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 4 }}>
            {filtered.length} of {snippets.length}
          </span>
        )}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          {snippets.length === 0
            ? <>No snippets yet — click <strong style={{ color: 'var(--text-secondary)' }}>New Snippet</strong> to add one.</>
            : 'No snippets match your filter.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {filtered.map((s) => {
            const lc = LANG_COLOR[s.language] ?? { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8' }
            return (
              <div key={s.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{s.title}</h3>
                    {s.description && <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{s.description}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span className="badge" style={{ background: lc.bg, color: lc.color }}>{s.language}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px' }}
                      onClick={() => copyCode(s.id, s.code)}
                      title="Copy code"
                    >
                      {copied === s.id ? <Check size={12} color="#22C55E" /> : <Copy size={12} />}
                    </button>
                    {isLive && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 8px', color: '#F87171' }}
                        onClick={() => setDeleteId(s.id)}
                        title="Delete snippet"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Code block */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 18px', overflow: 'auto', maxHeight: 160 }}>
                  <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.65, color: '#CBD5E1', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {s.code}
                  </pre>
                </div>

                {/* Footer */}
                <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {(s.tags ?? []).map((tag) => (
                      <span key={tag} className="badge" style={{ background: `${TAG_COLOR[tag] ?? '#64748B'}18`, color: TAG_COLOR[tag] ?? '#64748B', fontSize: 10.5 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {s.created_at
                      ? (typeof s.created_at === 'string' && s.created_at.includes('T')
                        ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : s.created_at)
                      : ''}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add Snippet Modal ── */}
      {addOpen && (
        <Modal open title="New Snippet" onClose={() => { setAddOpen(false); setError('') }} width={600}>
          {error && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#F87171', display: 'flex', gap: 8 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14 }}>
            <FormField label="Title" required>
              <FieldInput value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. useDebounce hook" />
            </FormField>
            <FormField label="Language">
              <FieldSelect value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </FieldSelect>
            </FormField>
          </div>
          <FormField label="Description">
            <FieldInput value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this snippet do?" />
          </FormField>
          <FormField label="Code" required>
            <textarea
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              placeholder="Paste your code here…"
              rows={8}
              spellCheck={false}
              style={{
                width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border)', borderRadius: 8, resize: 'vertical',
                fontSize: 12, lineHeight: 1.6, color: '#CBD5E1', fontFamily: 'var(--font-mono)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </FormField>
          <FormField label="Tags (comma-separated)">
            <FieldInput value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="React, Hooks, Performance" />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => { setAddOpen(false); setError('') }} disabled={isPending}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={isPending}>
              {isPending ? 'Saving…' : 'Add Snippet'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <Modal open onClose={() => setDeleteId(null)} title="Delete snippet?" width={380}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            This snippet will be permanently deleted. This cannot be undone.
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
