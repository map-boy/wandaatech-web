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

  const fileRef      = useRef<HTMLInputElement>(null)
  const stepsRef     = useRef<HTMLDivElement>(null)
  const activeCompId = useRef<string>('')  // fix: track which comp is being fetched

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

  useEffect(() => {
    if (selectedComp) {
      fetchLeaderboard(selectedComp.id)
      if (rawName) fetchMySubmissions(selectedComp.id, rawName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComp, rawName])

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

  // fix: discard stale responses when user switches competition quickly
  async function fetchLeaderboard(compId: string) {
    activeCompId.current = compId
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

    // If user switched competition before this response arrived, discard it
    if (activeCompId.current !== compId) return

    if (data && data.length > 0) {
      const seen = new Set<string>()
      const best = (data as any[]).filter((row) => {
        if (seen.has(row.username)) return false
        seen.add(row.username)
        return true
      })
      setLeaderboard(best.map((r) => ({
        id:             r.id,
        username:       r.username,
        team_name:      null,
        model_name:     r.model_name,
        accuracy:       Number(r.accuracy_score ?? 0),
        f1_score:       Number(r.f1_score ?? 0),
        code_score:     Number(r.code_score ?? 0),
        final_score:    Number(r.final_score ?? 0),
        submitted_at:   r.created_at,
        competition_id: r.competition_id,
        group_id:       r.group_id,
      })))
    }
    setLbLoading(false)
  }

  async function fetchMySubmissions(compId: string, name: string) {
    if (!name || !compId) return
    setHistLoading(true)

    const { data } = await supabase
      .from('submissions')
      .select('id, username, model_name, accuracy_score, f1_score, code_score, final_score, created_at, competition_id, feedback')
      .eq('competition_id', compId)
      .or(`username.eq.${name},username.ilike.${name} (%)`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setMySubmissions(data as SubmissionHistoryRow[])

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

      await fetchLeaderboard(selectedComp.id)
      await fetchMySubmissions(selectedComp.id, rawName)
      setTodayCount((p) => p + 1)

      // fix: clear the form after successful submission
      setFile(null)
      setModelName('')
      setSteps([])
      if (fileRef.current) fileRef.current.value = ''

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
          <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Competition</label>
          <div className="grid gap-2">
            {competitions.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No competitions available.</p>
            ) : competitions.map((c) => (
              <button key={c.id} onClick={() => setSelectedComp(c)}
                className={`flex items-center justify-between p-4 rounded-2xl text-left transition-all cursor-pointer ${
                  selectedComp?.id === c.id
                    ? 'skeuo-inset border border-[hsl(var(--skeuo-accent))]/40'
                    : 'skeuo-card border border-[hsl(var(--border))]'}`}>
                <div>
                  <p className={`font-bold text-sm ${selectedComp?.id === c.id ? 'text-[hsl(var(--skeuo-accent))]' : 'text-foreground'}`}>{c.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                    Deadline: {new Date(c.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {c.max_submissions_per_day && ` · ${c.max_submissions_per_day}/day limit`}
                  </p>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider skeuo-inset text-[hsl(var(--muted-foreground))]">
                  {c.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Inner tabs ── */}
        <div className="skeuo-inset flex gap-1 p-1 rounded-2xl w-fit">
          {INNER_TABS.map((t) => (
            <button key={t.id} onClick={() => setInnerTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                innerTab === t.id
                  ? 'skeuo-button bg-[hsl(var(--skeuo-accent))] text-black'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--skeuo-accent))]'}`}>
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
              <motion.div className="skeuo-card border border-[hsl(var(--border))] rounded-3xl p-8"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="skeuo-inset p-2 rounded-xl">
                      <Upload className="w-5 h-5 text-[hsl(var(--skeuo-accent))]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Submit Your Model</h2>
                      {selectedComp && <p className="text-xs text-[hsl(var(--skeuo-accent))] font-mono mt-0.5">{selectedComp.title}</p>}
                    </div>
                  </div>
                  {dailyLimit !== null && (
                    <div className={`skeuo-inset flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${
                      submissionsLeft === 0 ? 'text-red-400' : 'text-[hsl(var(--skeuo-accent))]'}`}>
                      <Zap className="w-3.5 h-3.5" />
                      {submissionsLeft === 0 ? 'Limit reached today' : `${submissionsLeft} left today`}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Your Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Your Name</label>
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      className="skeuo-inset w-full px-4 py-3 bg-transparent border border-[hsl(var(--border))] rounded-xl text-foreground focus:outline-none transition-all" />
                  </div>

                  {/* Model Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Model Name</label>
                    <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)}
                      placeholder="e.g. Random Forest v2"
                      className="skeuo-inset w-full px-4 py-3 bg-transparent border border-[hsl(var(--border))] rounded-xl text-foreground placeholder-[hsl(var(--muted-foreground))] focus:outline-none transition-all" />
                  </div>

                  {/* CSV Drop Zone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">
                      Predictions CSV
                    </label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`skeuo-inset relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all select-none ${
                        isDragging
                          ? 'border-[hsl(var(--skeuo-accent))] scale-[1.01]'
                          : file
                          ? 'border-[hsl(var(--skeuo-accent))]/60'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--skeuo-accent))]/40'
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
                          <CheckCircle className="w-9 h-9 text-[hsl(var(--skeuo-accent))] mx-auto" />
                          <p className="font-bold text-foreground">{file.name}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{(file.size / 1024).toFixed(1)} KB</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                            className="text-xs text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className={`skeuo-button mx-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                            isDragging ? 'scale-110' : ''
                          }`}>
                            <Upload className={`w-7 h-7 transition-colors ${isDragging ? 'text-[hsl(var(--skeuo-accent))]' : 'text-[hsl(var(--muted-foreground))]'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {isDragging ? 'Drop your CSV here!' : 'Drag & drop your CSV'}
                            </p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">or click to browse files</p>
                          </div>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono">.csv files only</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {!selectedComp && (
                    <div className="skeuo-inset flex items-center gap-2 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-[hsl(var(--skeuo-accent))] flex-shrink-0" />
                      <p className="text-sm text-[hsl(var(--skeuo-accent))]">Select a competition above first.</p>
                    </div>
                  )}
                  {error && (
                    <div className="skeuo-inset flex items-center gap-2 p-3 rounded-xl border border-red-900/40">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <button onClick={handleSubmit}
                    disabled={loading || !selectedComp || submissionsLeft === 0}
                    className="skeuo-button w-full py-4 bg-[hsl(var(--skeuo-accent))] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tight cursor-pointer">
                    {loading
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Scoring...</>
                      : <><Zap className="w-5 h-5" /> Submit &amp; Score</>}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="skeuo-card border border-[hsl(var(--border))] rounded-3xl p-8 text-center space-y-4">
                <Lock className="w-10 h-10 text-[hsl(var(--border))] mx-auto" />
                <p className="font-bold text-foreground">Register to submit predictions</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">You need to register before you can submit.</p>
              </div>
            )}

            {/* Progress stream */}
            <AnimatePresence>
              {(steps.length > 0 || loading) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="skeuo-inset rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-[hsl(var(--skeuo-accent))] animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-[hsl(var(--skeuo-accent))]">Scoring Engine</h3>
                  </div>
                  <div ref={stepsRef} className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {steps.map((step, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-[hsl(var(--skeuo-accent))] flex-shrink-0" />
                        <p className="text-sm font-mono text-[hsl(var(--skeuo-accent))]">{step}</p>
                      </motion.div>
                    ))}
                    {loading && (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 text-[hsl(var(--skeuo-accent))] animate-spin flex-shrink-0" />
                        <p className="text-sm font-mono text-[hsl(var(--muted-foreground))] animate-pulse">Processing...</p>
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
                  className="skeuo-card  border border-[hsl(var(--skeuo-accent))]/30 rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-6 h-6 text-[hsl(var(--skeuo-accent))]" />
                    <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Your Score</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Final Score', value: result.finalScore, highlight: true },
                      { label: 'Accuracy',    value: result.accuracy },
                      { label: 'F1 Score',    value: result.f1 },
                      { label: 'Code',        value: result.codeScore },
                    ].map((metric) => (
                      <div key={metric.label} className={`rounded-2xl p-4 text-center ${metric.highlight ? 'skeuo-button bg-[hsl(var(--skeuo-accent))]/10' : 'skeuo-inset'}`}>
                        <p className="text-3xl font-black text-[hsl(var(--skeuo-accent))]">{metric.value}%</p>
                        <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mt-1">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                  {result.feedback && result.feedback.length > 0 && (
                    <div className="mt-4">
                      <button onClick={() => setFeedbackOpen(!feedbackOpen)}
                        className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors cursor-pointer">
                        {feedbackOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {feedbackOpen ? 'Hide feedback' : `Show feedback (${result.feedback.length} notes)`}
                      </button>
                      <AnimatePresence>
                        {feedbackOpen && (
                          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="mt-3 space-y-1 overflow-hidden">
                            {result.feedback.map((f, i) => (
                              <li key={i} className="text-xs text-[hsl(var(--muted-foreground))] flex items-start gap-2">
                                <span className="text-[hsl(var(--skeuo-accent))] shrink-0">›</span>{f}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  <button onClick={() => setInnerTab('leaderboard')}
                    className="skeuo-button mt-5 w-full py-2.5 rounded-xl text-[hsl(var(--skeuo-accent))] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer">
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
          <motion.div className="skeuo-card border border-[hsl(var(--border))] rounded-3xl p-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-[hsl(var(--skeuo-accent))]" />
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-foreground">Rankings</h2>
                  {selectedComp && <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{selectedComp.title}</p>}
                </div>
              </div>
              <button
                onClick={() => selectedComp && fetchLeaderboard(selectedComp.id)}
                className="flex items-center gap-1.5 text-xs text-[hsl(var(--skeuo-accent))] hover:opacity-80 font-bold transition-colors cursor-pointer"
              >
                {lbLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <RefreshCw className="w-3.5 h-3.5" />}
                Refresh
              </button>
            </div>

            {lbLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-7 h-7 text-[hsl(var(--skeuo-accent))] animate-spin" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Trophy className="w-12 h-12 text-[hsl(var(--border))] mx-auto" />
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  {selectedComp
                    ? `No submissions yet for "${selectedComp.title}". Be the first!`
                    : 'Select a competition above.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      {['Rank', 'Name', 'Model', 'Accuracy', 'F1', 'Code', 'Final Score'].map((h) => (
                        <th key={h} className="pb-3 text-left text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest pr-4 first:pr-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {leaderboard.map((row, i) => {
                      const isMe = row.username === displayName || row.username.startsWith(rawName)
                      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                      return (
                        <motion.tr key={row.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`transition-colors ${isMe ? 'bg-[hsl(var(--skeuo-accent))]/5' : 'hover:bg-[hsl(var(--muted))]/30'}`}
                        >
                          <td className="py-3 pr-2 w-12">
                            {medal ? (
                              <span className="text-xl">{medal}</span>
                            ) : (
                              <span className="skeuo-inset inline-flex items-center justify-center w-7 h-7 rounded-full text-[hsl(var(--muted-foreground))] text-xs font-black">
                                {i + 1}
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4 font-bold text-foreground max-w-[140px]">
                            <span className="truncate block">{row.username}</span>
                            {isMe && (
                              <span className="skeuo-inset inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded-full text-[hsl(var(--skeuo-accent))] font-black">YOU</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-[hsl(var(--muted-foreground))] text-xs font-mono max-w-[120px]">
                            <span className="truncate block">{row.model_name}</span>
                          </td>
                          <td className="py-3 pr-4 text-foreground tabular-nums">{row.accuracy.toFixed(1)}%</td>
                          <td className="py-3 pr-4 text-foreground tabular-nums">{row.f1_score.toFixed(1)}%</td>
                          <td className="py-3 pr-4 text-foreground tabular-nums">{row.code_score.toFixed(1)}%</td>
                          <td className="py-3 pr-4">
                            <span className={`font-black tabular-nums ${
                              i === 0 ? 'text-[hsl(var(--skeuo-accent))] text-base'
                              : i === 1 ? 'text-foreground text-sm'
                              : i === 2 ? 'text-[hsl(var(--muted-foreground))] text-sm'
                              : 'text-[hsl(var(--skeuo-accent))]'
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
              <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
                <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono uppercase tracking-widest">Benchmark baseline</span>
                <span className="text-xs font-black text-[hsl(var(--muted-foreground))]">{selectedComp.benchmark_score}%</span>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════
            MY SUBMISSIONS TAB
        ══════════════════════════════════════ */}
        {innerTab === 'mine' && (
          <motion.div className="skeuo-card border border-[hsl(var(--border))] rounded-3xl p-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-[hsl(var(--skeuo-accent))]" />
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-foreground">My Submissions</h2>
                  {selectedComp && <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{selectedComp.title}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {dailyLimit !== null && (
                  <div className="skeuo-inset flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-[hsl(var(--skeuo-accent))]">
                    <Zap className="w-3.5 h-3.5" />
                    {todayCount} / {dailyLimit} today
                  </div>
                )}
                <button
                  onClick={() => selectedComp && rawName && fetchMySubmissions(selectedComp.id, rawName)}
                  className="flex items-center gap-1.5 text-xs text-[hsl(var(--skeuo-accent))] hover:opacity-80 font-bold transition-colors cursor-pointer"
                >
                  {histLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Refresh
                </button>
              </div>
            </div>

            {histLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-[hsl(var(--skeuo-accent))] animate-spin" /></div>
            ) : mySubmissions.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <History className="w-10 h-10 text-[hsl(var(--border))] mx-auto" />
                <p className="text-[hsl(var(--muted-foreground))] text-sm">No submissions found for <strong>{displayName || 'you'}</strong>.</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Make sure the name above matches what you registered with.</p>
                <button onClick={() => setInnerTab('submit')}
                  className="text-xs text-[hsl(var(--skeuo-accent))] hover:underline font-bold cursor-pointer">Submit your first model →</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))]">
                      {['#', 'Model', 'Accuracy', 'F1', 'Code', 'Final', 'Date'].map((h) => (
                        <th key={h} className="pb-3 text-left text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {mySubmissions.map((sub, i) => (
                      <tr key={sub.id} className="hover:bg-[hsl(var(--muted))]/30 transition-colors">
                        <td className="py-3 pr-4 text-[hsl(var(--muted-foreground))] text-xs font-bold">{i + 1}</td>
                        <td className="py-3 pr-4 font-bold text-foreground text-xs font-mono max-w-[120px]">
                          <span className="truncate block">{sub.model_name}</span>
                        </td>
                        <td className="py-3 pr-4 text-foreground tabular-nums">{Number(sub.accuracy_score).toFixed(1)}%</td>
                        <td className="py-3 pr-4 text-foreground tabular-nums">{Number(sub.f1_score).toFixed(1)}%</td>
                        <td className="py-3 pr-4 text-foreground tabular-nums">{Number(sub.code_score).toFixed(1)}%</td>
                        <td className="py-3 pr-4">
                          <span className="font-black text-[hsl(var(--skeuo-accent))] tabular-nums">{Number(sub.final_score).toFixed(1)}%</span>
                          {i === 0 && (
                            <span className="skeuo-inset ml-2 text-[10px] px-1.5 py-0.5 rounded-full text-[hsl(var(--skeuo-accent))] font-black">BEST</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-[hsl(var(--muted-foreground))] text-xs">
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
        <motion.div className="skeuo-card border border-[hsl(var(--border))] rounded-3xl p-6 sticky top-28"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Users className="w-5 h-5 text-[hsl(var(--skeuo-accent))]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[hsl(var(--skeuo-accent))] rounded-full animate-ping" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">Live Feed</h2>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            <AnimatePresence>
              {liveFeed.length === 0 ? (
                <p className="text-center text-[hsl(var(--muted-foreground))] text-xs py-8">Waiting for submissions...</p>
              ) : liveFeed.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="skeuo-inset p-3 rounded-2xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="skeuo-button w-8 h-8 rounded-full flex items-center justify-center text-[hsl(var(--skeuo-accent))] font-black text-xs flex-shrink-0">
                      {item.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-snug">{item.message}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">{new Date(item.created_at).toLocaleTimeString()}</p>
                    </div>
                    <span className="text-xs font-black text-[hsl(var(--skeuo-accent))] flex-shrink-0">{item.score}%</span>
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