import { Youtube, Eye, ThumbsUp, Users, ArrowUp, ExternalLink, AlertCircle } from 'lucide-react'
import { getYouTubeChannelStats, getYouTubeLatestVideos, getYouTubeVideos, getYtStatus } from '@/app/actions/youtube'
import YoutubeKanban from '@/components/youtube/YoutubeKanban'

interface VideoRow {
  youtube_id: string | null
  title: string
  views: number
  likes: number
  comments: number
  thumbnail_url: string | null
  published_at: string | null
}

const MOCK_PIPELINE = [
  { id: 'mock-1', title: 'I built my own OS in Next.js',               stage: 'published', views: 48200, published_at: '2026-02-14T00:00:00Z' },
  { id: 'mock-2', title: 'How I track $12k MRR as a solo founder',    stage: 'published', views: 31500, published_at: '2026-02-07T00:00:00Z' },
  { id: 'mock-3', title: 'My full Supabase auth setup (2025)',         stage: 'scheduled', published_at: '2026-03-01T00:00:00Z' },
  { id: 'mock-4', title: 'Building a habit tracker that actually works', stage: 'editing'   },
  { id: 'mock-5', title: 'Acquisition diaries: $45k deal breakdown',  stage: 'recording' },
  { id: 'mock-6', title: 'Tailwind v4 deep dive for builders',         stage: 'scripting' },
  { id: 'mock-7', title: '5 code snippets I use every project',        stage: 'scripting' },
  { id: 'mock-8', title: 'From idea to $1k MRR in 30 days',           stage: 'idea'      },
  { id: 'mock-9', title: 'Why I track my servers from a dashboard',    stage: 'idea'      },
]

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

export default async function YouTubePage() {
  const supabaseOk = isSupabaseConfigured()

  const [{ data: channelStats, error: ytError }, ytStatus, liveVideos, pipelineVideos] = await Promise.all([
    getYouTubeChannelStats(),
    getYtStatus(),
    getYouTubeLatestVideos(6),
    supabaseOk ? getYouTubeVideos() : Promise.resolve([]),
  ])

  const isYtConfigured  = !!channelStats
  const isLive          = supabaseOk
  // credentials were saved but API call failed
  const ytApiError = ytStatus.credentialsFound && !channelStats ? ytError : null

  const CHANNEL = channelStats ?? {
    name: '@kavionbuilds', subscribers: 12400, views: 842000, videos: 87,
  }

  const displayVideos = isLive ? pipelineVideos : MOCK_PIPELINE
  const pipelineCount = displayVideos.filter((v: { stage?: string }) => v.stage !== 'published').length

  const publishedVideos = isYtConfigured
    ? (liveVideos as VideoRow[])
    : MOCK_PIPELINE.filter(v => v.stage === 'published').map(v => ({
        youtube_id: null as string | null,
        title: v.title,
        views: v.views ?? 0,
        likes: Math.round((v.views ?? 0) * 0.04),
        comments: Math.round((v.views ?? 0) * 0.008),
        thumbnail_url: null as string | null,
        published_at: v.published_at ?? null,
      }))

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{ background: 'rgba(239,68,68,0.08)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Youtube size={12} /> YouTube
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            YouTube Studio
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Drag-and-drop content pipeline + {isYtConfigured ? 'live' : 'demo'} channel analytics.
          </p>
        </div>
      </div>

      {/* ── YouTube API error banner ── */}
      {ytApiError && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, marginBottom: 18, fontSize: 13, color: '#FBBF24' }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>YouTube API error:</strong> {ytApiError}
            <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              Your API key and Channel ID are saved — check that YouTube Data API v3 is enabled in Google Cloud Console, and that your Channel ID starts with <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>UC…</code>
            </span>
          </div>
        </div>
      )}
      {!ytStatus.credentialsFound && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(100,116,139,0.07)', border: '1px solid rgba(100,116,139,0.15)', borderRadius: 10, marginBottom: 18, fontSize: 13, color: 'var(--text-muted)' }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          Showing demo data — go to <a href="/settings" style={{ color: '#A78BFA', textDecoration: 'underline' }}>Settings</a> to connect your YouTube channel.
        </div>
      )}

      {/* ── Channel Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Subscribers', value: `${(CHANNEL.subscribers / 1000).toFixed(1)}k`, icon: Users,   color: '#EF4444', sub: isYtConfigured ? 'Live'       : '+340 this month' },
          { label: 'Total Views',  value: `${(CHANNEL.views / 1000).toFixed(0)}k`,      icon: Eye,     color: '#F87171', sub: isYtConfigured ? 'All time'   : '+28%'           },
          { label: 'Videos',       value: String(CHANNEL.videos),                        icon: Youtube, color: '#FB923C', sub: 'Published'                                      },
          { label: 'In Pipeline',  value: String(pipelineCount),                         icon: ArrowUp, color: '#FBBF24', sub: 'Active videos'                                  },
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

      {/* ── DnD Kanban Pipeline ── */}
      <YoutubeKanban initialVideos={displayVideos} isLive={isLive} />

      {/* ── Published Videos ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
              Published Videos
              {isYtConfigured && <span style={{ fontSize: 11, color: '#22C55E', marginLeft: 8, background: 'rgba(34,197,94,0.1)', padding: '1px 8px', borderRadius: 99 }}>● LIVE</span>}
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
            {publishedVideos.map((v, i) => (
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
