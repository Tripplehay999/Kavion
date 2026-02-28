import { Code2 } from 'lucide-react'
import { getSnippets } from '@/app/actions/snippets'
import SnippetsClient from '@/components/snippets/SnippetsClient'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

const MOCK_SNIPPETS = [
  {
    id: 'mock-s1', title: 'useDebounce hook', description: 'Debounce any value with configurable delay',
    language: 'TypeScript', tags: ['React', 'Hooks'],
    code: `function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}`,
    created_at: '2d ago',
  },
  {
    id: 'mock-s2', title: 'Supabase auth middleware', description: 'Next.js middleware for Supabase session refresh',
    language: 'TypeScript', tags: ['Next.js', 'Supabase', 'Auth'],
    code: `export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)
  await supabase.auth.getSession()
  return response
}`,
    created_at: '5d ago',
  },
  {
    id: 'mock-s3', title: 'cn() utility', description: 'Merge Tailwind classes conditionally with clsx',
    language: 'TypeScript', tags: ['Tailwind'],
    code: `import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}`,
    created_at: '1w ago',
  },
  {
    id: 'mock-s4', title: 'Rate limiter (Redis)', description: 'Simple sliding window rate limiter using Redis',
    language: 'Python', tags: ['Redis', 'API', 'Security'],
    code: `async def is_rate_limited(key: str, limit=10, window=60) -> bool:
    now = time.time()
    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, now - window)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window)
    _, _, count, _ = await pipe.execute()
    return count > limit`,
    created_at: '2w ago',
  },
  {
    id: 'mock-s5', title: 'Postgres upsert pattern', description: 'Insert or update with conflict resolution',
    language: 'SQL', tags: ['Postgres', 'Database'],
    code: `INSERT INTO users (id, email, updated_at)
VALUES ($1, $2, NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW()
WHERE users.email IS DISTINCT FROM EXCLUDED.email;`,
    created_at: '3w ago',
  },
  {
    id: 'mock-s6', title: 'Exponential backoff', description: 'Retry with exponential backoff and jitter',
    language: 'TypeScript', tags: ['Async'],
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
    created_at: '1m ago',
  },
]

export default async function SnippetsPage() {
  const live = isConfigured()
  const snippets = live ? await getSnippets() : MOCK_SNIPPETS

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header">
        <div>
          <div className="page-accent" style={{ background: 'rgba(6,182,212,0.08)', color: '#22D3EE', border: '1px solid rgba(6,182,212,0.2)' }}>
            <Code2 size={12} />
            Snippets
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Code Snippet Vault
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            {snippets.length} snippet{snippets.length !== 1 ? 's' : ''} saved. Your personal code library.
          </p>
        </div>
      </div>

      <SnippetsClient initialSnippets={snippets} isLive={live} />

    </div>
  )
}
