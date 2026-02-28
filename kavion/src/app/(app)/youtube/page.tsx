import { Youtube, Plus, Eye, ThumbsUp, Users, ArrowUp, ExternalLink } from 'lucide-react'
import { getYouTubeChannelStats, getYouTubeLatestVideos } from '@/app/actions/youtube'

type VideoStage = 'idea' | 'scripting' | 'recording' | 'editing' | 'scheduled' | 'published'

interface VideoRow {
  youtube_id: string | null
  title: string
  views: number
  likes: number
  comments: number
  thumbnail_url: string | null
  published_at: string | null
}

const MOCK_VIDEOS: { title: string; stage: VideoStage; views?: number; published?: string }[] = [
  { title: 'I built my own OS in Next.js',               stage: 'published', views: 48200, published: 'Feb 14' },
  { title: 'How I track $12k MRR as a solo founder',    stage: 'published', views: 31500, published: 'Feb 07' },
  { title: 'My full Supabase auth setup (2025)',         stage: 'scheduled', published: 'Mar 01' },
  { title: 'Building a habit tracker that actually works', stage: 'editing'   },
  { title: 'Acquisition diaries: $45k deal breakdown',  stage: 'recording' },
  { title: 'Tailwind v4 deep dive for builders',         stage: 'scripting' },
  { title: '5 code snippets I use every project',        stage: 'scripting' },
  { title: 'From idea to $1k MRR in 30 days',           stage: 'idea'      },
  { title: 'Why I track my servers from a dashboard',    stage: 'idea'      },
]

const STAGE_CONFIG: Record<VideoStage, { label: string; bg: string; color: string; order: number }> = {
  idea:       { label: 'Idea',       bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', order: 0 },
  scripting:  { label: 'Scripting',  bg: 'rgba(245,158,11,0.1)', color: '#FBBF24', order: 1 },
  recording:  { label: 'Recording',  bg: 'rgba(249,115,22,0.1)', color: '#FB923C', order: 2 },
  editing:    { label: 'Editing',    bg: 'rgba(59,130,246,0.1)', color: '#60A5FA', order: 3 },
  scheduled:  { label: 'Scheduled',  bg: 'rgba(167,139,250,0.1)',color: '#A78BFA', order: 4 },
  published:  { label: 'Published',  bg: 'rgba(34,197,94,0.1)',  color: '#22C55E', order: 5 },
}

const STAGES: VideoStage[] = ['idea', 'scripting', 'recording', 'editing', 'scheduled', 'published']

export default async function YouTubePage() {
  const [channelStats, liveVideos] = await Promise.all([
    getYouTubeChannelStats(),
    getYouTubeLatestVideos(6),
  ])

  const isYtConfigured = !!channelStats

  const CHANNEL = channelStats ?? {
    name: '@kavionbuilds', subscribers: 12400, views: 842000, videos: 87,
  }

  const published = MOCK_VIDEOS.filter(v => v.stage === 'published')
  const pipeline  = MOCK_VIDEOS.filter(v => v.stage !== 'published')

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{ background: 'rgba(239,68,68,0.08)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Youtube size={12} /> YouTube
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            YouTube Automation
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Content pipeline + {isYtConfigured ? 'live' : 'demo'} channel analytics.
            {!isYtConfigured && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> Add YOUTUBE_API_KEY + YOUTUBE_CHANNEL_ID to .env.local for live data.</span>}
          </p>
        </div>
        <button className="btn btn-primary"><Plus size={14} /> New Video</button>
      </div>

      {/* ── Channel Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Subscribers', value: `${(CHANNEL.subscribers / 1000).toFixed(1)}k`, icon: Users,   color: '#EF4444', sub: isYtConfigured ? 'Live'        : '+340 this month' },
          { label: 'Total Views',  value: `${(CHANNEL.views / 1000).toFixed(0)}k`,      icon: Eye,     color: '#F87171', sub: isYtConfigured ? 'All time'    : '+28%'           },
          { label: 'Videos',       value: String(CHANNEL.videos),                        icon: Youtube, color: '#FB923C', sub: isYtConfigured ? 'Published'   : 'Published'      },
          { label: 'In Pipeline',  value: String(pipeline.length),                       icon: ArrowUp, color: '#FBBF24', sub: 'Active videos',                                 },
        ].map((s) => (
          <div key={s.label} className="card stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={14} color={s.color} strokeWidth={2} />
              </div>
            </div>
            <div className="num" style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── 6-Column Kanban Pipeline ── */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Content Pipeline</h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{MOCK_VIDEOS.length} total videos</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0 }}>
          {STAGES.map((stage, si) => {
            const cfg   = STAGE_CONFIG[stage]
            const items = MOCK_VIDEOS.filter(v => v.stage === stage)
            return (
              <div key={stage} style={{
                borderRight: si < STAGES.length - 1 ? '1px solid var(--border)' : 'none',
                minHeight: 200,
              }}>
                <div style={{
                  padding: '10px 12px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: `${cfg.color}06`,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {cfg.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{items.length}</span>
                </div>
                <div style={{ padding: '8px' }}>
                  {items.map((v, i) => (
                    <div key={i} style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 7, padding: '8px 9px', marginBottom: 6,
                      fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4,
                      cursor: 'pointer', transition: 'border-color 140ms ease',
                    }}>
                      {v.title}
                      {v.views && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, fontSize: 10, color: cfg.color, fontFamily: 'var(--font-mono)' }}>
                          <Eye size={9} /> {(v.views / 1000).toFixed(1)}k
                        </div>
                      )}
                      {v.published && !v.views && (
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                          {v.published}
                        </div>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div style={{ padding: '12px 4px', textAlign: 'center', fontSize: 11, color: 'var(--border-hover)', borderRadius: 6, border: '1px dashed var(--border)' }}>
                      Empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Published Videos (live from YT API or mock) ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
              Published Videos {isYtConfigured && <span style={{ fontSize: 11, color: '#22C55E', marginLeft: 6, background: 'rgba(34,197,94,0.1)', padding: '1px 7px', borderRadius: 99 }}>● LIVE</span>}
            </h2>
          </div>
          <a href={`https://youtube.com/${CHANNEL.name}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            Open Channel <ExternalLink size={11} />
          </a>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Title</th><th>Views</th><th>Likes</th><th>Published</th><th></th></tr>
          </thead>
          <tbody>
            {(isYtConfigured ? liveVideos as VideoRow[] : published.map(pv => ({
              youtube_id: null as string | null,
              title: pv.title,
              views: pv.views ?? 0,
              likes: Math.round((pv.views ?? 0) * 0.04),
              comments: Math.round((pv.views ?? 0) * 0.008),
              thumbnail_url: null as string | null,
              published_at: pv.published ?? null,
            } satisfies VideoRow))).map((v, i) => (
              <tr key={i}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {v.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.thumbnail_url} alt="" style={{ width: 48, height: 27, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13 }}>{v.title}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Eye size={12} color="#EF4444" />
                    <span className="num" style={{ color: '#EF4444', fontWeight: 600 }}>{Number(v.views).toLocaleString()}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ThumbsUp size={12} color="#F87171" />
                    <span className="num">{Number(v.likes).toLocaleString()}</span>
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {v.published_at
                    ? (typeof v.published_at === 'string' && v.published_at.includes('T')
                      ? new Date(v.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : v.published_at)
                    : '—'}
                </td>
                <td>
                  {v.youtube_id && (
                    <a href={`https://youtube.com/watch?v=${v.youtube_id}`} target="_blank" rel="noreferrer">
                      <ExternalLink size={12} color="var(--text-muted)" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
