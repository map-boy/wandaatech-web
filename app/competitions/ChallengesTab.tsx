'use client'

// app/competitions/ChallengesTab.tsx

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
  Trophy, Clock, Users, Lock, Download,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  Search, Filter, ArrowRight, BookOpen, Star, X
} from 'lucide-react'
import { Competition, TAG_COLORS, DEFAULT_TAG } from './types'

function StatusBadge({ status, deadline }: { status: string; deadline: string }) {
  const daysLeft = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  if (status === 'upcoming') return (
    <span className="text-[10px] font-black px-2 py-1 rounded-full skeuo-inset text-foreground uppercase tracking-wider">Starting Soon</span>
  )
  if (status === 'closed') return (
    <span className="text-[10px] font-black px-2 py-1 rounded-full skeuo-inset text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Completed</span>
  )
  if (daysLeft <= 7) return (
    <span className="text-[10px] font-black px-2 py-1 rounded-full skeuo-inset text-red-400 uppercase tracking-wider animate-pulse">Closing Soon — {daysLeft}d left</span>
  )
  return (
    <span className="text-[10px] font-black px-2 py-1 rounded-full skeuo-inset text-[hsl(var(--skeuo-accent))] uppercase tracking-wider">Open — {daysLeft}d left</span>
  )
}

