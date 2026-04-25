// app/competitions/types.ts

export interface Competition {
  id: string
  title: string
  summary: string
  description: string
  dataset_url: string
  rules: string
  prize: string
  tags: string[]
  deadline: string
  status: 'open' | 'closed' | 'upcoming'
  participants: number
  created_at: string
}

export interface LeaderboardRow {
  id: string
  username: string
  model_name: string
  accuracy: number
  f1_score: number
  precision: number
  recall: number
  submitted_at: string
  competition_id: string | null
}

export interface LiveFeedItem {
  id: string
  username: string
  score: number
  message: string
  created_at: string
}

export interface ScoreResult {
  accuracy: number
  f1: number
  precision: number
  recall: number
  username: string
  modelName: string
}

export type Tab = 'challenges' | 'register' | 'leaderboard'

export const TAG_COLORS: Record<string, string> = {
  'Beginner Friendly': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Intermediate':      'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Advanced':          'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'NLP':               'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Computer Vision':   'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Time Series':       'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Regression':        'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Agriculture':       'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'Kinyarwanda':       'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export const DEFAULT_TAG = 'bg-slate-500/10 text-slate-400 border-slate-500/20'

export const MEDAL: Record<number, string> = {
  0: 'text-yellow-400',
  1: 'text-slate-300',
  2: 'text-amber-600',
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2)
}