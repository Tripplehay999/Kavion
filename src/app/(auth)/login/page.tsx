'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap, Mail, Lock, ArrowRight, Loader2, AlertTriangle } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const IS_CONFIGURED = SUPABASE_URL.length > 0 && !SUPABASE_URL.includes('your-project-id')

function friendlyError(msg: string): string {
  if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
    return 'Cannot reach Supabase — check your NEXT_PUBLIC_SUPABASE_URL in .env.local and restart the dev server.'
  }
  if (msg.toLowerCase().includes('invalid login credentials')) {
    return 'Wrong email or password.'
  }
  return msg
}

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(friendlyError(authError.message))
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
            borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)',
          }}>
            <Zap size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
            KAVION
          </span>
        </Link>
      </div>

      {/* Card */}
      <div className="card" style={{ padding: '32px 32px 28px' }}>
        <div style={{ marginBottom: 26 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Sign in to your command center
          </p>
        </div>

        {/* Not configured warning */}
        {!IS_CONFIGURED && (
          <div style={{ padding: '14px 16px', borderRadius: 10, marginBottom: 20, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <AlertTriangle size={15} color="#FBBF24" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#FBBF24', marginBottom: 6 }}>Supabase not configured</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Add your credentials to <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4 }}>.env.local</code> and restart the dev server:
                </div>
                <pre style={{ margin: '8px 0 0', padding: '9px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 7, fontSize: 11, fontFamily: 'var(--font-mono)', color: '#A78BFA', lineHeight: 1.7, overflow: 'auto' }}>
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, marginBottom: 18,
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)',
            fontSize: 13, color: '#F87171',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 7 }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="field-input"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
              <a href="#" style={{ fontSize: 12, color: 'var(--violet-light)', textDecoration: 'none' }}>Forgot?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="field-input"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', marginTop: 4, fontSize: 14 }}
          >
            {loading ? (
              <>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                Signing in…
              </>
            ) : (
              <>Sign In <ArrowRight size={15} /></>
            )}
          </button>
        </form>
      </div>

      {/* Switch */}
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--text-muted)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: 'var(--violet-light)', textDecoration: 'none', fontWeight: 500 }}>
          Get started free
        </Link>
      </p>
    </div>
  )
}
