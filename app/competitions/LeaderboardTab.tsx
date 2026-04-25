'use client'

// app/competitions/LeaderboardTab.tsx

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
  Trophy, Users, Lock, AlertCircle, CheckCircle,
  Loader2, Upload, Activity, Zap
} from 'lucide-react'
import { Competition, LeaderboardRow, LiveFeedItem, ScoreResult, MEDAL } from './types'

export default function LeaderboardTab({ isRegistered }: { isRegistered: boolean }) {
  const [competitions,  setCompetitions]  = useState<Competition[]>([])
  const [selectedComp,  setSelectedComp]  = useState<Competition | null>(null)
  const [leaderboard,   setLeaderboard]   = useState<LeaderboardRow[]>([])
  const [liveFeed,      setLiveFeed]      = useState<LiveFeedItem[]>([])
  const [username,      setUsername]      = useState('')
  const [modelName,     setModelName]     = useState('')
  const [file,          setFile]          = useState<File | null>(null)
  const [steps,         setSteps]         = useState<string[]>([])
  const [result,        setResult]        = useState<ScoreResult | null>(null)
  const [error,         setError]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const [lbLoading,     setLbLoading]     = useState(false)

  const fileRef  = useRef<HTMLInputElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const name = localStorage.getItem('vaf_name') || ''
    const team = localStorage.getItem('vaf_team') || ''
    const type = localStorage.getItem('vaf_type') || ''
    setUsername(type === 'team_member' && team ? `${name} (${team})` : name)

    fetchCompetitions()
    fetchLiveFeed()

    const feedChannel = supabase.channel('livefeed-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_feed' },
        (payload) => setLiveFeed((prev) => [payload.new as LiveFeedItem, ...prev].slice(0, 10))
      ).subscribe()

    return () => { supabase.removeChannel(feedChannel) }
  }, [])

  useEffect(() => {
    if (stepsRef.current) stepsRef.current.scrollTop = stepsRef.current.scrollHeight
  }, [steps])

  useEffect(() => {
    if (selectedComp) fetchLeaderboard(selectedComp.id)
    else fetchLeaderboard(null)
  }, [selectedComp])

  async function fetchCompetitions() {
    const { data } = await supabase
      .from('competitions')
      .select('id, title, status, deadline, prize, tags, summary, description, dataset_url, rules, participants, created_at')
      .order('created_at', { ascending: false })
    if (data) {
      setCompetitions(data)
      const firstOpen = data.find((c: Competition) => c.status === 'open')
      if (firstOpen) setSelectedComp(firstOpen)
    }
  }

  async function fetchLeaderboard(compId: string | null) {
    setLbLoading(true)
    let query = supabase.from('leaderboard').select('*').order('accuracy', { ascending: false }).limit(20)
    if (compId) query = query.eq('competition_id', compId)
    else        query = query.is('competition_id', null)
    const { data } = await query
    if (data) setLeaderboard(data)
    setLbLoading(false)
  }

  async function fetchLiveFeed() {
    const { data } = await supabase.from('live_feed').select('*').order('created_at', { ascending: false }).limit(10)
    if (data) setLiveFeed(data)
  }

  async function handleSubmit() {
    if (!file || !username.trim() || !modelName.trim()) {
      setError('Please fill in all fields and upload a CSV file.')
      return
    }
    setLoading(true)
    setSteps([])
    setResult(null)
    setError('')

    const form = new FormData()
    form.append('file', file)
    form.append('username', username.trim())
    form.append('modelName', modelName.trim())
    if (selectedComp) form.append('competitionId', selectedComp.id)

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
              if (json.step) setSteps((prev) => [...prev, json.step])
              else if (json.accuracy !== undefined) setResult(json)
              else if (json.message) setError(json.message)
            } catch (_) {}
          }
        }
      }

      if (selectedComp) fetchLeaderboard(selectedComp.id)
    } catch (err: any) {
      setError(err.message || 'Failed to connect to scoring engine.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">

        {/* Competition selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Select Competition</label>
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

        {/* Submit form */}
        {isRegistered ? (
          <motion.div className="rounded-3xl border border-emerald-500/20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Upload className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Submit Your Model</h2>
                {selectedComp && (
                  <p className="text-xs text-emerald-500 font-mono mt-0.5">Selected: {selectedComp.title}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Your Name</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Model Name</label>
                <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. Random Forest v2"
                  className="w-full px-4 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Predictions CSV</label>
                <div onClick={() => fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border hover:border-emerald-500/30 hover:bg-emerald-500/5'}`}>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  {file ? (
                    <div className="space-y-1">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="font-bold text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm font-semibold text-foreground">Drop your CSV file here</p>
                      <p className="text-xs text-muted-foreground">or click to browse</p>
                    </div>
                  )}
                </div>
              </div>

              {!selectedComp && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-400">Please select a competition above before submitting.</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading || !selectedComp}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tight">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Scoring...</> : <><Zap className="w-5 h-5" /> Submit & Score</>}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-border/60 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-8 text-center space-y-4">
            <Lock className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="font-bold text-foreground">Register to submit predictions</p>
            <p className="text-sm text-muted-foreground">You need to register before you can submit to the leaderboard.</p>
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

        {/* Result */}
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
                  { label: 'Accuracy',  value: result.accuracy  },
                  { label: 'F1 Score',  value: result.f1        },
                  { label: 'Precision', value: result.precision },
                  { label: 'Recall',    value: result.recall    },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-2xl bg-black/20 border border-emerald-500/20 p-4 text-center">
                    <p className="text-3xl font-black text-emerald-400">{metric.value}%</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{metric.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rankings */}
        <motion.div className="rounded-3xl border border-border/60 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-6 shadow-2xl"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight">Rankings</h2>
                {selectedComp && <p className="text-xs text-muted-foreground font-mono">{selectedComp.title}</p>}
              </div>
            </div>
            {lbLoading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              {selectedComp ? `No submissions yet for ${selectedComp.title}. Be the first!` : 'Select a competition to see rankings.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    {['#', 'Name', 'Model', 'Accuracy', 'F1', 'Precision', 'Recall'].map((h) => (
                      <th key={h} className="pb-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {leaderboard.map((row, i) => (
                    <tr key={row.id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className={`py-3 pr-4 font-black text-lg ${MEDAL[i] || 'text-muted-foreground'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </td>
                      <td className="py-3 pr-4 font-bold text-foreground">{row.username}</td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs font-mono">{row.model_name}</td>
                      <td className="py-3 pr-4 font-black text-emerald-400">{row.accuracy}%</td>
                      <td className="py-3 pr-4 text-foreground">{row.f1_score}%</td>
                      <td className="py-3 pr-4 text-foreground">{row.precision}%</td>
                      <td className="py-3 pr-4 text-foreground">{row.recall}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Live Feed */}
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