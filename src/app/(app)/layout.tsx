import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/app/actions/profile'
import { getNavCounts } from '@/app/actions/nav'
import AppShellClient from '@/components/AppShellClient'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, navCounts] = await Promise.all([getProfile(), getNavCounts()])
  const displayName = profile?.display_name?.trim() || null
  const avatarColor = profile?.avatar_color ?? '#7C3AED'

  return (
    <AppShellClient userEmail={user.email ?? ''} displayName={displayName} avatarColor={avatarColor} navCounts={navCounts}>
      {children}
    </AppShellClient>
  )
}
