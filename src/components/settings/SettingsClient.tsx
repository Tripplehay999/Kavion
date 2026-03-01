'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, AlertCircle, Key, Youtube, CreditCard, Database, Eye, EyeOff, Loader2, Github } from 'lucide-react'
import { saveSettings } from '@/app/actions/settings'
import { disconnectGithub } from '@/app/actions/github'

interface Props {
  savedSettings: Record<string, string>
  supabaseConfigured: boolean
  supabaseUrl: string
  githubConnected: boolean
  githubUsername: string | null
  githubAvatarUrl: string | null
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
      background: active ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
      color: active ? '#22C55E' : '#64748B',
      border: `1px solid ${active ? 'rgba(34,197,94,0.25)' : 'rgba(100,116,139,0.2)'}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#22C55E' : '#64748B', display: 'inline-block' }} />
      {label}
    </span>
  )
}

function MaskedInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  disabled?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="field-input"
        style={{ width: '100%', paddingRight: 38, boxSizing: 'border-box', opacity: disabled ? 0.5 : 1 }}
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)' }}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

export default function SettingsClient({ savedSettings, supabaseConfigured, supabaseUrl, githubConnected, githubUsername, githubAvatarUrl }: Props) {
  const [youtube, setYoutube] = useState({
    YOUTUBE_API_KEY:    savedSettings.YOUTUBE_API_KEY    ?? '',
    YOUTUBE_CHANNEL_ID: savedSettings.YOUTUBE_CHANNEL_ID ?? '',
  })
  const [stripe, setStripe] = useState({
    STRIPE_SECRET_KEY: savedSettings.STRIPE_SECRET_KEY ?? '',
  })
  const [github, setGithub] = useState({
    GITHUB_CLIENT_ID:     savedSettings.GITHUB_CLIENT_ID     ?? '',
    GITHUB_CLIENT_SECRET: savedSettings.GITHUB_CLIENT_SECRET ?? '',
  })

  const [ytSaved,  setYtSaved]  = useState(false)
  const [strSaved, setStrSaved] = useState(false)
  const [ghSaved,  setGhSaved]  = useState(false)
  const [error,    setError]    = useState('')
  const [isPending, startTransition] = useTransition()
  const [ghDisconnecting, startGhDisconnect] = useTransition()

  const githubOAuthConfigured = !!(savedSettings.GITHUB_CLIENT_ID || savedSettings.GITHUB_CLIENT_SECRET)

  const save = (data: Record<string, string>, onSuccess: () => void) => {
    setError('')
    startTransition(async () => {
      try {
        await saveSettings(data)
        onSuccess()
        setTimeout(() => { setYtSaved(false); setStrSaved(false); setGhSaved(false) }, 3000)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save')
      }
    })
  }

  const ytConfigured  = !!(savedSettings.YOUTUBE_API_KEY && savedSettings.YOUTUBE_CHANNEL_ID)
  const strConfigured = !!savedSettings.STRIPE_SECRET_KEY

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, fontSize: 13, color: '#F87171' }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {/* ── Supabase ── */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(62,207,142,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={16} color="#3ECF8E" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Supabase</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Database + Auth</div>
            </div>
          </div>
          <StatusBadge active={supabaseConfigured} label={supabaseConfigured ? 'Connected' : 'Not configured'} />
        </div>

        {supabaseConfigured ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={14} color="#22C55E" />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Connected to <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: 12 }}>{supabaseUrl}</span>
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Supabase credentials are set via <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>.env.local</code>. Run <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>supabase/schema.sql</code> in the Supabase SQL Editor to create all tables.
            </p>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Add these to <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>.env.local</code> in your project root:
            <pre style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: '#A78BFA', overflow: 'auto' }}>
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...`}
            </pre>
          </div>
        )}
      </div>

      {/* ── YouTube ── */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Youtube size={16} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>YouTube</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Channel stats + live data</div>
            </div>
          </div>
          <StatusBadge active={ytConfigured} label={ytConfigured ? 'Connected' : 'Not configured'} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>YouTube Data API Key</label>
            <MaskedInput
              value={youtube.YOUTUBE_API_KEY}
              onChange={v => setYoutube(p => ({ ...p, YOUTUBE_API_KEY: v }))}
              placeholder="AIza..."
              disabled={!supabaseConfigured}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Channel ID</label>
            <input
              type="text"
              value={youtube.YOUTUBE_CHANNEL_ID}
              onChange={e => setYoutube(p => ({ ...p, YOUTUBE_CHANNEL_ID: e.target.value }))}
              placeholder="UCxxxxxxxxxxxxxxx"
              disabled={!supabaseConfigured}
              className="field-input"
              style={{ width: '100%', boxSizing: 'border-box', opacity: supabaseConfigured ? 1 : 0.5 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <button
              className="btn btn-primary"
              style={{ fontSize: 13 }}
              onClick={() => save(youtube, () => setYtSaved(true))}
              disabled={isPending || !supabaseConfigured}
            >
              {isPending ? <Loader2 size={13} className="spin" /> : <Key size={13} />}
              Save YouTube Keys
            </button>
            {ytSaved && (
              <span style={{ fontSize: 12, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={13} /> Saved — refresh the YouTube page to see live data
              </span>
            )}
            {!supabaseConfigured && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure Supabase first</span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Get your API key from <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noreferrer" style={{ color: '#A78BFA' }}>Google Cloud Console</a>. Enable the YouTube Data API v3.
          </p>
        </div>
      </div>

      {/* ── Stripe ── */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} color="#818CF8" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Stripe</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live MRR from subscriptions</div>
            </div>
          </div>
          <StatusBadge active={strConfigured} label={strConfigured ? 'Connected' : 'Not configured'} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Stripe Secret Key</label>
            <MaskedInput
              value={stripe.STRIPE_SECRET_KEY}
              onChange={v => setStripe(p => ({ ...p, STRIPE_SECRET_KEY: v }))}
              placeholder="sk_live_..."
              disabled={!supabaseConfigured}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <button
              className="btn btn-primary"
              style={{ fontSize: 13 }}
              onClick={() => save(stripe, () => setStrSaved(true))}
              disabled={isPending || !supabaseConfigured}
            >
              {isPending ? <Loader2 size={13} className="spin" /> : <Key size={13} />}
              Save Stripe Key
            </button>
            {strSaved && (
              <span style={{ fontSize: 12, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={13} /> Saved — Revenue page will show live MRR
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Use a restricted key with read access to <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>subscriptions</code>. Never use your full secret key in production.
          </p>
        </div>
      </div>

      {/* ── GitHub ── */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Github size={16} color="var(--text-secondary)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>GitHub</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Import repositories as projects</div>
            </div>
          </div>
          <StatusBadge active={githubConnected} label={githubConnected ? 'Connected' : 'Not connected'} />
        </div>

        {/* Connected state */}
        {githubConnected && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {githubAvatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={githubAvatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>@{githubUsername}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Connected via OAuth</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="/projects" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Import repos →</a>
              <button
                className="btn btn-ghost btn-sm" style={{ color: '#F87171' }}
                disabled={ghDisconnecting}
                onClick={() => startGhDisconnect(async () => { await disconnectGithub() })}
              >
                {ghDisconnecting ? <Loader2 size={12} className="spin" /> : 'Disconnect'}
              </button>
            </div>
          </div>
        )}

        {/* OAuth App credentials */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>GitHub Client ID</label>
            <input
              type="text"
              value={github.GITHUB_CLIENT_ID}
              onChange={e => setGithub(p => ({ ...p, GITHUB_CLIENT_ID: e.target.value }))}
              placeholder="Ov23lixxxxxxxxxxxxxxxxxx"
              disabled={!supabaseConfigured}
              className="field-input"
              style={{ width: '100%', boxSizing: 'border-box', opacity: supabaseConfigured ? 1 : 0.5 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>GitHub Client Secret</label>
            <MaskedInput
              value={github.GITHUB_CLIENT_SECRET}
              onChange={v => setGithub(p => ({ ...p, GITHUB_CLIENT_SECRET: v }))}
              placeholder="your_client_secret"
              disabled={!supabaseConfigured}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => save(github, () => setGhSaved(true))}
              disabled={isPending || !supabaseConfigured}
            >
              {isPending ? <Loader2 size={13} className="spin" /> : <Key size={13} />}
              Save OAuth Credentials
            </button>
            {githubOAuthConfigured && !githubConnected && (
              <a href="/api/github/auth" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                <Github size={13} /> Sign in with GitHub
              </a>
            )}
            {ghSaved && (
              <span style={{ fontSize: 12, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={13} /> Saved — click Sign in with GitHub
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            <a href="https://github.com/settings/developers" target="_blank" rel="noreferrer" style={{ color: '#A78BFA' }}>Create a GitHub OAuth App</a>
            {' '}and set the callback URL to{' '}
            <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>http://localhost:3000/api/github/callback</code>
          </p>
        </div>
      </div>

    </div>
  )
}
