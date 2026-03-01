import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/app/actions/profile'
import AppShellClient from '@/components/AppShellClient'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  const displayName = profile?.display_name?.trim() || null
  const avatarColor = profile?.avatar_color ?? '#7C3AED'

  return (
    <AppShellClient userEmail={user.email ?? ''} displayName={displayName} avatarColor={avatarColor}>
      {children}
    </AppShellClient>
  )
}