function CompetitionCard({ comp, isRegistered, registeredName, onGoRegister }: {
  comp: Competition; isRegistered: boolean; registeredName: string; onGoRegister: (compId?: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="skeuo-card border border-[hsl(var(--border))] rounded-3xl overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={comp.status} deadline={comp.deadline} />
              <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                <Users className="w-3 h-3" />{comp.participants} participants
              </span>
            </div>
            <h3 className="text-xl font-black text-foreground leading-snug">{comp.title}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{comp.summary}</p>
            <div className="flex flex-wrap gap-2">
              {comp.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full skeuo-inset text-[hsl(var(--skeuo-accent))]">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
            <div className="text-center sm:text-right">
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Prize</p>
              <p className="text-lg font-black text-[hsl(var(--skeuo-accent))]">{comp.prize}</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Deadline</p>
              <p className="text-sm font-bold text-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(comp.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          {comp.status === 'open' ? (
            isRegistered ? (
              <button onClick={() => setExpanded(!expanded)}
                className="skeuo-button flex items-center gap-2 px-6 py-3 bg-[hsl(var(--skeuo-accent))] text-black font-black rounded-xl transition-all active:scale-95 text-sm uppercase tracking-tight cursor-pointer">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expanded ? 'Hide Details' : 'View Challenge'}
              </button>
            ) : (
              <button onClick={() => onGoRegister(comp.id)}
                className="skeuo-button flex items-center gap-2 px-6 py-3 bg-[hsl(var(--skeuo-accent))] text-black font-black rounded-xl transition-all active:scale-95 text-sm uppercase tracking-tight cursor-pointer">
                Join Challenge <ArrowRight className="w-4 h-4" />
              </button>
            )
          ) : (
            <button disabled className="skeuo-inset flex items-center gap-2 px-6 py-3 text-[hsl(var(--muted-foreground))] font-bold rounded-xl text-sm cursor-not-allowed opacity-60">
              <BookOpen className="w-4 h-4" /> Practise
            </button>
          )}
          {!isRegistered && (
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
              <Lock className="w-3.5 h-3.5" /> Register to access dataset and full details
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {expanded && isRegistered && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="border-t border-[hsl(var(--border))] bg-[hsl(var(--skeuo-surface))]">
            <div className="p-6 sm:p-8 space-y-8">
              <div className="skeuo-inset flex items-center gap-2 p-3 rounded-xl">
                <CheckCircle className="w-4 h-4 text-[hsl(var(--skeuo-accent))] flex-shrink-0" />
                <p className="text-sm text-foreground">Welcome, <span className="font-bold text-[hsl(var(--skeuo-accent))]">{registeredName}</span>. You have full access.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[hsl(var(--skeuo-accent))]" />
                  <h4 className="font-black text-foreground uppercase tracking-tight text-sm">Problem Statement</h4>
                </div>
                <div className="skeuo-inset p-4 rounded-2xl">
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed whitespace-pre-line">{comp.description}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[hsl(var(--skeuo-accent))]" />
                  <h4 className="font-black text-foreground uppercase tracking-tight text-sm">Rules & Regulations</h4>
                </div>
                <div className="skeuo-inset p-4 rounded-2xl">
                  <ul className="space-y-2">
                    {comp.rules.split('\n').filter(r => r.trim()).map((rule, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                        <span className="text-[hsl(var(--skeuo-accent))] font-bold shrink-0">{i + 1}.</span>
                        {rule.replace(/^\d+\.\s*/, '')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[hsl(var(--skeuo-accent))]" />
                  <h4 className="font-black text-foreground uppercase tracking-tight text-sm">Dataset</h4>
                </div>
                <a href={comp.dataset_url} target="_blank" rel="noopener noreferrer"
                  className="skeuo-inset flex items-center justify-between p-4 rounded-2xl group hover:opacity-90 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="skeuo-button p-2 rounded-xl"><Download className="w-4 h-4 text-[hsl(var(--skeuo-accent))]" /></div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Download Dataset</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono truncate max-w-xs">{comp.dataset_url}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[hsl(var(--skeuo-accent))] group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ChallengesTab({
  isRegistered, registeredName, onGoRegister,
}: {
  isRegistered: boolean; registeredName: string; onGoRegister: (compId?: string) => void
}) {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState<'all' | 'open' | 'closed' | 'upcoming'>('all')
  const [search, setSearch]             = useState('')
  const [sortBy, setSortBy]             = useState<'deadline' | 'prize'>('deadline')

  useEffect(() => { fetchCompetitions() }, [])

  async function fetchCompetitions() {
    setLoading(true)
    const { data } = await supabase.from('competitions').select('*').order('created_at', { ascending: false })
    if (data) setCompetitions(data)
    setLoading(false)
  }

  const filtered = competitions
    .filter((c) => filter === 'all' || c.status === filter)
    .filter((c) => search === '' || c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => sortBy === 'deadline'
      ? new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      : a.prize.localeCompare(b.prize))

  const openCount   = competitions.filter((c) => c.status === 'open').length
  const closedCount = competitions.filter((c) => c.status === 'closed').length

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--skeuo-accent))] animate-pulse" />
          <span className="text-sm font-bold text-foreground">Open Challenges: <span className="text-[hsl(var(--skeuo-accent))]">{openCount}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))]" />
          <span className="text-sm font-bold text-foreground">Past Challenges: <span className="text-[hsl(var(--muted-foreground))]">{closedCount}</span></span>
        </div>
      </div>

      {!isRegistered ? (
        <div className="skeuo-inset flex items-center gap-3 p-4 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-[hsl(var(--skeuo-accent))] flex-shrink-0" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            New here?{' '}
            <button onClick={() => onGoRegister()} className="text-[hsl(var(--skeuo-accent))] font-bold hover:underline cursor-pointer">
              Register to unlock datasets and full challenge details
            </button>
          </p>
        </div>
      ) : (
        <div className="skeuo-inset flex items-center gap-3 p-4 rounded-2xl">
          <CheckCircle className="w-4 h-4 text-[hsl(var(--skeuo-accent))] flex-shrink-0" />
          <p className="text-sm text-foreground font-semibold">
            Welcome back, {registeredName}! You have full access to all challenges.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search challenges or tags..."
            className="skeuo-inset w-full pl-11 pr-4 py-3 bg-transparent border border-[hsl(var(--border))] rounded-xl text-foreground placeholder-[hsl(var(--muted-foreground))] focus:outline-none transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'open', 'upcoming', 'closed'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filter === f ? 'skeuo-button bg-[hsl(var(--skeuo-accent))] text-black'
                : 'skeuo-inset text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--skeuo-accent))]'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'deadline' | 'prize')}
            className="skeuo-inset px-3 py-3 rounded-xl bg-transparent border border-[hsl(var(--border))] text-foreground text-xs font-bold focus:outline-none cursor-pointer">
            <option value="deadline">Closing Soon</option>
            <option value="prize">Top Prize First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="space-y-3 text-center">
            <div className="w-8 h-8 border-2 border-[hsl(var(--skeuo-accent))] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[hsl(var(--muted-foreground))] text-sm font-mono">Loading challenges...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Trophy className="w-12 h-12 text-[hsl(var(--border))] mx-auto" />
          <p className="text-[hsl(var(--muted-foreground))]">No challenges found.</p>
          <button onClick={() => { setFilter('all'); setSearch('') }} className="text-[hsl(var(--skeuo-accent))] text-sm hover:underline cursor-pointer">Clear filters</button>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((comp) => (
            <CompetitionCard key={comp.id} comp={comp} isRegistered={isRegistered}
              registeredName={registeredName} onGoRegister={onGoRegister} />
          ))}
        </div>
      )}
    </div>
  )
}