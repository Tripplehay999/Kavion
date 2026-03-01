import { Server } from 'lucide-react'
import { getServers } from '@/app/actions/servers'
import ServersClient from '@/components/servers/ServersClient'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

const MOCK_SERVERS = [
  { id: 'mock-s1', name: 'prod-01',     host: '168.119.45.12', region: 'US-East',  provider: 'Hetzner',      ping_url: '', status: 'online',   cpu_pct: 34, memory_pct: 58, uptime_pct: 99.98, response_ms: 42,  last_checked: new Date(Date.now() - 30000).toISOString() },
  { id: 'mock-s2', name: 'prod-02',     host: '168.119.45.13', region: 'US-East',  provider: 'Hetzner',      ping_url: '', status: 'degraded', cpu_pct: 87, memory_pct: 79, uptime_pct: 99.12, response_ms: 284, last_checked: new Date(Date.now() - 30000).toISOString() },
  { id: 'mock-s3', name: 'prod-03',     host: '65.108.70.21',  region: 'EU-West',  provider: 'Hetzner',      ping_url: '', status: 'online',   cpu_pct: 12, memory_pct: 41, uptime_pct: 100,   response_ms: 31,  last_checked: new Date(Date.now() - 31000).toISOString() },
  { id: 'mock-s4', name: 'staging-01',  host: '65.108.70.22',  region: 'EU-West',  provider: 'Hetzner',      ping_url: '', status: 'online',   cpu_pct: 8,  memory_pct: 33, uptime_pct: 99.90, response_ms: 55,  last_checked: new Date(Date.now() - 32000).toISOString() },
  { id: 'mock-s5', name: 'db-primary',  host: '10.0.1.5',      region: 'US-East',  provider: 'Hetzner',      ping_url: '', status: 'online',   cpu_pct: 22, memory_pct: 71, uptime_pct: 99.99, response_ms: 5,   last_checked: new Date(Date.now() - 30000).toISOString() },
  { id: 'mock-s6', name: 'db-replica',  host: '10.0.1.6',      region: 'US-East',  provider: 'Hetzner',      ping_url: '', status: 'online',   cpu_pct: 18, memory_pct: 68, uptime_pct: 99.99, response_ms: 7,   last_checked: new Date(Date.now() - 30000).toISOString() },
  { id: 'mock-s7', name: 'cache-01',    host: '10.0.1.10',     region: 'US-East',  provider: 'Hetzner',      ping_url: '', status: 'online',   cpu_pct: 5,  memory_pct: 44, uptime_pct: 100,   response_ms: 2,   last_checked: new Date(Date.now() - 30000).toISOString() },
  { id: 'mock-s8', name: 'worker-01',   host: '65.108.70.30',  region: 'EU-West',  provider: 'Hetzner',      ping_url: '', status: 'online',   cpu_pct: 61, memory_pct: 55, uptime_pct: 99.80, response_ms: 120, last_checked: new Date(Date.now() - 33000).toISOString() },
  { id: 'mock-s9', name: 'cdn-edge-sg', host: '139.59.1.10',   region: 'AP-South', provider: 'DigitalOcean', ping_url: '', status: 'offline',  cpu_pct: 0,  memory_pct: 0,  uptime_pct: 82.00, response_ms: 0,   last_checked: new Date(Date.now() - 60000).toISOString() },
]

export default async function ServersPage() {
  const live = isConfigured()
  const servers = live ? await getServers() : MOCK_SERVERS

  return (
    <div className="page-scroll">
      <div className="section-header">
        <div>
          <div className="page-accent" style={{ background: 'rgba(34,197,94,0.08)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Server size={12} />
            Servers
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Server Monitor
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            {servers.length} server{servers.length !== 1 ? 's' : ''} tracked. Add a ping URL for live status checks.
          </p>
        </div>
      </div>

      <ServersClient initialServers={servers} isLive={live} />
    </div>
  )
}
