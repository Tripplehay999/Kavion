'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const IS_CONFIGURED = SUPABASE_URL.length > 0 && !SUPABASE_URL.includes('your-project-id')

export default function SignupPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (authError) {
      const msg = authError.message
      setError(
        msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')
          ? 'Cannot reach Supabase — check your NEXT_PUBLIC_SUPABASE_URL in .env.local and restart the dev server.'
          : msg
      )
      setLoading(false)
      return
    }

    // If email confirmation is disabled in Supabase, redirect immediately
    // Otherwise show the confirmation prompt
    setDone(true)
    setLoading(false)

    // Auto-redirect after 2 seconds if session exists
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (done) {
    return (
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <CheckCircle2 size={26} color="#22C55E" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
          You&apos;re in
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          Account created. Redirecting to your command center…
        </p>
        <Link href="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', justifyContent: 'center' }}>
          Go to Dashboard <ArrowRight size={15} />
        </Link>
      </div>
    )
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
            Create your OS
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Set up your personal command center
          </p>
        </div>

        {/* Not configured warning */}
        {!IS_CONFIGURED && (
          <div style={{ padding: '14px 16px', borderRadius: 10, marginBottom: 20, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <AlertTriangle size={15} color="#FBBF24" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#FBBF24', marginBottom: 4 }}>Supabase not configured</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Add credentials to <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4 }}>.env.local</code> and restart the dev server.
                </div>
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

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 7 }}>
              Full name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="field-input"
              />
            </div>
          </div>

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
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 7 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="field-input"
              />
            </div>
            {/* Strength hint */}
            {password.length > 0 && (
              <div style={{ display: 'flex', gap: 3, marginTop: 7 }}>
                {[1, 2, 3, 4].map((level) => {
                  const strength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : 1
                  return (
                    <div key={level} style={{
                      flex: 1, height: 3, borderRadius: 99,
                      background: level <= strength
                        ? strength >= 3 ? '#22C55E' : strength === 2 ? '#FBBF24' : '#F87171'
                        : 'rgba(255,255,255,0.06)',
                      transition: 'background 200ms',
                    }} />
                  )
                })}
              </div>
            )}
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
                Creating account…
              </>
            ) : (
              <>Create Account <ArrowRight size={15} /></>
            )}
          </button>
        </form>

        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 18, lineHeight: 1.6 }}>
          By signing up you agree that this is your personal OS<br />and you&apos;ll build something great with it.
        </p>
      </div>

      {/* Switch */}
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--violet-light)', textDecoration: 'none', fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
