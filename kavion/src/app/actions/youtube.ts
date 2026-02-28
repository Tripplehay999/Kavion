'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.length > 0 && !url.includes('your-project-id')
}

function isYouTubeConfigured() {
  return !!(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_CHANNEL_ID)
}

export async function getYouTubeVideos() {
  if (!isConfigured()) return []
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('youtube_videos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  return data ?? []
}

export async function addYouTubeVideo(input: {
  title: string; stage?: string; description?: string; tags?: string[]
}) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('youtube_videos').insert({ user_id: user.id, ...input })
  if (error) throw new Error(error.message)
  revalidatePath('/youtube')
}

export async function updateVideoStage(id: string, stage: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const updates: Record<string, unknown> = { stage }
  if (stage === 'published') updates.published_at = new Date().toISOString()
  const { error } = await supabase.from('youtube_videos').update(updates).eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/youtube')
}

export async function deleteYouTubeVideo(id: string) {
  if (!isConfigured()) throw new Error('Supabase not configured')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('youtube_videos').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/youtube')
}

/** Fetch real channel stats from YouTube Data API v3 */
export async function getYouTubeChannelStats() {
  if (!isYouTubeConfigured()) return null

  const apiKey = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`,
      { next: { revalidate: 3600 } } // cache 1 hour
    )
    const json = await res.json()
    const ch = json.items?.[0]
    if (!ch) return null

    return {
      name:         ch.snippet.title,
      description:  ch.snippet.description,
      thumbnail:    ch.snippet.thumbnails?.default?.url,
      subscribers:  Number(ch.statistics.subscriberCount),
      views:        Number(ch.statistics.viewCount),
      videos:       Number(ch.statistics.videoCount),
    }
  } catch {
    return null
  }
}

/** Fetch latest published videos from YouTube API */
export async function getYouTubeLatestVideos(maxResults = 10) {
  if (!isYouTubeConfigured()) return []

  const apiKey = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID

  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=${maxResults}&type=video&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    const searchJson = await searchRes.json()
    const videoIds = searchJson.items?.map((i: { id: { videoId: string } }) => i.id.videoId).join(',')
    if (!videoIds) return []

    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    const statsJson = await statsRes.json()

    return statsJson.items?.map((v: {
      id: string
      snippet: { title: string; thumbnails: { medium: { url: string } }; publishedAt: string }
      statistics: { viewCount: string; likeCount: string; commentCount: string }
    }) => ({
      youtube_id:    v.id,
      title:         v.snippet.title,
      thumbnail_url: v.snippet.thumbnails?.medium?.url,
      published_at:  v.snippet.publishedAt,
      views:         Number(v.statistics.viewCount),
      likes:         Number(v.statistics.likeCount),
      comments:      Number(v.statistics.commentCount),
    })) ?? []
  } catch {
    return []
  }
}
