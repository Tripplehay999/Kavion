'use client'

import { useState, useTransition } from 'react'
import { Plus, RefreshCw, Trash2, AlertCircle, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import Modal, { FormField, FieldInput, FieldSelect } from '@/components/ui/Modal'
import { addServer, deleteServer, pingServer } from '@/app/actions/servers'

interface Server {
  id: string
  name: string
  host: string
  region?: string
  provider?: string
  ping_url?: string
  status?: string
  cpu_pct?: number
  memory_pct?: number
  uptime_pct?: number
  response_ms?: number
  last_checked?: string
}

const BLANK = { name: '', host: '', region: '', provider: '', ping_url: '' }

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
      <div className="progress-track" style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="num" style={{ fontSize: 11.5, color: 'var(--text-muted)', width: 32, textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  )
}

function statusColor(s?: string) {
  if (s === 'online')   return '#22C55E'
  if (s === 'degraded') return '#FBBF24'
  return '#F87171'
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return '—'
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60)  return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  return `${Math.round(diff / 3600)}h ago`
}

export default function ServersClient({
  initialServers,
  isLive,
}: {
  initialServers: Server[]
  isLive: boolean
}) {
  const [servers, setServers] = useState(initialServers)
  const [addOpen,   setAddOpen]   = useState(false)
  const [deleteId,  setDeleteId]  = useState<string | null>(null)
  const [pinging,   setPinging]   = useState<Set<string>>(new Set())
  const [form, setForm]           = useState(BLANK)
  const [error, setError]         = useState('')
  const [isPending, startTransition] = useTransition()

  const online   = servers.filter(s => (s.status ?? 'online') === 'online').length
  const degraded = servers.filter(s => s.status === 'degraded').length
  const offline  = servers.filter(s => s.status === 'offline').length
  const avgUptime = servers.length > 0
    ? (servers.reduce((a, s) => a + (s.uptime_pct ?? 99.9), 0) / servers.length).toFixed(2)
    : '—'

  const handleAdd = () => {
    if (!form.name.trim() || !form.host.trim()) { setError('Name and host are required'); return }
    startTransition(async () => {
      try {
        await addServer({
          name:     form.name.trim(),
          host:     form.host.trim(),
          region:   form.region  || undefined,
          provider: form.provider || undefined,
          ping_url: form.ping_url || undefined,
        })
        setServers(prev => [...prev, {
          id: `temp-${Date.now()}`,
          name: form.name.trim(), host: form.host.trim(),
          region: form.region, provider: form.provider, ping_url: form.ping_url,
          status: 'unknown', uptime_pct: 0, cpu_pct: 0, memory_pct: 0, response_ms: 0,
        }])
        setForm(BLANK)
        setAddOpen(false)
        setError('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to add server')
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteServer(id)
        setServers(prev => prev.filter(s => s.id !== id))
        setDeleteId(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed')
      }
    })
  }

  const handlePing = (server: Server) => {
    if (!server.ping_url) return
    setPinging(prev => new Set([...prev, server.id]))
    startTransition(async () => {
      try {
        const result = await pingServer(server.id, server.ping_url!)
        setServers(prev => prev.map(s => s.id === server.id
          ? { ...s, status: result.status, response_ms: result.response_ms, last_checked: new Date().toISOString() }
          : s
        ))
      } catch {
        // ignore ping errors
      } finally {
        setPinging(prev => { const n = new Set(prev); n.delete(server.id); return n })
      }
    })
  }

  const pingAll = () => {
    servers.filter(s => s.ping_url).forEach(s => handlePing(s))
  }

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
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={pingAll} disabled={!isLive || isPending}>
            <RefreshCw size={13} style={{ animation: isPending ? 'spin 1s linear infinite' : 'none' }} />
            Refresh All
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setAddOpen(true); setError('') }} disabled={!isLive}>
            <Plus size={13} /> Add Server
          </button>
        </div>
      </div>

      {/* ── Overview cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Online',    value: online,   color: '#22C55E', status: 'online'   },
          { label: 'Degraded',  value: degraded, color: '#FBBF24', status: 'degraded' },
          { label: 'Offline',   value: offline,  color: '#F87171', status: 'offline'  },
          { label: 'Avg Uptime', value: `${avgUptime}%`, color: 'var(--text-primary)', status: null },
        ].map((s) => (
          <div key={s.label} className="card stat-card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>
              {s.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {s.status && <span className={`status-dot ${s.status}`} />}
              <span className="num" style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Alert Banner ── */}
      {(degraded > 0 || offline > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, marginBottom: 16 }}>
          <AlertTriangle size={15} color="#FBBF24" />
          <span style={{ fontSize: 13, color: '#FBBF24' }}>
            {degraded > 0 && `${degraded} server${degraded > 1 ? 's' : ''} degraded`}
            {degraded > 0 && offline > 0 && ' · '}
            {offline > 0 && `${offline} server${offline > 1 ? 's' : ''} offline`}
            {' — check your ping URLs and server health'}
          </span>
        </div>
      )}

      {/* ── Server Table ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {servers.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            No servers yet — click <strong style={{ color: 'var(--text-secondary)' }}>Add Server</strong> to start monitoring.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Server</th>
                <th>Region</th>
                <th>Status</th>
                <th>Uptime</th>
                <th>Response</th>
                <th style={{ width: 130 }}>CPU</th>
                <th style={{ width: 130 }}>Memory</th>
                <th>Checked</th>
                {isLive && <th style={{ width: 80 }}></th>}
              </tr>
            </thead>
            <tbody>
              {servers.map((s) => {
                const status = s.status ?? 'online'
                const isPingingThis = pinging.has(s.id)
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{s.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.host}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                        {s.region ?? '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={`status-dot ${status}`} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: statusColor(status) }}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="num" style={{ color: (s.uptime_pct ?? 99) >= 99.9 ? '#22C55E' : (s.uptime_pct ?? 99) >= 99 ? '#FBBF24' : '#F87171', fontWeight: 600 }}>
                        {s.uptime_pct != null ? `${Number(s.uptime_pct).toFixed(2)}%` : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="num" style={{ color: !s.response_ms ? '#F87171' : s.response_ms > 200 ? '#FBBF24' : '#22C55E', fontWeight: 600 }}>
                        {s.response_ms ? `${s.response_ms}ms` : '—'}
                      </span>
                    </td>
                    <td>
                      {s.cpu_pct != null
                        ? <MiniBar value={s.cpu_pct} color={s.cpu_pct > 80 ? '#F87171' : s.cpu_pct > 60 ? '#FBBF24' : '#22C55E'} />
                        : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      {s.memory_pct != null
                        ? <MiniBar value={s.memory_pct} color={s.memory_pct > 85 ? '#F87171' : s.memory_pct > 70 ? '#FBBF24' : '#60A5FA'} />
                        : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {timeAgo(s.last_checked)}
                      </span>
                    </td>
                    {isLive && (
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {s.ping_url && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 7px' }}
                              onClick={() => handlePing(s)}
                              disabled={isPingingThis}
                              title="Ping server"
                            >
                              {isPingingThis
                                ? <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />
                                : status === 'offline' ? <WifiOff size={11} color="#F87171" /> : <Wifi size={11} color="#22C55E" />}
                            </button>
                          )}
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '3px 7px', color: '#F87171' }}
                            onClick={() => setDeleteId(s.id)}
                            title="Delete server"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add Server Modal ── */}
      {addOpen && (
        <Modal open title="Add Server" onClose={() => { setAddOpen(false); setError('') }}>
          {error && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#F87171', display: 'flex', gap: 8 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Name" required>
              <FieldInput value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="prod-01" />
            </FormField>
            <FormField label="Host / IP" required>
              <FieldInput value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} placeholder="168.119.45.12" />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Region">
              <FieldSelect value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
                <option value="">— Select —</option>
                <option value="US-East">US-East</option>
                <option value="US-West">US-West</option>
                <option value="EU-West">EU-West</option>
                <option value="EU-Central">EU-Central</option>
                <option value="AP-South">AP-South</option>
                <option value="AP-East">AP-East</option>
              </FieldSelect>
            </FormField>
            <FormField label="Provider">
              <FieldSelect value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}>
                <option value="">— Select —</option>
                <option value="Hetzner">Hetzner</option>
                <option value="AWS">AWS</option>
                <option value="GCP">GCP</option>
                <option value="Azure">Azure</option>
                <option value="DigitalOcean">DigitalOcean</option>
                <option value="Vultr">Vultr</option>
                <option value="Linode">Linode</option>
              </FieldSelect>
            </FormField>
          </div>
          <FormField label="Ping URL" help="HTTP/HTTPS endpoint to check — e.g. https://myapp.com/health">
            <FieldInput value={form.ping_url} onChange={e => setForm(f => ({ ...f, ping_url: e.target.value }))} placeholder="https://myapp.com/health" />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => { setAddOpen(false); setError('') }} disabled={isPending}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={isPending}>
              {isPending ? 'Adding…' : 'Add Server'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <Modal open onClose={() => setDeleteId(null)} title="Remove server?" width={380}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            This server and all its history will be permanently removed.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
            <button
              className="btn"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171', border: '1px solid rgba(248,113,113,0.25)' }}
              onClick={() => handleDelete(deleteId)}
              disabled={isPending}
            >
              {isPending ? 'Removing…' : 'Yes, remove'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
