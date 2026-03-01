import { Settings } from 'lucide-react'
import { getSettings } from '@/app/actions/settings'
import { getGithubStatus } from '@/app/actions/github'
import SettingsClient from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
  const [savedSettings, githubStatus] = await Promise.all([
    getSettings(),
    getGithubStatus(),
  ])

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseConfigured = supabaseUrl.length > 0 && !supabaseUrl.includes('your-project-id')

  const displayUrl = supabaseConfigured
    ? supabaseUrl.replace('https://', '').replace('.supabase.co', '') + '.supabase.co'
    : ''

  return (
    <div className="page-scroll">

      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div>
          <div className="page-accent" style={{ background: 'rgba(124,58,237,0.08)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.2)' }}>
            <Settings size={12} /> Settings
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 4 }}>
            Integrations
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            Connect your APIs. Keys are stored securely in your Supabase database.
          </p>
        </div>
      </div>

      <SettingsClient
        savedSettings={savedSettings}
        supabaseConfigured={supabaseConfigured}
        supabaseUrl={displayUrl}
        githubConnected={githubStatus.connected}
        githubUsername={githubStatus.username}
        githubAvatarUrl={githubStatus.avatarUrl}
      />

    </div>
  )
}
