'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

export interface UserProfile {
  display_name: string | null
  bio: string | null
  avatar_color: string
  created_at: string
}

export async function getProfile(): Promise<UserProfile | null> {
  if (!isConfigured()) return null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('user_profiles')
      .select('display_name, bio, avatar_color, created_at')
      .eq('id', user.id)
      .single()
    return data ?? { display_name: null, bio: null, avatar_color: '#7C3AED', created_at: user.created_at }
  } catch {
    return null
  }
}

export async function updateProfile(input: {
  display_name?: string
  bio?: string
  avatar_color?: string
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')

  if (input.display_name !== undefined) {
    if (input.display_name.length > 60) throw new Error('Display name must be 60 characters or fewer')
  }
  if (input.bio !== undefined && input.bio.length > 200) {
    throw new Error('Bio must be 200 characters or fewer')
  }
  if (input.avatar_color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(input.avatar_color)) {
    throw new Error('Invalid color format')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      ...input,
      display_name: input.display_name?.trim() ?? undefined,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (error) throw new Error('Failed to update profile')
  revalidatePath('/profile')
  revalidatePath('/dashboard')
}

export async function changePassword(newPassword: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  if (!newPassword || newPassword.length < 8) throw new Error('Password must be at least 8 characters')
  if (newPassword.length > 128) throw new Error('Password must be 128 characters or fewer')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error('Failed to update password')
}
