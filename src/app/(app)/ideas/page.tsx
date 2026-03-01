import { Lightbulb } from 'lucide-react'
import { getIdeas } from '@/app/actions/ideas'
import IdeasClient from '@/components/ideas/IdeasClient'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

const MOCK_IDEAS = [
  { id: 'mock-i1', title: 'AI Changelog Writer',     description: 'Auto-generates changelogs from git commits using GPT-4',                              status: 'building',  score: 8,  tags: ['AI', 'DevTools', 'SaaS'],       created_at: '3d ago' },
  { id: 'mock-i2', title: 'Micro-SaaS Radar',        description: 'Aggregates acquisition listings from Acquire.com, Flippa, MicroAcquire',             status: 'validated', score: 9,  tags: ['Automation', 'SaaS'],            created_at: '1w ago' },
  { id: 'mock-i3', title: 'Habit OS',                description: 'Minimalist habit tracker with streak visualisation + iOS widget',                    status: 'exploring', score: 7,  tags: ['Mobile'],                        created_at: '2w ago' },
  { id: 'mock-i4', title: 'Code Review Copilot',     description: 'GitHub bot that reviews PRs and leaves AI-powered inline comments',                  status: 'exploring', score: 8,  tags: ['AI', 'DevTools'],                created_at: '2w ago' },
  { id: 'mock-i5', title: 'Startup Name Generator',  description: 'Generates brandable names + checks domain availability instantly',                   status: 'shelved',   score: 5,  tags: ['SaaS'],                          created_at: '1m ago' },
  { id: 'mock-i6', title: 'Newsletter Analytics',    description: 'Cross-platform analytics for Substack, Beehiiv, Kit newsletters',                    status: 'exploring', score: 7,  tags: ['Analytics', 'Creator', 'SaaS'],  created_at: '1m ago' },
  { id: 'mock-i7', title: 'Kavion OS',               description: 'Personal command center — projects, revenue, habits in one app',                     status: 'launched',  score: 10, tags: ['SaaS'],                          created_at: '2d ago' },
  { id: 'mock-i8', title: 'Open Source to SaaS',     description: 'Identifies under-monetised OSS projects and packages them as SaaS',                  status: 'exploring', score: 6,  tags: ['OSS', 'SaaS'],                   created_at: '3w ago' },
]

export default async function IdeasPage() {
  const live = isConfigured()
  const ideas = live ? await getIdeas() : MOCK_IDEAS

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{ background: 'rgba(245,158,11,0.08)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Lightbulb size={12} />
            Ideas
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Startup Ideas Vault
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Every idea captured, scored, and tracked.
          </p>
        </div>
      </div>

      <IdeasClient initialIdeas={ideas} isLive={live} />

    </div>
  )
}
