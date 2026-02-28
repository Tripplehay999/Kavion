import { FolderKanban } from 'lucide-react'
import { getProjects } from '@/app/actions/projects'
import ProjectsClient from '@/components/projects/ProjectsClient'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

export default async function ProjectsPage() {
  const live     = isConfigured()
  const projects = await getProjects()

  const active      = projects.filter(p => p.status === 'active').length
  const completed   = projects.filter(p => p.status === 'completed').length
  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + (Number(p.progress) || 0), 0) / projects.length)
    : 0

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{ background: 'rgba(59,130,246,0.08)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
            <FolderKanban size={12} /> Projects
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Project Tracker
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Track every build from idea to done. Click any row for details.
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Projects', value: String(projects.length), color: '#3B82F6' },
          { label: 'Active',         value: String(active),          color: '#22C55E' },
          { label: 'Completed',      value: String(completed),       color: '#A78BFA' },
          { label: 'Avg Progress',   value: `${avgProgress}%`,       color: '#FBBF24' },
        ].map(s => (
          <div key={s.label} className="card stat-card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
              {s.label}
            </div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: '-0.04em' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Full CRUD Table ── */}
      <ProjectsClient
        initialProjects={projects as {
          id: string; name: string; description?: string; status: string; priority: string;
          progress: number; stack: string[]; color: string; updated_at: string
        }[]}
        isLive={live}
      />

    </div>
  )
}
