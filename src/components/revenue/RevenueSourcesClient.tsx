'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react'
import Modal, { FormField, FieldInput, FieldSelect } from '@/components/ui/Modal'
import { addRevenueSource, updateRevenueSource, deleteRevenueSource, logMonthlyMrr } from '@/app/actions/revenue'
import { actionError } from '@/lib/utils/actionError'

interface Source {
  id: string
  name: string
  type: string
  mrr: number
  growth: number
  status: string
}

const TYPE_COLOR: Record<string, string> = {
  SaaS: '#7C3AED', Consulting: '#3B82F6', Affiliate: '#10B981',
  Product: '#F59E0B', Freelance: '#64748B', Ads: '#F97316', Sponsorship: '#EC4899',
}

const BLANK = { name: '', type: 'SaaS', mrr: '', growth: '', status: 'active' }

export default function RevenueSourcesClient({
  initialSources,
  isLive,
}: {
  initialSources: Source[]
  isLive: boolean
}) {
  const [sources, setSources]   = useState(initialSources)
  const [addOpen,    setAddOpen]    = useState(false)
  const [editTarget, setEditTarget] = useState<Source | null>(null)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [logOpen,    setLogOpen]    = useState(false)
  const [logMrr,     setLogMrr]     = useState('')
  const [logMonth,   setLogMonth]   = useState(() => new Date().toISOString().slice(0, 7))
  const [form, setForm]  = useState(BLANK)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const resetForm = (s?: Source) => {
    setError('')
    setForm(s ? { name: s.name, type: s.type, mrr: String(s.mrr), growth: String(s.growth), status: s.status } : BLANK)
  }
  const openAdd  = () => { resetForm(); setAddOpen(true) }
  const openEdit = (s: Source) => { resetForm(s); setEditTarget(s) }

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    const payload = {
      name:   form.name.trim(),
      type:   form.type,
      mrr:    Number(form.mrr) || 0,
      growth: Number(form.growth) || 0,
      status: form.status,
    }
    startTransition(async () => {
      try {
        if (editTarget) {
          await updateRevenueSource(editTarget.id, payload)
          setSources(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...payload } : s))
          setEditTarget(null)
        } else {
          await addRevenueSource(payload)
          setSources(prev => [...prev, { id: `temp-${Date.now()}`, ...payload }])
          setAddOpen(false)
        }
        setError('')
      } catch (e) {
        setError(actionError(e))
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteRevenueSource(id)
        setSources(prev => prev.filter(s => s.id !== id))
        setDeleteId(null)
      } catch (e) {
        setError(actionError(e, 'Delete failed — please try again'))
      }
    })
  }

  const handleLogMrr = () => {
    const total = sources.reduce((sum, s) => sum + (s.status === 'active' ? s.mrr : 0), 0)
    startTransition(async () => {
      try {
        await logMonthlyMrr(logMonth, Number(logMrr) || total)
        setLogOpen(false)
        setLogMrr('')
      } catch (e) {
        setError(actionError(e, 'Failed to log MRR'))
      }
    })
  }

  const modal = addOpen
    ? { title: 'New Revenue Source', open: true, close: () => setAddOpen(false) }
    : editTarget
    ? { title: 'Edit Revenue Source', open: true, close: () => setEditTarget(null) }
    : null

  const totalMrr = sources.filter(s => s.status === 'active').reduce((a, s) => a + s.mrr, 0)

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Revenue Sources</h2>
          {sources.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Total active MRR: <span style={{ color: '#10B981', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${totalMrr.toLocaleString()}</span>
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {isLive && (
            <button className="btn btn-ghost btn-sm" onClick={() => setLogOpen(true)}>
              Log MRR
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={openAdd} disabled={!isLive}>
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {sources.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          No revenue sources yet.
        </div>
      ) : (
        <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Source</th><th>Type</th><th>MRR</th><th>Growth</th><th>Status</th>
              {isLive && <th style={{ width: 70 }}></th>}
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</td>
                <td>
                  <span className="badge" style={{ background: `${TYPE_COLOR[s.type] ?? '#64748B'}18`, color: TYPE_COLOR[s.type] ?? '#64748B' }}>
                    {s.type}
                  </span>
                </td>
                <td>
                  <span className="num" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${Number(s.mrr).toLocaleString()}</span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, color: s.growth > 0 ? '#22C55E' : s.growth < 0 ? '#F87171' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {s.growth > 0 ? <ArrowUp size={11} /> : s.growth < 0 ? <ArrowDown size={11} /> : null}
                    {s.growth > 0 ? `+${s.growth}` : s.growth}%
                  </span>
                </td>
                <td>
                  <span className="badge" style={{ background: s.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: s.status === 'active' ? '#22C55E' : '#64748B' }}>
                    {s.status}
                  </span>
                </td>
                {isLive && (
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '3px 7px' }} onClick={() => openEdit(s)}>
                        <Pencil size={11} />
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '3px 7px', color: '#F87171' }} onClick={() => setDeleteId(s.id)}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
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
          <FormField label="Source name" required>
            <FieldInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Kavion SaaS" />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Type">
              <FieldSelect value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {['SaaS', 'Consulting', 'Affiliate', 'Product', 'Freelance', 'Ads', 'Sponsorship'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </FieldSelect>
            </FormField>
            <FormField label="Status">
              <FieldSelect value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </FieldSelect>
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="MRR ($)">
              <FieldInput type="number" value={form.mrr} onChange={e => setForm(f => ({ ...f, mrr: e.target.value }))} placeholder="0" min={0} />
            </FormField>
            <FormField label="Growth (%)">
              <FieldInput type="number" value={form.growth} onChange={e => setForm(f => ({ ...f, growth: e.target.value }))} placeholder="0" />
            </FormField>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={modal.close} disabled={isPending}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Saving…' : editTarget ? 'Save changes' : 'Add Source'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Log MRR Modal ── */}
      {logOpen && (
        <Modal open onClose={() => setLogOpen(false)} title="Log Monthly MRR" width={380}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
            Record MRR for a specific month. Active sources total: <strong style={{ color: '#10B981' }}>${totalMrr.toLocaleString()}</strong>
          </p>
          <FormField label="Month">
            <FieldInput type="month" value={logMonth} onChange={e => setLogMonth(e.target.value)} />
          </FormField>
          <FormField label="MRR ($)" help="Leave blank to use active sources total">
            <FieldInput type="number" value={logMrr} onChange={e => setLogMrr(e.target.value)} placeholder={String(totalMrr)} min={0} />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setLogOpen(false)} disabled={isPending}>Cancel</button>
            <button className="btn btn-primary" onClick={handleLogMrr} disabled={isPending}>
              {isPending ? 'Saving…' : 'Log MRR'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <Modal open onClose={() => setDeleteId(null)} title="Delete source?" width={380}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            This revenue source will be permanently deleted.
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
    </div>
  )
}
