'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
    pipe.zremrangebyscore(key, 0, now - window)`,
    created_at: '3w ago',
  },
]

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

// ── Validation ────────────────────────────────────────────────────────────────
function validateSnippet(input: {
  title?: string; description?: string; code?: string; language?: string; tags?: string[]
}) {
  if (input.title !== undefined) {
    if (!input.title || input.title.trim().length === 0) throw new Error('Title is required')
    if (input.title.length > 200) throw new Error('Title must be 200 characters or fewer')
  }
  if (input.description !== undefined && input.description.length > 1000)
    throw new Error('Description must be 1000 characters or fewer')
  if (input.code !== undefined) {
    if (!input.code || input.code.trim().length === 0) throw new Error('Code is required')
    if (input.code.length > 100_000) throw new Error('Code must be 100,000 characters or fewer')
  }
  if (input.language !== undefined && input.language.length > 40)
    throw new Error('Language must be 40 characters or fewer')
  if (input.tags !== undefined) {
    if (input.tags.length > 15) throw new Error('Maximum 15 tags allowed')
    for (const tag of input.tags) {
      if (typeof tag !== 'string' || tag.length > 40) throw new Error('Each tag must be 40 characters or fewer')
    }
  }
}

export async function getSnippets(language?: string) {
  if (!isConfigured()) return MOCK_SNIPPETS
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return MOCK_SNIPPETS
    let q = supabase.from('snippets').select('*').eq('user_id', user.id)
    if (language && language !== 'all') q = q.eq('language', language)
    const { data, error } = await q.order('created_at', { ascending: false })
    if (error) return MOCK_SNIPPETS
    return data ?? MOCK_SNIPPETS
  } catch (e) {
    console.error('Error fetching snippets:', e)
    return MOCK_SNIPPETS
  }
}

export async function addSnippet(input: {
  title: string; description?: string; code: string; language: string; tags?: string[]
}) {
  if (!isConfigured()) throw new Error('Configure Supabase to save snippets')
  validateSnippet(input)
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('snippets').insert({
      user_id: user.id, ...input, title: input.title.trim(),
    })
    if (error) throw new Error('Failed to add snippet')
    revalidatePath('/snippets')
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Failed to add snippet')
  }
}

export async function updateSnippet(id: string, input: {
  title?: string; description?: string; code?: string; language?: string; tags?: string[]
}) {
  if (!isConfigured()) throw new Error('Configure Supabase to update snippets')
  if (!id || typeof id !== 'string') throw new Error('Invalid snippet ID')
  validateSnippet(input)
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('snippets').update(input).eq('id', id).eq('user_id', user.id)
    if (error) throw new Error('Failed to update snippet')
    revalidatePath('/snippets')
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Failed to update snippet')
  }
}

export async function deleteSnippet(id: string) {
  if (!isConfigured()) throw new Error('Configure Supabase to delete snippets')
  if (!id || typeof id !== 'string') throw new Error('Invalid snippet ID')
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('snippets').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw new Error('Failed to delete snippet')
    revalidatePath('/snippets')
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Failed to delete snippet')
  }
}
