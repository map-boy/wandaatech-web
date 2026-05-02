'use client'

// app/competitions/LeaderboardTab.tsx

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
  Trophy, Users, Lock, AlertCircle, CheckCircle,
  Loader2, Upload, Activity, Zap, History,
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react'
import { Competition, LiveFeedItem, ScoreResult, SubmissionHistoryRow } from './types'

type InnerTab = 'submit' | 'leaderboard' | 'mine'

interface LeaderboardRow {
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
  group_id: string | null
}

export default function LeaderboardTab({ isRegistered }: { isRegistered: boolean }) {
  const [competitions,   setCompetitions]  = useState<Competition[]>([])
  const [selectedComp,  setSelectedComp]  = useState<Competition | null>(null)
  const [leaderboard,   setLeaderboard]   = useState<LeaderboardRow[]>([])
  const [mySubmissions, setMySubmissions] = useState<SubmissionHistoryRow[]>([])
  const [liveFeed,      setLiveFeed]      = useState<LiveFeedItem[]>([])

  // Store raw name separately so queries aren't broken by team suffix display
  const [displayName,   setDisplayName]   = useState('')
  const [rawName,       setRawName]       = useState('')

  const [modelName,    setModelName]    = useState('')
  const [file,         setFile]         = useState<File | null>(null)
  const [isDragging,   setIsDragging]   = useState(false)
  const [steps,        setSteps]        = useState<string[]>([])
  const [result,       setResult]       = useState<ScoreResult | null>(null)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [lbLoading,    setLbLoading]    = useState(false)
  const [histLoading,  setHistLoading]  = useState(false)
  const [todayCount,   setTodayCount]   = useState(0)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [innerTab,     setInnerTab]     = useState<InnerTab>('submit')

  const fileRef  = useRef<HTMLInputElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const name = localStorage.getItem('vaf_name') || ''
    const team = localStorage.getItem('vaf_team') || ''
    const type = localStorage.getItem('vaf_type') || ''
    setRawName(name)
    setDisplayName(type === 'team_member' && team ? `${name} (${team})` : name)

    fetchCompetitions()
    fetchLiveFeed()

    const feedChannel = supabase
      .channel('livefeed-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_feed' },
        (payload) => setLiveFeed((prev) => [payload.new as LiveFeedItem, ...prev].slice(0, 10))
      ).subscribe()

    return () => { supabase.removeChannel(feedChannel) }
  }, [])

  useEffect(() => {
    if (stepsRef.current) stepsRef.current.scrollTop = stepsRef.current.scrollHeight
  }, [steps])

  // Reload leaderboard + my submissions whenever competition changes
  useEffect(() => {
    if (selectedComp) {
      fetchLeaderboard(selectedComp.id)
      if (rawName) fetchMySubmissions(selectedComp.id, rawName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComp, rawName])

  // Re-fetch my submissions when switching to that tab
  useEffect(() => {
    if (innerTab === 'mine' && selectedComp && rawName) {
      fetchMySubmissions(selectedComp.id, rawName)
    }
  }, [innerTab]) // eslint-disable-line

  // ── Data fetchers ─────────────────────────────────────────────────────────
  async function fetchCompetitions() {
    const { data } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      setCompetitions(data)
      const firstOpen = data.find((c: Competition) => c.status === 'open')
      if (firstOpen) setSelectedComp(firstOpen)
    }
  }

  async function fetchLeaderboard(compId: string) {
    setLbLoading(true)
    setLeaderboard([])

    const { data, error: qErr } = await supabase
      .from('submissions')
      .select('id, username, model_name, accuracy_score, f1_score, code_score, final_score, created_at, competition_id, group_id')
      .eq('competition_id', compId)
      .order('final_score', { ascending: false })

    if (qErr) {
      console.error('Leaderboard fetch error:', qErr)
      setLbLoading(false)
      return
    }

    if (data && data.length > 0) {
      // Keep only each user's best submission (data already sorted desc)
      const seen = new Set<string>()
      const best = (data as any[]).filter((row) => {
        if (seen.has(row.username)) return false
        seen.add(row.username)
        return true
      })
      setLeaderboard(best.map((r) => ({
        id:            r.id,
        username:      r.username,
        team_name:     null,
        model_name:    r.model_name,
        accuracy:      Number(r.accuracy_score ?? 0),
        f1_score:      Number(r.f1_score ?? 0),
        code_score:    Number(r.code_score ?? 0),
        final_score:   Number(r.final_score ?? 0),
        submitted_at:  r.created_at,
        competition_id: r.competition_id,
        group_id:      r.group_id,
      })))
    }
    setLbLoading(false)
  }

  async function fetchMySubmissions(compId: string, name: string) {
    if (!name || !compId) return
    setHistLoading(true)

    // Try matching on raw name first; also try display name as fallback
    const { data } = await supabase
      .from('submissions')
      .select('id, username, model_name, accuracy_score, f1_score, code_score, final_score, created_at, competition_id, feedback')
      .eq('competition_id', compId)
      .or(`username.eq.${name},username.ilike.${name} (%)`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setMySubmissions(data as SubmissionHistoryRow[])

    // Count today's submissions for the limit badge
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('competition_id', compId)
      .or(`username.eq.${name},username.ilike.${name} (%)`)
      .gte('created_at', today.toISOString())
    setTodayCount(count ?? 0)

    setHistLoading(false)
  }

  async function fetchLiveFeed() {
    const { data } = await supabase
      .from('live_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setLiveFeed(data)
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped)
      setError('')
    } else {
      setError('Please drop a .csv file.')
    }
  }, [])

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!file || !displayName.trim() || !modelName.trim()) {
      setError('Please fill in all fields and upload a CSV file.')
      return
    }
    if (!selectedComp) {
      setError('Select a competition first.')
      return
    }
    const limit = selectedComp.max_submissions_per_day
    if (limit && todayCount >= limit) {
      setError(`Daily limit reached (${limit}/day). Come back tomorrow.`)
      return
    }

    setLoading(true); setSteps([]); setResult(null); setError('')

    const form = new FormData()
    form.append('file', file)
    form.append('username', displayName.trim())
    form.append('modelName', modelName.trim())
    form.append('competitionId', selectedComp.id)

    try {
      const response = await fetch('/api/score', { method: 'POST', body: form })
      if (!response.body) throw new Error('No response stream')

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const json = JSON.parse(line.replace('data:', '').trim())
              if (json.step)                        setSteps((prev) => [...prev, json.step])
              else if (json.accuracy !== undefined) setResult(json)
              else if (json.message)                setError(json.message)
            } catch (_) {}
          }
        }
      }

      // Refresh data after successful submission
      await fetchLeaderboard(selectedComp.id)
      await fetchMySubmissions(selectedComp.id, rawName)
      setTodayCount((p) => p + 1)
      setInnerTab('leaderboard')
    } catch (err: any) {
      setError(err.message || 'Failed to connect to scoring engine.')
    } finally {
      setLoading(false)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const dailyLimit      = selectedComp?.max_submissions_per_day ?? null
  const submissionsLeft = dailyLimit !== null ? Math.max(0, dailyLimit - todayCount) : null

  const INNER_TABS: { id: InnerTab; label: string; icon: any }[] = [
    { id: 'submit',      label: 'Submit',         icon: Upload  },
    { id: 'leaderboard', label: 'Leaderboard',    icon: Trophy  },
    ...(isRegistered ? [{ id: 'mine' as InnerTab, label: 'My Submissions', icon: History }] : []),
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">

        {/* ── Competition selector ── */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Competition</label>
          <div className="grid gap-2">
            {competitions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No competitions available.</p>
            ) : competitions.map((c) => (
              <button key={c.id} onClick={() => setSelectedComp(c)}
                className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  selectedComp?.id === c.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-border hover:border-emerald-500/30 bg-white/5 dark:bg-slate-900/40'}`}>
                <div>
                  <p className={`font-bold text-sm ${selectedComp?.id === c.id ? 'text-emerald-400' : 'text-foreground'}`}>{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Deadline: {new Date(c.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {c.max_submissions_per_day && ` · ${c.max_submissions_per_day}/day limit`}
                  </p>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${
                  c.status === 'open'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                  {c.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Inner tabs ── */}
        <div className="flex gap-1 p-1 rounded-2xl bg-white/5 dark:bg-slate-900/40 border border-border/60 w-fit">
          {INNER_TABS.map((t) => (
            <button key={t.id} onClick={() => setInnerTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                innerTab === t.id
                  ? t.id === 'leaderboard' ? 'bg-yellow-500 text-black'
                  : t.id === 'mine'        ? 'bg-sky-600 text-white'
                  : 'bg-emerald-600 text-white'
                  : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            SUBMIT TAB
        ══════════════════════════════════════ */}
        {innerTab === 'submit' && (
          <>
            {isRegistered ? (
              <motion.div className="rounded-3xl border border-emerald-500/20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <Upload className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight">Submit Your Model</h2>
                      {selectedComp && <p className="text-xs text-emerald-500 font-mono mt-0.5">{selectedComp.title}</p>}
                    </div>
                  </div>
                  {dailyLimit !== null && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                      submissionsLeft === 0
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                      <Zap className="w-3.5 h-3.5" />
                      {submissionsLeft === 0 ? 'Limit reached today' : `${submissionsLeft} left today`}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Your Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Your Name</label>
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                  </div>

                  {/* Model Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Model Name</label>
                    <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)}
                      placeholder="e.g. Random Forest v2"
                      className="w-full px-4 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                  </div>

                  {/* CSV Drop Zone — full drag & drop support */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Predictions CSV
                    </label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all select-none ${
                        isDragging
                          ? 'border-emerald-400 bg-emerald-500/15 scale-[1.01]'
                          : file
                          ? 'border-emerald-500/60 bg-emerald-500/5'
                          : 'border-border hover:border-emerald-500/40 hover:bg-emerald-500/5'
                      }`}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null
                          setFile(f)
                          if (f) setError('')
                        }}
                      />
                      {file ? (
                        <div className="space-y-2">
                          <CheckCircle className="w-9 h-9 text-emerald-500 mx-auto" />
                          <p className="font-bold text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); setFile(null) }}
                            className="text-xs text-red-400 hover:text-red-300 font-bold underline"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                            isDragging ? 'bg-emerald-500/30 scale-110' : 'bg-white/5'
                          }`}>
                            <Upload className={`w-7 h-7 transition-colors ${isDragging ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {isDragging ? 'Drop your CSV here!' : 'Drag & drop your CSV'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground/60 font-mono">.csv files only</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {!selectedComp && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <p className="text-sm text-amber-400">Select a competition above first.</p>
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <button onClick={handleSubmit}
                    disabled={loading || !selectedComp || submissionsLeft === 0}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tight">
                    {loading
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Scoring...</>
                      : <><Zap className="w-5 h-5" /> Submit &amp; Score</>}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-3xl border border-border/60 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-8 text-center space-y-4">
                <Lock className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <p className="font-bold text-foreground">Register to submit predictions</p>
                <p className="text-sm text-muted-foreground">You need to register before you can submit.</p>
              </div>
            )}

            {/* Progress stream */}
            <AnimatePresence>
              {(steps.length > 0 || loading) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-3xl border border-emerald-500/20 bg-black/40 backdrop-blur-xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500">Scoring Engine</h3>
                  </div>
                  <div ref={stepsRef} className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {steps.map((step, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <p className="text-sm font-mono text-emerald-400">{step}</p>
                      </motion.div>
                    ))}
                    {loading && (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin flex-shrink-0" />
                        <p className="text-sm font-mono text-muted-foreground animate-pulse">Processing...</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Score result card */}
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Your Score</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Final Score', value: result.finalScore, highlight: true },
                      { label: 'Accuracy',    value: result.accuracy },
                      { label: 'F1 Score',    value: result.f1 },
                      { label: 'Code',        value: result.codeScore },
                    ].map((metric) => (
                      <div key={metric.label} className={`rounded-2xl border p-4 text-center ${metric.highlight ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-black/20 border-emerald-500/20'}`}>
                        <p className={`text-3xl font-black ${metric.highlight ? 'text-emerald-300' : 'text-emerald-400'}`}>{metric.value}%</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                  {result.feedback && result.feedback.length > 0 && (
                    <div className="mt-4">
                      <button onClick={() => setFeedbackOpen(!feedbackOpen)}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        {feedbackOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {feedbackOpen ? 'Hide feedback' : `Show feedback (${result.feedback.length} notes)`}
                      </button>
                      <AnimatePresence>
                        {feedbackOpen && (
                          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="mt-3 space-y-1 overflow-hidden">
                            {result.feedback.map((f, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-emerald-500 shrink-0">›</span>{f}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  <button onClick={() => setInnerTab('leaderboard')}
                    className="mt-5 w-full py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase tracking-widest hover:bg-yellow-500/20 transition-all flex items-center justify-center gap-2">
                    <Trophy className="w-3.5 h-3.5" /> View Full Rankings
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ══════════════════════════════════════
            LEADERBOARD TAB
        ══════════════════════════════════════ */}
        {innerTab === 'leaderboard' && (
          <motion.div className="rounded-3xl border border-yellow-500/20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">Rankings</h2>
                  {selectedComp && <p className="text-xs text-muted-foreground font-mono">{selectedComp.title}</p>}
                </div>
              </div>
              <button
                onClick={() => selectedComp && fetchLeaderboard(selectedComp.id)}
                className="flex items-center gap-1.5 text-xs text-emerald-500 hover:text-emerald-400 font-bold transition-colors"
              >
                {lbLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <RefreshCw className="w-3.5 h-3.5" />}
                Refresh
              </button>
            </div>

            {lbLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-7 h-7 text-yellow-400 animate-spin" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                <p className="text-muted-foreground text-sm">
                  {selectedComp
                    ? `No submissions yet for "${selectedComp.title}". Be the first!`
                    : 'Select a competition above.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      {['Rank', 'Name', 'Model', 'Accuracy', 'F1', 'Code', 'Final Score'].map((h) => (
                        <th key={h} className="pb-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest pr-4 first:pr-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {leaderboard.map((row, i) => {
                      const isMe = row.username === displayName || row.username.startsWith(rawName)
                      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                      return (
                        <motion.tr key={row.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`transition-colors ${isMe ? 'bg-emerald-500/5' : 'hover:bg-white/5'}`}
                        >
                          {/* Rank */}
                          <td className="py-3 pr-2 w-12">
                            {medal ? (
                              <span className="text-xl">{medal}</span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-muted-foreground text-xs font-black">
                                {i + 1}
                              </span>
                            )}
                          </td>

                          {/* Name */}
                          <td className="py-3 pr-4 font-bold text-foreground max-w-[140px]">
                            <span className="truncate block">{row.username}</span>
                            {isMe && (
                              <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black">YOU</span>
                            )}
                          </td>

                          {/* Model */}
                          <td className="py-3 pr-4 text-muted-foreground text-xs font-mono max-w-[120px]">
                            <span className="truncate block">{row.model_name}</span>
                          </td>

                          {/* Scores */}
                          <td className="py-3 pr-4 text-foreground tabular-nums">{row.accuracy.toFixed(1)}%</td>
                          <td className="py-3 pr-4 text-foreground tabular-nums">{row.f1_score.toFixed(1)}%</td>
                          <td className="py-3 pr-4 text-foreground tabular-nums">{row.code_score.toFixed(1)}%</td>

                          {/* Final Score — highlighted */}
                          <td className="py-3 pr-4">
                            <span className={`font-black tabular-nums ${
                              i === 0 ? 'text-yellow-400 text-base'
                              : i === 1 ? 'text-slate-300 text-sm'
                              : i === 2 ? 'text-amber-600 text-sm'
                              : 'text-emerald-400'
                            }`}>
                              {row.final_score.toFixed(1)}%
                            </span>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {selectedComp?.benchmark_score != null && (
              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Benchmark baseline</span>
                <span className="text-xs font-black text-muted-foreground">{selectedComp.benchmark_score}%</span>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════
            MY SUBMISSIONS TAB
        ══════════════════════════════════════ */}
        {innerTab === 'mine' && (
          <motion.div className="rounded-3xl border border-sky-500/20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-sky-400" />
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">My Submissions</h2>
                  {selectedComp && <p className="text-xs text-muted-foreground font-mono">{selectedComp.title}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {dailyLimit !== null && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    {todayCount} / {dailyLimit} today
                  </div>
                )}
                <button
                  onClick={() => selectedComp && rawName && fetchMySubmissions(selectedComp.id, rawName)}
                  className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-bold transition-colors"
                >
                  {histLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Refresh
                </button>
              </div>
            </div>

            {histLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-sky-400 animate-spin" /></div>
            ) : mySubmissions.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <History className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                <p className="text-muted-foreground text-sm">No submissions found for <strong>{displayName || 'you'}</strong>.</p>
                <p className="text-xs text-muted-foreground/60">Make sure the name above matches what you registered with.</p>
                <button onClick={() => setInnerTab('submit')}
                  className="text-xs text-emerald-500 hover:underline font-bold">Submit your first model →</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      {['#', 'Model', 'Accuracy', 'F1', 'Code', 'Final', 'Date'].map((h) => (
                        <th key={h} className="pb-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {mySubmissions.map((sub, i) => (
                      <tr key={sub.id} className="hover:bg-sky-500/5 transition-colors">
                        <td className="py-3 pr-4 text-muted-foreground text-xs font-bold">{i + 1}</td>
                        <td className="py-3 pr-4 font-bold text-foreground text-xs font-mono max-w-[120px]">
                          <span className="truncate block">{sub.model_name}</span>
                        </td>
                        <td className="py-3 pr-4 text-foreground tabular-nums">{Number(sub.accuracy_score).toFixed(1)}%</td>
                        <td className="py-3 pr-4 text-foreground tabular-nums">{Number(sub.f1_score).toFixed(1)}%</td>
                        <td className="py-3 pr-4 text-foreground tabular-nums">{Number(sub.code_score).toFixed(1)}%</td>
                        <td className="py-3 pr-4">
                          <span className="font-black text-emerald-400 tabular-nums">{Number(sub.final_score).toFixed(1)}%</span>
                          {i === 0 && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black">BEST</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {' '}
                          <span className="text-[10px] opacity-60">
                            {new Date(sub.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

      </div>

      {/* ── Live Feed sidebar ── */}
      <div>
        <motion.div className="rounded-3xl border border-sky-500/20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl sticky top-28"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Users className="w-5 h-5 text-sky-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">Live Feed</h2>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            <AnimatePresence>
              {liveFeed.length === 0 ? (
                <p className="text-center text-muted-foreground text-xs py-8">Waiting for submissions...</p>
              ) : liveFeed.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-3 rounded-2xl bg-black/20 border border-sky-500/10 hover:border-sky-500/30 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs flex-shrink-0">
                      {item.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug">{item.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(item.created_at).toLocaleTimeString()}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-400 flex-shrink-0">{item.score}%</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}