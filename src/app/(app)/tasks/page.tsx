import { ListTodo } from 'lucide-react'
import { getBlocks } from '@/app/actions/workspace'
import WorkspaceClient from '@/components/workspace/WorkspaceClient'

export const metadata = { title: 'Tasks — Kavion' }

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

export default async function TasksPage() {
  const blocks = await getBlocks()
  const live = isConfigured()
  const todos     = blocks.filter(b => b.type === 'todo')
  const todosDone = todos.filter(b => b.checked).length
  const codeCount = blocks.filter(b => b.type === 'code').length

  return (
    <div className="page-scroll">
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 20px 80px' }}>
        <div className="section-header" style={{ marginBottom: 20 }}>
          <div>
            <div className="page-accent" style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}>
              <ListTodo size={12} /> Tasks
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '8px 0 4px' }}>Workspace</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Notion-style blocks · Drag to reorder · Run code inline</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Blocks', value: String(blocks.length), color: '#8B5CF6' },
            { label: 'Todos Done',   value: `${todosDone}/${todos.length}`, color: '#22C55E' },
            { label: 'Code Blocks',  value: String(codeCount), color: '#06B6D4' },
          ].map(s => (
            <div key={s.label} className="card stat-card">
              <div className="num" style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <WorkspaceClient initialBlocks={blocks} isLive={live} />
      </div>
    </div>
  )
}