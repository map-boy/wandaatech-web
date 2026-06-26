'use client'

// app/admin/page.tsx

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/header'
import Link from 'next/link'
import {
  Lock, ShieldCheck, Eye, EyeOff,
  Trophy, Users, Briefcase, FileText,
  Plus, Trash2, Save, X, Edit3,
  CheckCircle, AlertCircle, Loader2,
  BarChart2, LogOut, Globe, Copy,
  Download, RefreshCw, Filter
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface Competition {
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
}

interface Registration {
  id: string
  type: 'individual' | 'team'
  display_name: string
  email: string
  university: string
  members: string[]
  registered_at: string
  competition_id: string | null
}

interface Submission {
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

interface SiteSetting {
  id: string
  key: string
  value: string
}

type Tab = 'overview' | 'competitions' | 'registrations' | 'leaderboard' | 'submissions' | 'sitetext'

// ── CSV helper ─────────────────────────────────────────────────────────────

function downloadCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const escape = (v: any) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ==========================================================================
export default function AdminPage() {
  const [authed,      setAuthed]      = useState(false)
  const [password,    setPassword]    = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [authError,   setAuthError]   = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [tab, setTab] = useState<Tab>('overview')

  const [competitions,  setCompetitions]  = useState<Competition[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [submissions,   setSubmissions]   = useState<Submission[]>([])
  const [siteSettings,  setSiteSettings]  = useState<SiteSetting[]>([])

  // Competition form
  const [showCompForm, setShowCompForm] = useState(false)
  const [editingComp,  setEditingComp]  = useState<Competition | null>(null)
  const [compForm, setCompForm] = useState({
    title: '', summary: '', description: '',
    dataset_url: '', rules: '', prize: '',
    tags: '', deadline: '', status: 'open' as Competition['status'],
    participants: 0,
  })

  // Ground truth
  const [truthFile,         setTruthFile]         = useState<File | null>(null)
  const [truthUploadStatus, setTruthUploadStatus] = useState('')

  // Filters
  const [regCompFilter, setRegCompFilter] = useState('all')
  const [lbCompFilter,  setLbCompFilter]  = useState('all')
  const [subCompFilter, setSubCompFilter] = useState('all')

  // Site text
  const [editingKey,   setEditingKey]   = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const [copiedId,  setCopiedId]  = useState<string | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [success,   setSuccess]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function handleAuth() {
    setAuthLoading(true); setAuthError('')
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) { setAuthed(true); loadAll() }
      else        setAuthError('Incorrect password.')
    } catch { setAuthError('Connection error.') }
    setAuthLoading(false)
  }

  // ── Load all ──────────────────────────────────────────────────────────────
  async function loadAll() {
    setLoading(true)
    const [c, r, s, st] = await Promise.all([
      supabase.from('competitions').select('*').order('created_at', { ascending: false }),
      supabase.from('registrations').select('id,type,display_name,email,university,members,registered_at,competition_id').order('registered_at', { ascending: false }),
      supabase.from('submissions').select('id,username,model_name,accuracy_score,f1_score,code_score,final_score,created_at,competition_id,feedback').order('created_at', { ascending: false }),
      supabase.from('admin_settings').select('*'),
    ])
    if (c.data)  setCompetitions(c.data)
    if (r.data)  setRegistrations(r.data as Registration[])
    if (s.data)  setSubmissions(s.data as Submission[])
    if (st.data) setSiteSettings(st.data)
    setLoading(false)
  }

  function flash(msg: string, isError = false) {
    if (isError) { setError(msg);   setTimeout(() => setError(''),   4000) }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 4000) }
  }

  // ── Competition CRUD ──────────────────────────────────────────────────────
  function openNewComp() {
    setEditingComp(null)
    setCompForm({ title:'', summary:'', description:'', dataset_url:'', rules:'', prize:'', tags:'', deadline:'', status:'open', participants:0 })
    setTruthFile(null); setTruthUploadStatus(''); setShowCompForm(true)
  }

  function openEditComp(c: Competition) {
    setEditingComp(c)
    setCompForm({ title:c.title, summary:c.summary, description:c.description, dataset_url:c.dataset_url, rules:c.rules, prize:c.prize, tags:c.tags.join(', '), deadline:c.deadline.split('T')[0], status:c.status, participants:c.participants })
    setTruthFile(null); setTruthUploadStatus(''); setShowCompForm(true)
  }

  async function saveComp() {
    if (!compForm.title.trim()) { flash('Title is required.', true); return }
    setSaving(true)
    const payload = { ...compForm, tags: compForm.tags.split(',').map(t => t.trim()).filter(Boolean) }
    let competitionId = editingComp?.id ?? null
    let err

    if (editingComp) {
      const res = await supabase.from('competitions').update(payload).eq('id', editingComp.id)
      err = res.error
    } else {
      const res = await supabase.from('competitions').insert(payload).select('id').single()
      err = res.error
      if (!err && res.data) competitionId = res.data.id
    }

    if (err) { setSaving(false); flash(err.message, true); return }

    if (truthFile && competitionId) {
      setTruthUploadStatus('Parsing truth CSV…')
      try {
        const text   = await truthFile.text()
        const lines  = text.trim().split('\n').filter(Boolean)
        const header = lines[0].split(',').map(s => s.trim().toLowerCase())
        const labelColIdx = (() => {
          const i = header.findIndex(h => h==='true_label'||h==='label'||h==='result'||h.includes('pass')||h.includes('true'))
          return i !== -1 ? i : 1
        })()
        const rows = lines.slice(1).map((line) => {
          const cols = line.split(',').map(s => s.trim())
          const row_id   = cols[0] ?? ''
          let true_label = (cols[labelColIdx] ?? cols[1] ?? '').toLowerCase()
          if (true_label==='1')   true_label='pass'
          if (true_label==='0')   true_label='fail'
          if (true_label==='yes') true_label='pass'
          if (true_label==='no')  true_label='fail'
          const diffIdx   = header.indexOf('difficulty_tier')
          const advIdx    = header.indexOf('adversarial')
          const weightIdx = header.indexOf('column_weight')
          return {
            row_id, true_label, competition_id: competitionId,
            difficulty_tier: diffIdx   !== -1 ? (cols[diffIdx] || 'easy') : 'easy',
            adversarial:     advIdx    !== -1 ? cols[advIdx]==='true' : false,
            column_weight:   weightIdx !== -1 ? parseFloat(cols[weightIdx]) || 1.0 : 1.0,
          }
        }).filter(r => r.row_id !== '')

        setTruthUploadStatus(`Inserting ${rows.length} rows…`)
        const res = await fetch('/api/admin-upload-truth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ competition_id: competitionId, rows }),
        })
        const result = await res.json()
        if (!res.ok) flash(`Saved but truth failed: ${result.error}`, true)
        else { setTruthUploadStatus(`✓ ${rows.length} rows inserted`); flash(`Saved + ${rows.length} truth rows!`) }
      } catch (e: any) { flash(`Saved but CSV parse failed: ${e.message}`, true) }
    } else {
      flash(editingComp ? 'Competition updated!' : 'Competition created!')
    }

    setSaving(false); setShowCompForm(false); setTruthFile(null); setTruthUploadStatus(''); loadAll()
  }

  async function deleteComp(id: string) {
    if (!confirm('Delete this competition? This cannot be undone.')) return
    const { error } = await supabase.from('competitions').delete().eq('id', id)
    if (error) { flash(error.message, true); return }
    flash('Competition deleted.'); loadAll()
  }

  // ── Download ground truth CSV for a competition ───────────────────────────
  async function downloadGroundTruth(compId: string, compTitle: string) {
    const { data, error } = await supabase
      .from('ground_truth')
      .select('row_id,true_label,difficulty_tier,adversarial,column_weight')
      .eq('competition_id', compId)
      .order('row_id')
    if (error || !data) { flash('Failed to load ground truth.', true); return }
    downloadCSV(
      `ground_truth_${compTitle.replace(/\s+/g, '_').toLowerCase()}.csv`,
      ['row_id', 'true_label', 'difficulty_tier', 'adversarial', 'column_weight'],
      data.map(r => [r.row_id, r.true_label, r.difficulty_tier, r.adversarial, r.column_weight])
    )
  }

  // ── Site text ─────────────────────────────────────────────────────────────
  async function saveSiteSetting(key: string, value: string) {
    setSaving(true)
    const { error } = await supabase.from('admin_settings').upsert({ key, value }, { onConflict: 'key' })
    setSaving(false)
    if (error) { flash(error.message, true); return }
    flash('Text saved!'); setEditingKey(null); loadAll()
  }

  function logout() { setAuthed(false); setPassword(''); setTab('overview') }

  // ── Derived ───────────────────────────────────────────────────────────────
  const participantsByComp = registrations.reduce((acc, r) => {
    if (r.competition_id) acc[r.competition_id] = (acc[r.competition_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const compName = (id: string | null) => competitions.find(c => c.id === id)?.title ?? '—'

  const filteredRegs = regCompFilter === 'all' ? registrations : registrations.filter(r => r.competition_id === regCompFilter)

  // Leaderboard: best submission per user per competition
  const lbSubmissions = (lbCompFilter === 'all' ? submissions : submissions.filter(s => s.competition_id === lbCompFilter))
  const seen = new Set<string>()
  const leaderboard = [...lbSubmissions]
    .sort((a, b) => b.final_score - a.final_score)
    .filter(s => { const key = `${s.username}-${s.competition_id}`; if (seen.has(key)) return false; seen.add(key); return true })

  const filteredSubs = subCompFilter === 'all' ? submissions : submissions.filter(s => s.competition_id === subCompFilter)

  // ============================================================
  // LOGIN SCREEN
  // ============================================================
  if (!authed) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
        </div>
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          className="w-full max-w-md rounded-3xl border border-emerald-500/20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-10 shadow-2xl space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Admin Access</h1>
              <p className="text-xs text-muted-foreground font-mono mt-1">VAF UBWENGE TECH — Developer Panel</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="Enter admin password"
                className="w-full pl-11 pr-12 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
              <button onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {authError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{authError}</p>
              </div>
            )}
            <button onClick={handleAuth} disabled={authLoading || !password}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tight">
              {authLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <><ShieldCheck className="w-4 h-4" /> Enter Panel</>}
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-emerald-500 transition-colors">← Back to site</Link>
          </p>
        </motion.div>
      </div>
    )
  }

  // ============================================================
  // ADMIN DASHBOARD
  // ============================================================
  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview',      label: 'Overview',      icon: BarChart2  },
    { id: 'competitions',  label: 'Competitions',  icon: Briefcase  },
    { id: 'registrations', label: 'Registrations', icon: Users      },
    { id: 'leaderboard',   label: 'Leaderboard',   icon: Trophy     },
    { id: 'submissions',   label: 'Submissions',   icon: FileText   },
    { id: 'sitetext',      label: 'Site Text',     icon: Globe      },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/8 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h1 className="text-2xl font-black uppercase tracking-tight">Admin Panel</h1>
            </div>
            <p className="text-xs text-muted-foreground font-mono">VAF UBWENGE TECH — Developer Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} title="Refresh all data"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-emerald-500/40 text-muted-foreground hover:text-emerald-400 transition-all text-sm font-bold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
            <button onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-red-500/40 hover:text-red-400 text-muted-foreground transition-all text-sm font-bold">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Flash messages */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-emerald-400">{success}</p>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border/50 pb-4">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-tight transition-all border ${
                tab === t.id
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'border-border text-muted-foreground hover:border-emerald-500/30 bg-white/5'
              }`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Competitions',  value: competitions.length,                                      icon: Briefcase },
              { label: 'Registrations', value: registrations.length,                                     icon: Users     },
              { label: 'Submissions',   value: submissions.length,                                       icon: FileText  },
              { label: 'Open',          value: competitions.filter(c => c.status === 'open').length,     icon: Globe     },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                className="rounded-2xl border border-border/60 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-6 text-center">
                <p className="text-4xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
              </motion.div>
            ))}

            {/* Per-competition summary */}
            <div className="col-span-2 sm:col-span-4 mt-4 rounded-2xl border border-border/60 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-6">
              <h3 className="text-sm font-black uppercase tracking-tight mb-4">Per Competition Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      {['Competition', 'Status', 'Registrations', 'Submissions', 'Deadline'].map(h => (
                        <th key={h} className="pb-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest pr-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {competitions.map(c => (
                      <tr key={c.id} className="hover:bg-white/5">
                        <td className="py-3 pr-6 font-bold text-foreground">{c.title}</td>
                        <td className="py-3 pr-6">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            c.status==='open' ? 'bg-emerald-500/10 text-emerald-400' :
                            c.status==='upcoming' ? 'bg-sky-500/10 text-sky-400' :
                            'bg-slate-500/10 text-slate-400'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 pr-6 text-emerald-400 font-bold">{participantsByComp[c.id] ?? 0}</td>
                        <td className="py-3 pr-6 text-amber-400 font-bold">{submissions.filter(s => s.competition_id === c.id).length}</td>
                        <td className="py-3 pr-6 text-muted-foreground text-xs">{new Date(c.deadline).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── COMPETITIONS ── */}
        {tab === 'competitions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black uppercase tracking-tight">Competitions</h2>
              <button onClick={openNewComp}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all active:scale-95 text-sm uppercase tracking-tight">
                <Plus className="w-4 h-4" /> New Competition
              </button>
            </div>

            <AnimatePresence>
              {showCompForm && (
                <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="rounded-3xl border border-emerald-500/20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black uppercase tracking-tight">{editingComp ? 'Edit Competition' : 'New Competition'}</h3>
                    <button onClick={() => setShowCompForm(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key:'title',       label:'Title',                    placeholder:'e.g. Crop Disease Detection' },
                      { key:'summary',     label:'Summary',                  placeholder:'One-line description' },
                      { key:'prize',       label:'Prize',                    placeholder:'e.g. Points / $500' },
                      { key:'dataset_url', label:'Dataset URL',              placeholder:'https://...' },
                      { key:'tags',        label:'Tags (comma separated)',   placeholder:'Beginner Friendly, NLP' },
                      { key:'deadline',    label:'Deadline',                 placeholder:'', type:'date' },
                    ].map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{f.label}</label>
                        <input type={f.type || 'text'} value={(compForm as any)[f.key]}
                          onChange={(e) => setCompForm({ ...compForm, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</label>
                    <div className="flex gap-3">
                      {(['open','upcoming','closed'] as const).map((s) => (
                        <button key={s} onClick={() => setCompForm({ ...compForm, status:s })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            compForm.status===s ? 'bg-emerald-500 text-white border-emerald-500' : 'border-border text-muted-foreground'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Problem Description</label>
                    <textarea value={compForm.description} onChange={(e) => setCompForm({ ...compForm, description:e.target.value })}
                      rows={5} placeholder="Full problem statement visible to registered users only..."
                      className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rules (one per line)</label>
                    <textarea value={compForm.rules} onChange={(e) => setCompForm({ ...compForm, rules:e.target.value })}
                      rows={4} placeholder="1. You may only submit once per day&#10;2. External data is not allowed"
                      className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Ground Truth CSV <span className="text-emerald-500">(required for scoring)</span>
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      First column = row_id, second column = label. Supports: healthy/diseased, pass/fail, 1/0.
                    </p>
                    <label className="flex items-center gap-3 px-4 py-3 bg-black/20 border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-xl cursor-pointer transition-all group">
                      <FileText className="w-5 h-5 text-emerald-500/60 group-hover:text-emerald-400 shrink-0" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground truncate">
                        {truthFile ? truthFile.name : 'Click to choose truth.csv'}
                      </span>
                      <input type="file" accept=".csv" className="hidden"
                        onChange={(e) => { setTruthFile(e.target.files?.[0] ?? null); setTruthUploadStatus('') }} />
                    </label>
                    {truthFile && <p className="text-xs text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> {truthFile.name} — will upload on save</p>}
                    {truthUploadStatus && <p className="text-xs text-sky-400">{truthUploadStatus}</p>}
                  </div>
                  <button onClick={saveComp} disabled={saving}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tight">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {editingComp ? 'Update' : 'Create'}</>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {competitions.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 text-sm">No competitions yet.</p>
              ) : competitions.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-5 rounded-2xl border border-border/60 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        c.status==='open' ? 'bg-emerald-500/10 text-emerald-400' :
                        c.status==='upcoming' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-500/10 text-slate-400'}`}>
                        {c.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{c.prize}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">Deadline: {new Date(c.deadline).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs font-bold text-emerald-400">{participantsByComp[c.id] ?? 0} participant{(participantsByComp[c.id]??0)!==1?'s':''}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs font-bold text-amber-400">{submissions.filter(s=>s.competition_id===c.id).length} submission{submissions.filter(s=>s.competition_id===c.id).length!==1?'s':''}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-mono text-muted-foreground/60 truncate max-w-[260px]">{c.id}</span>
                      <button onClick={() => { navigator.clipboard.writeText(c.id); setCopiedId(c.id); setTimeout(()=>setCopiedId(null),2000) }}
                        className="text-muted-foreground hover:text-emerald-400 transition-colors shrink-0" title="Copy ID">
                        {copiedId===c.id ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {/* Download Ground Truth */}
                    <button onClick={() => downloadGroundTruth(c.id, c.title)} title="Download Ground Truth CSV"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-sky-500/40 hover:text-sky-400 text-muted-foreground transition-all text-xs font-bold">
                      <Download className="w-3.5 h-3.5" /> Truth
                    </button>
                    <button onClick={() => openEditComp(c)}
                      className="p-2.5 rounded-xl border border-border hover:border-emerald-500/40 hover:text-emerald-400 text-muted-foreground transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteComp(c.id)}
                      className="p-2.5 rounded-xl border border-border hover:border-red-500/40 hover:text-red-400 text-muted-foreground transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REGISTRATIONS ── */}
        {tab === 'registrations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-black uppercase tracking-tight">
                Registrations <span className="text-emerald-500">({filteredRegs.length})</span>
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select value={regCompFilter} onChange={(e) => setRegCompFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/5 dark:bg-slate-900/40 border border-border text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                    <option value="all">All Competitions ({registrations.length})</option>
                    {competitions.map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({participantsByComp[c.id]??0})</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => downloadCSV(
                  `registrations_${regCompFilter==='all' ? 'all' : compName(regCompFilter).replace(/\s+/g,'_').toLowerCase()}.csv`,
                  ['Name','Email','Type','University','Members','Competition','Registered'],
                  filteredRegs.map(r => [r.display_name, r.email, r.type, r.university, (r.members||[]).join('; '), compName(r.competition_id), new Date(r.registered_at).toLocaleString()])
                )} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-95">
                  <Download className="w-3.5 h-3.5" /> Download CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-white/5 dark:bg-slate-900/40">
                  <tr>
                    {['#', 'Type', 'Name', 'Email', 'University', 'Competition', 'Members', 'Registered'].map(h => (
                      <th key={h} className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredRegs.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-muted-foreground text-sm">No registrations found.</td></tr>
                  ) : filteredRegs.map((r, i) => (
                    <tr key={r.id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs font-bold">{i+1}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${r.type==='team' ? 'bg-sky-500/10 text-sky-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{r.type}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-foreground">{r.display_name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{r.email}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{r.university || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{compName(r.competition_id)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{r.members?.length > 0 ? r.members.join(', ') : '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(r.registered_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LEADERBOARD ── */}
        {tab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black uppercase tracking-tight">Leaderboard</h2>
                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                  <Lock className="w-3 h-3" /> Best Per User
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select value={lbCompFilter} onChange={(e) => setLbCompFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/5 dark:bg-slate-900/40 border border-border text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                    <option value="all">All Competitions</option>
                    {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <button onClick={() => downloadCSV(
                  `leaderboard_${lbCompFilter==='all' ? 'all' : compName(lbCompFilter).replace(/\s+/g,'_').toLowerCase()}.csv`,
                  ['Rank','Name','Model','Competition','Accuracy','F1','Code','Final Score','Date'],
                  leaderboard.map((r,i) => [i+1, r.username, r.model_name, compName(r.competition_id), r.accuracy_score, r.f1_score, r.code_score, r.final_score, new Date(r.created_at).toLocaleString()])
                )} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-95">
                  <Download className="w-3.5 h-3.5" /> Download CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-white/5 dark:bg-slate-900/40">
                  <tr>
                    {['#', 'Name', 'Model', 'Competition', 'Accuracy', 'F1', 'Code', 'Final Score', 'Date'].map(h => (
                      <th key={h} className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {leaderboard.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-10 text-muted-foreground text-sm">No submissions yet.</td></tr>
                  ) : leaderboard.map((row, i) => (
                    <tr key={row.id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="px-4 py-3 font-black text-lg">
                        {i===0?'🥇':i===1?'🥈':i===2?'🥉':<span className="text-sm text-muted-foreground">{i+1}</span>}
                      </td>
                      <td className="px-4 py-3 font-bold text-foreground">{row.username}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{row.model_name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{compName(row.competition_id)}</td>
                      <td className="px-4 py-3 text-foreground tabular-nums">{Number(row.accuracy_score).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-foreground tabular-nums">{Number(row.f1_score).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-foreground tabular-nums">{Number(row.code_score).toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <span className={`font-black tabular-nums ${i===0?'text-yellow-400 text-base':i===1?'text-slate-300':i===2?'text-amber-600':'text-emerald-400'}`}>
                          {Number(row.final_score).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(row.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SUBMISSIONS (ALL RAW) ── */}
        {tab === 'submissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-black uppercase tracking-tight">
                All Submissions <span className="text-amber-400">({filteredSubs.length})</span>
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select value={subCompFilter} onChange={(e) => setSubCompFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/5 dark:bg-slate-900/40 border border-border text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                    <option value="all">All Competitions ({submissions.length})</option>
                    {competitions.map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({submissions.filter(s=>s.competition_id===c.id).length})</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => downloadCSV(
                  `submissions_${subCompFilter==='all' ? 'all' : compName(subCompFilter).replace(/\s+/g,'_').toLowerCase()}.csv`,
                  ['#','Name','Model','Competition','Accuracy','F1','Code','Final Score','Submitted'],
                  filteredSubs.map((s,i) => [i+1, s.username, s.model_name, compName(s.competition_id), s.accuracy_score, s.f1_score, s.code_score, s.final_score, new Date(s.created_at).toLocaleString()])
                )} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-95">
                  <Download className="w-3.5 h-3.5" /> Download CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-white/5 dark:bg-slate-900/40">
                  <tr>
                    {['#', 'Name', 'Model', 'Competition', 'Accuracy', 'F1', 'Code', 'Final Score', 'Submitted'].map(h => (
                      <th key={h} className="px-4 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredSubs.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-10 text-muted-foreground text-sm">No submissions yet.</td></tr>
                  ) : filteredSubs.map((s, i) => (
                    <tr key={s.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs font-bold">{i+1}</td>
                      <td className="px-4 py-3 font-bold text-foreground">{s.username}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{s.model_name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{compName(s.competition_id)}</td>
                      <td className="px-4 py-3 text-foreground tabular-nums">{Number(s.accuracy_score).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-foreground tabular-nums">{Number(s.f1_score).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-foreground tabular-nums">{Number(s.code_score).toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <span className="font-black text-emerald-400 tabular-nums">{Number(s.final_score).toFixed(1)}%</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(s.created_at).toLocaleDateString()}{' '}
                        <span className="opacity-60">{new Date(s.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SITE TEXT ── */}
        {tab === 'sitetext' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-tight">Site Text Editor</h2>
            <p className="text-xs text-muted-foreground">Edit key website texts. Changes saved to Supabase and loaded dynamically.</p>
            {siteSettings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">No site settings found.</p>
            ) : (
              <div className="space-y-3">
                {siteSettings.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-border/60 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-emerald-500 uppercase tracking-widest font-mono">{s.key}</p>
                      {editingKey !== s.key && (
                        <button onClick={() => { setEditingKey(s.key); setEditingValue(s.value) }}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-400 transition-colors">
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      )}
                    </div>
                    {editingKey === s.key ? (
                      <div className="space-y-3">
                        <textarea value={editingValue} onChange={(e) => setEditingValue(e.target.value)} rows={4}
                          className="w-full px-4 py-3 bg-black/20 border border-emerald-500/30 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-sm" />
                        <div className="flex gap-2">
                          <button onClick={() => saveSiteSetting(s.key, editingValue)} disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all">
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                          </button>
                          <button onClick={() => setEditingKey(null)}
                            className="px-4 py-2 border border-border hover:border-red-500/40 text-muted-foreground hover:text-red-400 font-bold rounded-xl text-sm transition-all">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.value}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}