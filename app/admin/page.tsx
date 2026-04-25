'use client'

// app/admin/page.tsx
// ============================================================
// VAF UBWENGE TECH -- Hidden Admin Panel
// Access: 20 clicks on footer logo → password prompt
// Password stored in ADMIN_PASSWORD env variable
// Leaderboard is READ-ONLY -- no edit/delete
// ============================================================

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
  ChevronDown, ChevronUp, BarChart2,
  LogOut, Globe, Settings
} from 'lucide-react'

// ── Types ──
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
  members: string[]
  created_at: string
}

interface LeaderboardRow {
  id: string
  username: string
  model_name: string
  accuracy: number
  f1_score: number
  precision: number
  recall: number
  submitted_at: string
}

interface SiteSetting {
  id: string
  key: string
  value: string
}

// ── Tab type ──
type Tab = 'overview' | 'competitions' | 'registrations' | 'leaderboard' | 'sitetext'

// ============================================================
export default function AdminPage() {
  const [authed, setAuthed]       = useState(false)
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [tab, setTab] = useState<Tab>('overview')

  // Data
  const [competitions,  setCompetitions]  = useState<Competition[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [leaderboard,   setLeaderboard]   = useState<LeaderboardRow[]>([])
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

  // Site text editing
  const [editingKey,   setEditingKey]   = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState('')
  const [error,   setError]   = useState('')

  // ── Auth ──
  async function handleAuth() {
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setAuthed(true)
        loadAll()
      } else {
        setAuthError('Incorrect password.')
      }
    } catch {
      setAuthError('Connection error.')
    }
    setAuthLoading(false)
  }

  // ── Load all data ──
  async function loadAll() {
    const [c, r, l, s] = await Promise.all([
      supabase.from('competitions').select('*').order('created_at', { ascending: false }),
      supabase.from('registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('leaderboard').select('*').order('accuracy', { ascending: false }).limit(50),
      supabase.from('admin_settings').select('*'),
    ])
    if (c.data) setCompetitions(c.data)
    if (r.data) setRegistrations(r.data)
    if (l.data) setLeaderboard(l.data)
    if (s.data) setSiteSettings(s.data)
  }

  function flash(msg: string, isError = false) {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000) }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 4000) }
  }

  // ── Competition CRUD ──
  function openNewComp() {
    setEditingComp(null)
    setCompForm({
      title: '', summary: '', description: '',
      dataset_url: '', rules: '', prize: '',
      tags: '', deadline: '', status: 'open', participants: 0,
    })
    setShowCompForm(true)
  }

  function openEditComp(c: Competition) {
    setEditingComp(c)
    setCompForm({
      title:       c.title,
      summary:     c.summary,
      description: c.description,
      dataset_url: c.dataset_url,
      rules:       c.rules,
      prize:       c.prize,
      tags:        c.tags.join(', '),
      deadline:    c.deadline.split('T')[0],
      status:      c.status,
      participants: c.participants,
    })
    setShowCompForm(true)
  }

  async function saveComp() {
    if (!compForm.title.trim()) { flash('Title is required.', true); return }
    setSaving(true)
    const payload = {
      ...compForm,
      tags: compForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    let err
    if (editingComp) {
      const res = await supabase.from('competitions').update(payload).eq('id', editingComp.id)
      err = res.error
    } else {
      const res = await supabase.from('competitions').insert(payload)
      err = res.error
    }
    setSaving(false)
    if (err) { flash(err.message, true); return }
    flash(editingComp ? 'Competition updated!' : 'Competition created!')
    setShowCompForm(false)
    loadAll()
  }

  async function deleteComp(id: string) {
    if (!confirm('Delete this competition? This cannot be undone.')) return
    const { error } = await supabase.from('competitions').delete().eq('id', id)
    if (error) { flash(error.message, true); return }
    flash('Competition deleted.')
    loadAll()
  }

  // ── Site text ──
  async function saveSiteSetting(key: string, value: string) {
    setSaving(true)
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key, value }, { onConflict: 'key' })
    setSaving(false)
    if (error) { flash(error.message, true); return }
    flash('Text saved!')
    setEditingKey(null)
    loadAll()
  }

  // ── Logout ──
  function logout() {
    setAuthed(false)
    setPassword('')
    setTab('overview')
  }

  // ============================================================
  // LOGIN SCREEN
  // ============================================================
  if (!authed) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-emerald-500/20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-10 shadow-2xl space-y-8"
        >
          {/* Icon */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Admin Access</h1>
              <p className="text-xs text-muted-foreground font-mono mt-1">VAF UBWENGE TECH — Developer Panel</p>
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="Enter admin password"
                className="w-full pl-11 pr-12 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <button
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{authError}</p>
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={authLoading || !password}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tight"
            >
              {authLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                : <><ShieldCheck className="w-4 h-4" /> Enter Panel</>
              }
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
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-red-500/40 hover:text-red-400 text-muted-foreground transition-all text-sm font-bold"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Flash messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6"
            >
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-emerald-400">{success}</p>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-6"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border/50 pb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-tight transition-all border ${
                tab === t.id
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'border-border text-muted-foreground hover:border-emerald-500/30 bg-white/5'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Competitions',  value: competitions.length,  icon: Briefcase, color: 'emerald' },
              { label: 'Registrations', value: registrations.length, icon: Users,     color: 'sky'     },
              { label: 'Submissions',   value: leaderboard.length,   icon: Trophy,    color: 'amber'   },
              { label: 'Open',          value: competitions.filter(c => c.status === 'open').length, icon: Globe, color: 'violet' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/60 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-6 text-center"
              >
                <p className="text-4xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── COMPETITIONS ── */}
        {tab === 'competitions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black uppercase tracking-tight">Competitions</h2>
              <button
                onClick={openNewComp}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all active:scale-95 text-sm uppercase tracking-tight"
              >
                <Plus className="w-4 h-4" /> New Competition
              </button>
            </div>

            {/* Form modal */}
            <AnimatePresence>
              {showCompForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl border border-emerald-500/20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-black uppercase tracking-tight">
                      {editingComp ? 'Edit Competition' : 'New Competition'}
                    </h3>
                    <button onClick={() => setShowCompForm(false)}>
                      <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: 'title',       label: 'Title',          placeholder: 'e.g. Crop Disease Detection' },
                      { key: 'summary',     label: 'Summary',        placeholder: 'One-line description' },
                      { key: 'prize',       label: 'Prize',          placeholder: 'e.g. Points / $500' },
                      { key: 'dataset_url', label: 'Dataset URL',    placeholder: 'https://...' },
                      { key: 'tags',        label: 'Tags (comma separated)', placeholder: 'Beginner Friendly, NLP' },
                      { key: 'deadline',    label: 'Deadline',       placeholder: '', type: 'date' },
                    ].map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{f.label}</label>
                        <input
                          type={f.type || 'text'}
                          value={(compForm as any)[f.key]}
                          onChange={(e) => setCompForm({ ...compForm, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</label>
                    <div className="flex gap-3">
                      {(['open', 'upcoming', 'closed'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setCompForm({ ...compForm, status: s })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            compForm.status === s
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'border-border text-muted-foreground'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Problem Description</label>
                    <textarea
                      value={compForm.description}
                      onChange={(e) => setCompForm({ ...compForm, description: e.target.value })}
                      rows={5}
                      placeholder="Full problem statement visible to registered users only..."
                      className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    />
                  </div>

                  {/* Rules */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rules (one per line)</label>
                    <textarea
                      value={compForm.rules}
                      onChange={(e) => setCompForm({ ...compForm, rules: e.target.value })}
                      rows={4}
                      placeholder="1. You may only submit once per day&#10;2. External data is not allowed"
                      className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    />
                  </div>

                  <button
                    onClick={saveComp}
                    disabled={saving}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tight"
                  >
                    {saving
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      : <><Save className="w-4 h-4" /> {editingComp ? 'Update Competition' : 'Create Competition'}</>
                    }
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Competition list */}
            <div className="space-y-3">
              {competitions.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 text-sm">No competitions yet. Create your first one.</p>
              ) : competitions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-5 rounded-2xl border border-border/60 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        c.status === 'open' ? 'bg-emerald-500/10 text-emerald-400'
                        : c.status === 'upcoming' ? 'bg-sky-500/10 text-sky-400'
                        : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{c.prize}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        Deadline: {new Date(c.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEditComp(c)}
                      className="p-2.5 rounded-xl border border-border hover:border-emerald-500/40 hover:text-emerald-400 text-muted-foreground transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteComp(c.id)}
                      className="p-2.5 rounded-xl border border-border hover:border-red-500/40 hover:text-red-400 text-muted-foreground transition-all"
                    >
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tight">
                Registrations <span className="text-emerald-500">({registrations.length})</span>
              </h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-white/5 dark:bg-slate-900/40">
                  <tr>
                    {['Type', 'Name', 'Email', 'Members', 'Registered'].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {registrations.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No registrations yet.</td></tr>
                  ) : registrations.map((r) => (
                    <tr key={r.id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                          r.type === 'team'
                            ? 'bg-sky-500/10 text-sky-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">{r.display_name}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs font-mono">{r.email}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {r.members?.length > 0 ? r.members.join(', ') : '—'}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LEADERBOARD (READ-ONLY) ── */}
        {tab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black uppercase tracking-tight">Leaderboard</h2>
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3" /> Read Only — Rankings are locked
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Leaderboard rankings cannot be edited by anyone, including admins. Scores are calculated automatically by the scoring engine.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-white/5 dark:bg-slate-900/40">
                  <tr>
                    {['#', 'Name', 'Model', 'Accuracy', 'F1', 'Precision', 'Recall', 'Date'].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {leaderboard.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-muted-foreground text-sm">No submissions yet.</td></tr>
                  ) : leaderboard.map((row, i) => (
                    <tr key={row.id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="px-5 py-4 font-black text-lg">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">{row.username}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs font-mono">{row.model_name}</td>
                      <td className="px-5 py-4 font-black text-emerald-400">{row.accuracy}%</td>
                      <td className="px-5 py-4 text-foreground">{row.f1_score}%</td>
                      <td className="px-5 py-4 text-foreground">{row.precision}%</td>
                      <td className="px-5 py-4 text-foreground">{row.recall}%</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {new Date(row.submitted_at).toLocaleDateString()}
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
            <p className="text-xs text-muted-foreground">
              Edit key website texts. Changes are saved to Supabase and can be loaded dynamically by each component.
            </p>

            {siteSettings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                No site settings found. Run the Phase 2 SQL to add default settings.
              </p>
            ) : (
              <div className="space-y-3">
                {siteSettings.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-border/60 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-emerald-500 uppercase tracking-widest font-mono">{s.key}</p>
                      {editingKey !== s.key && (
                        <button
                          onClick={() => { setEditingKey(s.key); setEditingValue(s.value) }}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-400 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      )}
                    </div>

                    {editingKey === s.key ? (
                      <div className="space-y-3">
                        <textarea
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 bg-black/20 border border-emerald-500/30 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveSiteSetting(s.key, editingValue)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all"
                          >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="px-4 py-2 border border-border hover:border-red-500/40 text-muted-foreground hover:text-red-400 font-bold rounded-xl text-sm transition-all"
                          >
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