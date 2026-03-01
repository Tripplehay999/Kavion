// ─────────────────────────────────────────────
//  KAVION — Global TypeScript Definitions
// ─────────────────────────────────────────────

export type Status = 'active' | 'paused' | 'completed' | 'archived'
export type Priority = 'low' | 'medium' | 'high' | 'critical'

// ─── Projects ────────────────────────────────
export interface Project {
  id: string
  name: string
  description: string
  status: Status
  priority: Priority
  progress: number
  tags: string[]
  created_at: string
  updated_at: string
  url?: string
}

// ─── Revenue ─────────────────────────────────
export interface RevenueSource {
  id: string
  name: string
  type: 'saas' | 'freelance' | 'affiliate' | 'product' | 'consulting'
  mrr: number
  growth: number
  status: 'active' | 'inactive'
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
}

// ─── Ideas ───────────────────────────────────
export type IdeaStatus = 'exploring' | 'building' | 'launched' | 'shelved' | 'validated'

export interface Idea {
  id: string
  name: string
  tagline: string
  description?: string
  status: IdeaStatus
  tags: string[]
  score: number // 1–10
  created_at: string
}

// ─── Habits ──────────────────────────────────
export interface Habit {
  id: string
  name: string
  frequency: 'daily' | 'weekly'
  streak: number
  best_streak: number
  completions: string[] // ISO dates
  color: string
}

// ─── Snippets ────────────────────────────────
export interface Snippet {
  id: string
  title: string
  description?: string
  language: string
  code: string
  tags: string[]
  created_at: string
}

// ─── Acquisitions ────────────────────────────
export type AcquisitionStatus =
  | 'watching'
  | 'due-diligence'
  | 'negotiating'
  | 'passed'
  | 'acquired'

export interface Acquisition {
  id: string
  company: string
  url?: string
  category: string
  asking_price?: number
  revenue?: number
  profit?: number
  status: AcquisitionStatus
  notes?: string
  added_at: string
}

// ─── Servers ─────────────────────────────────
export type ServerStatus = 'online' | 'degraded' | 'offline'

export interface Server {
  id: string
  name: string
  host: string
  region: string
  status: ServerStatus
  uptime: number // %
  response_time: number // ms
  cpu: number // %
  memory: number // %
  last_checked: string
}

// ─── YouTube ─────────────────────────────────
export type VideoStatus =
  | 'idea'
  | 'scripting'
  | 'recording'
  | 'editing'
  | 'scheduled'
  | 'published'

export interface YouTubeVideo {
  id: string
  title: string
  status: VideoStatus
  views?: number
  published_at?: string
}
