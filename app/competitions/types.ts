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
  // NEW ↓
  phase: 'phase_1' | 'phase_2' | 'revealed' | null
  phase_label: string | null          // e.g. "Phase 1 — Public Leaderboard (30%)"
  benchmark_score: number | null      // shown at bottom of leaderboard
  max_submissions_per_day: number | null  // null = unlimited
}

export interface LeaderboardRow {
  id: string
  username: string
  team_name: string | null
  model_name: string
  accuracy: number
  f1_score: number
  code_score: number
  final_score: number
  submitted_at: string
  competition_id: string | null
  rank: number
  group_id: string | null
}

export interface SubmissionHistoryRow {
  id: string
  username: string
  model_name: string
  accuracy_score: number
  f1_score: number
  code_score: number
  final_score: number
  created_at: string
  competition_id: string | null
  feedback: string[]
}

export interface LiveFeedItem {
  id: string
  username: string
  score: number
  message: string
  created_at: string
}

export interface ScoreResult {
  finalScore: number
  accuracy: number
  f1: number
  codeScore: number
  username: string
  modelName: string
  feedback: string[]
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
  'Agentic AI':        'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Fine-tuning':       'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
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