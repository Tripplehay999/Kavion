import { Code2, Plus, Copy, Search } from 'lucide-react'

const SNIPPETS = [
  {
    title: 'useDebounce hook',
    description: 'Debounce any value with configurable delay',
    language: 'TypeScript',
    tags: ['React', 'Hooks', 'Performance'],
    code: `function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}`,
    added: '2d ago',
  },
  {
    title: 'Supabase auth middleware',
    description: 'Next.js middleware for Supabase session refresh',
    language: 'TypeScript',
    tags: ['Next.js', 'Supabase', 'Auth'],
    code: `export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)
  await supabase.auth.getSession()
  return response
}`,
    added: '5d ago',
  },
  {
    title: 'cn() utility',
    description: 'Merge Tailwind classes conditionally with clsx',
    language: 'TypeScript',
    tags: ['Tailwind', 'Utility'],
    code: `import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}`,
    added: '1w ago',
  },
  {
    title: 'Rate limiter (Redis)',
    description: 'Simple sliding window rate limiter using Redis',
    language: 'Python',
    tags: ['Redis', 'API', 'Security'],
    code: `async def is_rate_limited(key: str, limit=10, window=60) -> bool:
    now = time.time()
    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, now - window)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window)
    _, _, count, _ = await pipe.execute()
    return count > limit`,
    added: '2w ago',
  },
  {
    title: 'Postgres upsert pattern',
    description: 'Insert or update with conflict resolution',
    language: 'SQL',
    tags: ['Postgres', 'Database'],
    code: `INSERT INTO users (id, email, updated_at)
VALUES ($1, $2, NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW()
WHERE users.email IS DISTINCT FROM EXCLUDED.email;`,
    added: '3w ago',
  },
  {
    title: 'Exponential backoff',
    description: 'Retry with exponential backoff and jitter',
    language: 'TypeScript',
    tags: ['Async', 'Resilience', 'Utility'],
    code: `async function retry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try { return await fn() }
    catch (err) {
      if (attempt === maxAttempts - 1) throw err
      const delay = Math.min(1000 * 2 ** attempt + Math.random() * 100, 10000)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw new Error('Max retries exceeded')
}`,
    added: '1m ago',
  },
]

const LANG_COLOR: Record<string, { bg: string; color: string }> = {
  TypeScript: { bg: 'rgba(59,130,246,0.12)',  color: '#60A5FA' },
  Python:     { bg: 'rgba(234,179,8,0.12)',    color: '#EAB308' },
  SQL:        { bg: 'rgba(16,185,129,0.12)',   color: '#34D399' },
  JavaScript: { bg: 'rgba(251,191,36,0.12)',   color: '#FBBF24' },
  Bash:       { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8' },
}

const TAG_COLOR: Record<string, string> = {
  React: '#61DAFB', 'Next.js': '#fff', Supabase: '#3ECF8E', Tailwind: '#38BDF8',
  Redis: '#FF6B6B', API: '#F97316', Auth: '#7C3AED', Hooks: '#EC4899',
  Postgres: '#4169E1', Database: '#64748B', Async: '#06B6D4', Security: '#EF4444',
}

const languages = ['All', ...Array.from(new Set(SNIPPETS.map(s => s.language)))]

export default function SnippetsPage() {
  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{
            background: 'rgba(6,182,212,0.08)',
            color: '#22D3EE',
            border: '1px solid rgba(6,182,212,0.2)',
          }}>
            <Code2 size={12} />
            Snippets
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Code Snippet Vault
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            {SNIPPETS.length} snippets saved. Your personal code library.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost">
            <Search size={14} />
            Search
          </button>
          <button className="btn btn-primary">
            <Plus size={14} />
            New Snippet
          </button>
        </div>
      </div>

      {/* ── Language Filter ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {languages.map((lang, i) => (
          <button
            key={lang}
            className="btn btn-ghost btn-sm"
            style={i === 0 ? {
              background: 'rgba(6,182,212,0.1)',
              color: '#22D3EE',
              border: '1px solid rgba(6,182,212,0.3)',
            } : {}}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {SNIPPETS.map((s) => {
          const lc = LANG_COLOR[s.language] ?? { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8' }
          return (
            <div key={s.title} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{
                padding: '16px 20px 14px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{s.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                  <span className="badge" style={{ background: lc.bg, color: lc.color }}>
                    {s.language}
                  </span>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              {/* Code block */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '14px 18px',
                overflow: 'auto',
                maxHeight: 160,
              }}>
                <pre style={{
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  lineHeight: 1.65,
                  color: '#CBD5E1',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {s.code}
                </pre>
              </div>

              {/* Footer */}
              <div style={{
                padding: '10px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {s.tags.map((tag) => (
                    <span key={tag} className="badge" style={{
                      background: `${TAG_COLOR[tag] ?? '#64748B'}18`,
                      color: TAG_COLOR[tag] ?? '#64748B',
                      fontSize: 10.5,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  {s.added}
                </span>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
