import { Server, Plus, RefreshCw, AlertTriangle } from 'lucide-react'

type ServerStatus = 'online' | 'degraded' | 'offline'

const SERVERS: {
  name: string
  host: string
  region: string
  status: ServerStatus
  uptime: number
  response_ms: number
  cpu: number
  memory: number
  checked: string
}[] = [
  { name: 'prod-01',    host: '168.119.45.12',   region: 'US-East',   status: 'online',   uptime: 99.98, response_ms: 42,  cpu: 34, memory: 58, checked: '30s ago' },
  { name: 'prod-02',    host: '168.119.45.13',   region: 'US-East',   status: 'degraded', uptime: 99.12, response_ms: 284, cpu: 87, memory: 79, checked: '30s ago' },
  { name: 'prod-03',    host: '65.108.70.21',    region: 'EU-West',   status: 'online',   uptime: 100,   response_ms: 31,  cpu: 12, memory: 41, checked: '31s ago' },
  { name: 'staging-01', host: '65.108.70.22',    region: 'EU-West',   status: 'online',   uptime: 99.90, response_ms: 55,  cpu: 8,  memory: 33, checked: '32s ago' },
  { name: 'db-primary', host: '10.0.1.5',        region: 'US-East',   status: 'online',   uptime: 99.99, response_ms: 5,   cpu: 22, memory: 71, checked: '30s ago' },
  { name: 'db-replica', host: '10.0.1.6',        region: 'US-East',   status: 'online',   uptime: 99.99, response_ms: 7,   cpu: 18, memory: 68, checked: '30s ago' },
  { name: 'cache-01',   host: '10.0.1.10',       region: 'US-East',   status: 'online',   uptime: 100,   response_ms: 2,   cpu: 5,  memory: 44, checked: '30s ago' },
  { name: 'worker-01',  host: '65.108.70.30',    region: 'EU-West',   status: 'online',   uptime: 99.80, response_ms: 120, cpu: 61, memory: 55, checked: '33s ago' },
  { name: 'cdn-edge-sg', host: '139.59.1.10',    region: 'AP-South',  status: 'offline',  uptime: 82.00, response_ms: 0,   cpu: 0,  memory: 0,  checked: '1m ago'  },
]

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
      <div className="progress-track" style={{ flex: 1 }}>
        <div
          className="progress-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="num" style={{ fontSize: 11.5, color: 'var(--text-muted)', width: 32, textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  )
}

export default function ServersPage() {
  const online   = SERVERS.filter(s => s.status === 'online').length
  const degraded = SERVERS.filter(s => s.status === 'degraded').length
  const offline  = SERVERS.filter(s => s.status === 'offline').length
  const avgUptime = (SERVERS.reduce((a, s) => a + s.uptime, 0) / SERVERS.length).toFixed(2)

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{
            background: 'rgba(34,197,94,0.08)',
            color: '#4ADE80',
            border: '1px solid rgba(34,197,94,0.2)',
          }}>
            <Server size={12} />
            Servers
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Server Monitor
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            {SERVERS.length} servers tracked across 3 regions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button className="btn btn-primary">
            <Plus size={14} />
            Add Server
          </button>
        </div>
      </div>

      {/* ── Overview ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Online',    value: online,   color: '#22C55E', dot: 'online'   },
          { label: 'Degraded',  value: degraded, color: '#FBBF24', dot: 'degraded' },
          { label: 'Offline',   value: offline,  color: '#F87171', dot: 'offline'  },
          { label: 'Avg Uptime', value: `${avgUptime}%`, color: 'var(--text-primary)', dot: null },
        ].map((s) => (
          <div key={s.label} className="card stat-card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>
              {s.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {s.dot && <span className={`status-dot ${s.dot}`} />}
              <span className="num" style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: '-0.04em' }}>
                {s.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Alert Banner for degraded/offline ── */}
      {(degraded > 0 || offline > 0) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          background: 'rgba(251,191,36,0.07)',
          border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: 10,
          marginBottom: 16,
        }}>
          <AlertTriangle size={15} color="#FBBF24" />
          <span style={{ fontSize: 13, color: '#FBBF24' }}>
            {degraded} server degraded · {offline} server offline — investigate prod-02 high CPU and cdn-edge-sg downtime
          </span>
        </div>
      )}

      {/* ── Server Table ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
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
            </tr>
          </thead>
          <tbody>
            {SERVERS.map((s) => (
              <tr key={s.name}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {s.host}
                  </div>
                </td>
                <td>
                  <span className="badge" style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-muted)',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {s.region}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`status-dot ${s.status}`} />
                    <span style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: s.status === 'online' ? '#22C55E' : s.status === 'degraded' ? '#FBBF24' : '#F87171',
                    }}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="num" style={{
                    color: s.uptime >= 99.9 ? '#22C55E' : s.uptime >= 99 ? '#FBBF24' : '#F87171',
                    fontWeight: 600,
                  }}>
                    {s.uptime.toFixed(2)}%
                  </span>
                </td>
                <td>
                  <span className="num" style={{
                    color: s.response_ms === 0 ? '#F87171' : s.response_ms > 200 ? '#FBBF24' : '#22C55E',
                    fontWeight: 600,
                  }}>
                    {s.response_ms === 0 ? '—' : `${s.response_ms}ms`}
                  </span>
                </td>
                <td>
                  <MiniBar value={s.cpu} color={s.cpu > 80 ? '#F87171' : s.cpu > 60 ? '#FBBF24' : '#22C55E'} />
                </td>
                <td>
                  <MiniBar value={s.memory} color={s.memory > 85 ? '#F87171' : s.memory > 70 ? '#FBBF24' : '#60A5FA'} />
                </td>
                <td>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {s.checked}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
