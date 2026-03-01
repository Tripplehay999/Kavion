import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/app/actions/profile'
import ProfileClient from '@/components/profile/ProfileClient'

export const metadata = { title: 'Profile — Kavion' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = await getProfile()

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Unknown'

  return (
    <div className="page-scroll">
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 60px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0, marginBottom: 4 }}>
            Profile
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Manage your identity, account info, and security settings.
          </p>
        </div>

        <ProfileClient
          profile={profile}
          email={user?.email ?? ''}
          memberSince={memberSince}
        />
      </div>
    </div>
  )
}
