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

export type Tab = 'challenges' | 'register' | 'leaderboard' | 'login'

export const TAG_COLORS: Record<string, string> = {
  'Beginner Friendly': 'skeuo-inset text-[hsl(var(--skeuo-accent))]',
  'Intermediate':      'skeuo-inset text-[hsl(var(--skeuo-accent))]',
  'Advanced':          'skeuo-inset text-[hsl(var(--skeuo-accent))]',
  'NLP':               'skeuo-inset text-[hsl(var(--skeuo-accent))]',
  'Computer Vision':   'skeuo-inset text-[hsl(var(--skeuo-accent))]',
  'Time Series':       'skeuo-inset text-[hsl(var(--skeuo-accent))]',
  'Regression':        'skeuo-inset text-[hsl(var(--skeuo-accent))]',
  'Agriculture':       'skeuo-inset text-[hsl(var(--skeuo-accent))]',
  'Kinyarwanda':       'skeuo-inset text-[hsl(var(--skeuo-accent))]',
  'Agentic AI':        'skeuo-inset text-[hsl(var(--skeuo-accent))]',
  'Fine-tuning':       'skeuo-inset text-[hsl(var(--skeuo-accent))]',
}

export const DEFAULT_TAG = 'skeuo-inset text-neutral-400'

export const MEDAL: Record<number, string> = {
  0: 'text-[hsl(var(--skeuo-accent))]',
  1: 'text-neutral-300',
  2: 'text-neutral-500',
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2)
}