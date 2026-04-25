'use client'

// app/competitions/RegisterTab.tsx

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
  Users, User, Mail, Plus, X,
  CheckCircle, AlertCircle, Loader2, Copy, Link2
} from 'lucide-react'
import { generateToken } from './types'

export default function RegisterTab({ onRegistered }: { onRegistered: (name: string) => void }) {
  const [type, setType]               = useState<'individual' | 'team' | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [university, setUniversity]   = useState('')
  const [members, setMembers]         = useState<string[]>(['', ''])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState(false)
  const [savedToken, setSavedToken]   = useState('')
  const [teamToken, setTeamToken]     = useState('')
  const [copied, setCopied]           = useState(false)

  const alreadyRegistered = typeof window !== 'undefined' && !!localStorage.getItem('vaf_token')
  const alreadyName       = typeof window !== 'undefined' ? localStorage.getItem('vaf_name') || '' : ''
  const alreadyType       = typeof window !== 'undefined' ? localStorage.getItem('vaf_type') || '' : ''
  const alreadyTeam       = typeof window !== 'undefined' ? localStorage.getItem('vaf_team') || '' : ''

  const addMember    = () => { if (members.length < 4) setMembers([...members, '']) }
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i))
  const updateMember = (i: number, val: string) => {
    const updated = [...members]; updated[i] = val; setMembers(updated)
  }

  function getInviteLink(token: string) {
    return `${window.location.origin}/competitions?join=${token}`
  }

  function copyInviteLink(token: string) {
    navigator.clipboard.writeText(getInviteLink(token))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegister() {
    setError('')
    if (!type)                                 { setError('Please select Individual or Team.'); return }
    if (!displayName.trim())                   { setError('Please enter your name.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email.'); return }
    if (!university.trim())                    { setError('Please enter your university or organization.'); return }
    if (type === 'team') {
      const filled = members.filter((m) => m.trim().length > 0)
      if (filled.length < 2)                   { setError('A team must have at least 2 members.'); return }
    }

    setLoading(true)
    const token  = generateToken()
    const tToken = type === 'team' ? generateToken() : ''
    const cleanMembers = type === 'team' ? members.filter((m) => m.trim().length > 0) : []

    const { error: dbError } = await supabase.from('registrations').insert({
      type,
      display_name: displayName.trim(),
      email: email.trim().toLowerCase(),
      university: university.trim(),
      members: cleanMembers,
      token,
      team_token: tToken || null,
      team_name:  type === 'team' ? displayName.trim() : null,
    })

    setLoading(false)
    if (dbError) {
      setError(dbError.message.includes('unique') ? 'This email is already registered.' : dbError.message)
      return
    }

    localStorage.setItem('vaf_token', token)
    localStorage.setItem('vaf_name', displayName.trim())
    localStorage.setItem('vaf_type', type)
    if (type === 'team') {
      localStorage.setItem('vaf_team', displayName.trim())
      localStorage.setItem('vaf_team_token', tToken)
    }

    setSavedToken(token)
    setTeamToken(tToken)
    setSuccess(true)
    onRegistered(displayName.trim())
  }

  if (alreadyRegistered && !success) {
    const storedTeamToken = typeof window !== 'undefined' ? localStorage.getItem('vaf_team_token') || '' : ''
    return (
      <div className="max-w-lg mx-auto space-y-6 py-10">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Already Registered</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Welcome back, <span className="text-emerald-400 font-bold">{alreadyName}</span>.
              {alreadyTeam && <> You are on team <span className="text-sky-400 font-bold">{alreadyTeam}</span>.</>}
            </p>
          </div>
          {alreadyType === 'team' && storedTeamToken && (
            <div className="text-left space-y-2 p-4 rounded-2xl bg-sky-500/5 border border-sky-500/20">
              <p className="text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5" /> Your Team Invite Link
              </p>
              <p className="text-xs font-mono text-muted-foreground break-all">
                {typeof window !== 'undefined' ? getInviteLink(storedTeamToken) : ''}
              </p>
              <button onClick={() => copyInviteLink(storedTeamToken)}
                className="flex items-center gap-2 text-xs text-sky-400 hover:text-sky-300 transition-colors font-bold">
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <p className="text-[10px] text-muted-foreground">Share with your team members so they can join.</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Using a different device?{' '}
            <button onClick={() => { localStorage.clear(); window.location.reload() }} className="text-emerald-500 hover:underline">
              Clear and re-register
            </button>
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto rounded-3xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-xl p-10 text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight">Registration Complete!</h2>
          <p className="text-muted-foreground">Welcome, <span className="text-emerald-400 font-bold">{displayName}</span>. You now have full access.</p>
        </div>
        {type === 'team' && teamToken && (
          <div className="text-left p-4 rounded-2xl bg-sky-500/5 border border-sky-500/20 space-y-3">
            <p className="text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5" /> Team Invite Link
            </p>
            <p className="text-xs font-mono text-muted-foreground break-all">{getInviteLink(teamToken)}</p>
            <button onClick={() => copyInviteLink(teamToken)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black transition-all active:scale-95">
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy Invite Link'}
            </button>
            <p className="text-[10px] text-muted-foreground">Share this with your team. They click it, enter their name, and join.</p>
          </div>
        )}
        <div className="p-4 rounded-2xl bg-black/20 border border-emerald-500/20 text-left space-y-2">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Your Access Token</p>
          <p className="text-xs font-mono text-muted-foreground break-all">{savedToken}</p>
          <p className="text-xs text-muted-foreground">Saved in your browser automatically.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div className="rounded-3xl border border-emerald-500/20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl space-y-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Step 1 — Who are you registering as?</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'individual', label: 'Individual', icon: User,  desc: 'Competing alone' },
              { value: 'team',       label: 'Team',       icon: Users, desc: 'Up to 4 members + invite link' },
            ].map((opt) => (
              <button key={opt.value} onClick={() => setType(opt.value as 'individual' | 'team')}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  type === opt.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-border hover:border-emerald-500/30 bg-black/10'}`}>
                <opt.icon className={`w-6 h-6 mb-2 ${type === opt.value ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                <p className={`font-black uppercase tracking-tight ${type === opt.value ? 'text-emerald-500' : 'text-foreground'}`}>{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {type && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Step 2 — Your Details</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{type === 'team' ? 'Team Name' : 'Full Name'}</label>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={type === 'team' ? 'e.g. Team Alpha' : 'e.g. Musa Kalisa'}
                    className="w-full px-4 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{type === 'team' ? 'Team Leader Email' : 'Your Email'}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                      className="w-full pl-11 pr-4 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">University / Organization</label>
                  <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. University of Rwanda"
                    className="w-full px-4 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                </div>
              </div>

              <AnimatePresence>
                {type === 'team' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Step 3 — Team Members (min 2, max 4)</p>
                    <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 flex items-start gap-2">
                      <Link2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">After registering, you will get a <span className="text-sky-400 font-bold">team invite link</span> to share with your members.</p>
                    </div>
                    {members.map((member, i) => (
                      <div key={i} className="flex gap-2">
                        <input type="text" value={member} onChange={(e) => updateMember(i, e.target.value)}
                          placeholder={`Member ${i + 1} full name`}
                          className="flex-1 px-4 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                        {members.length > 2 && (
                          <button onClick={() => removeMember(i)} className="p-3 rounded-xl border border-border hover:border-red-500/40 hover:text-red-400 text-muted-foreground transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {members.length < 4 && (
                      <button onClick={addMember} className="flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-400 transition-colors">
                        <Plus className="w-4 h-4" /> Add member
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button onClick={handleRegister} disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tight">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Registering...</> : <><CheckCircle className="w-5 h-5" /> Complete Registration</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}