'use server'

import { createClient } from '@/lib/supabase/server'
import { getSetting } from './settings'

async function getAiKey(): Promise<string | null> {
  try {
    // User's own key (from Settings page) takes priority, then site-wide env var
    return (await getSetting('GEMINI_API_KEY')) || process.env.GEMINI_API_KEY || null
  } catch {
    return process.env.GEMINI_API_KEY || null
  }
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `AI API error (${res.status})`)
  }
  const data = await res.json()
  return (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim()
}

function getLast28Days(): string[] {
  const days: string[] = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export async function getHabitInsights(): Promise<string> {
  const apiKey = await getAiKey()
  if (!apiKey) throw new Error('AI is not configured — add a Gemini API key in Settings')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const last28 = getLast28Days()
  const fromDate = last28[0]

  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase.from('habits').select('id, name').eq('user_id', user.id),
    supabase.from('habit_logs').select('habit_id, date').eq('user_id', user.id).gte('date', fromDate).eq('done', true),
  ])

  if (!habits || habits.length === 0) {
    throw new Error('Add some habits first before requesting AI insights')
  }

  const doneSets: Record<string, Set<string>> = {}
  for (const h of habits) doneSets[h.id] = new Set()
  for (const l of (logs ?? [])) {
    if (doneSets[l.habit_id]) doneSets[l.habit_id].add(l.date)
  }

  const habitStats = habits.map(h => {
    const done = doneSets[h.id]
    const totalDone = last28.filter(d => done.has(d)).length
    const last7Done = last28.slice(-7).filter(d => done.has(d)).length
    const pct = Math.round((totalDone / 28) * 100)
    let streak = 0
    for (let i = 0; i < last28.length; i++) {
      if (done.has(last28[last28.length - 1 - i])) streak++
      else break
    }
    return { name: h.name, pct, last7Done, streak }
  })

  const prompt = `You're a productivity coach for a software developer / indie hacker. Analyze their 28-day habit data and give personalized, actionable advice.

Habit data (28-day completion % | last 7 days done | current streak):
${habitStats.map(h => `• ${h.name}: ${h.pct}% | ${h.last7Done}/7 last week | ${h.streak}-day streak`).join('\n')}

Give exactly 4 numbered insights. Include:
1. Positive reinforcement for the strongest habit
2. A concrete, specific strategy for the weakest habit
3. A pattern or trend observation across all habits
4. One coding/work-life balance tip tailored to a developer's lifestyle

Keep each insight to 1-2 sentences. Be warm, direct, and specific. Plain text only, numbered 1-4.`

  return callGemini(prompt, apiKey)
}

export async function getIdeaSuggestions(): Promise<string> {
  const apiKey = await getAiKey()
  if (!apiKey) throw new Error('AI is not configured — add a Gemini API key in Settings')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: ideas } = await supabase
    .from('ideas')
    .select('title, description, status, score, tags')
    .eq('user_id', user.id)
    .order('score', { ascending: false })
    .limit(20)

  const ideaList = (ideas ?? [])
    .map(i => `• [${i.status}, ${i.score}/10] ${i.title}${i.description ? ` — ${i.description}` : ''}${(i.tags ?? []).length ? ` [${i.tags.join(', ')}]` : ''}`)
    .join('\n') || '• No ideas yet'

  const prompt = `You're a startup advisor for a solo developer / indie hacker. Based on their idea vault, suggest new opportunities and sharpen existing ones.

Their current ideas:
${ideaList}

Provide exactly 5 numbered insights:
1. New startup idea #1 — 1-sentence description + why it fits their profile
2. New startup idea #2 — 1-sentence description + why it fits their profile
3. New startup idea #3 — 1-sentence description + why it fits their profile
4. Specific improvement tip for their top-scored idea (how to validate, monetise, or differentiate faster)
5. One market observation relevant to their portfolio

Be specific, bold, and practical. Plain text, numbered 1-5.`

  return callGemini(prompt, apiKey)
}
