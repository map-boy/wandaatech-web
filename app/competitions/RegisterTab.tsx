'use client'

// app/competitions/RegisterTab.tsx

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, User, Mail, Lock, Plus, X,
  CheckCircle, AlertCircle, Loader2, Copy, Link2
} from 'lucide-react'

export default function RegisterTab({ onRegistered, onGoLogin, competitionId }: {
  onRegistered: (name: string) => void
  onGoLogin?: () => void
  competitionId?: string | null
}) {
  const [type, setType]               = useState<'individual' | 'team' | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [university, setUniversity]   = useState('')
  const [members, setMembers]         = useState<string[]>(['', ''])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState(false)
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
    if (!password || password.length < 8)      { setError('Password must be at least 8 characters.'); return }
    if (password !== confirmPassword)          { setError('Passwords do not match.'); return }
    if (!university.trim())                    { setError('Please enter your university or organization.'); return }
    if (type === 'team') {
      const filled = members.filter((m) => m.trim().length > 0)
      if (filled.length < 2)                   { setError('A team must have at least 2 members.'); return }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          displayName: displayName.trim(),
          email: email.trim(),
          password,
          university: university.trim(),
          members: type === 'team' ? members.filter((m) => m.trim().length > 0) : [],
          competitionId: competitionId || null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed.')
        setLoading(false)
        return
      }

      localStorage.setItem('vaf_token', data.token)
      localStorage.setItem('vaf_name', data.displayName)
      localStorage.setItem('vaf_type', data.type)
      if (type === 'team') {
        localStorage.setItem('vaf_team', data.teamName)
        localStorage.setItem('vaf_team_token', data.teamToken)
      }

      setTeamToken(data.teamToken || '')
      setSuccess(true)
      onRegistered(data.displayName)
    } catch (e: any) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (alreadyRegistered && !success) {
    const storedTeamToken = typeof window !== 'undefined' ? localStorage.getItem('vaf_team_token') || '' : ''
    return (
      <div className="max-w-lg mx-auto space-y-6 py-10">
        <div className="skeuo-card bg-neutral-950 border border-neutral-900 rounded-3xl p-8 text-center space-y-4">
          <div className="skeuo-inset w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-[hsl(var(--skeuo-accent))]" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-100">Already Registered</h2>
            <p className="text-neutral-500 text-sm mt-1">
              Welcome back, <span className="text-[hsl(var(--skeuo-accent))] font-bold">{alreadyName}</span>.
              {alreadyTeam && <> You are on team <span className="text-[hsl(var(--skeuo-accent))] font-bold">{alreadyTeam}</span>.</>}
            </p>
          </div>
          {alreadyType === 'team' && storedTeamToken && (
            <div className="skeuo-inset text-left space-y-2 p-4 rounded-2xl border border-neutral-900">
              <p className="text-xs font-black text-[hsl(var(--skeuo-accent))] uppercase tracking-widest flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5" /> Your Team Invite Link
              </p>
              <p className="text-xs font-mono text-neutral-500 break-all">
                {typeof window !== 'undefined' ? getInviteLink(storedTeamToken) : ''}
              </p>
              <button onClick={() => copyInviteLink(storedTeamToken)}
                className="flex items-center gap-2 text-xs text-[hsl(var(--skeuo-accent))] hover:opacity-80 transition-colors font-bold cursor-pointer">
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <p className="text-[10px] text-neutral-600">Share with your team members so they can join.</p>
            </div>
          )}
          <p className="text-xs text-neutral-500">
            Using a different device?{' '}
            <button onClick={onGoLogin} className="text-[hsl(var(--skeuo-accent))] hover:underline cursor-pointer">
              Log in instead
            </button>
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="skeuo-card bg-neutral-950 border border-neutral-900 max-w-lg mx-auto rounded-3xl p-10 text-center space-y-6">
        <div className="skeuo-inset w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-[hsl(var(--skeuo-accent))]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-100">Registration Complete!</h2>
          <p className="text-neutral-500">Welcome, <span className="text-[hsl(var(--skeuo-accent))] font-bold">{displayName}</span>. You now have full access.</p>
        </div>
        {type === 'team' && teamToken && (
          <div className="skeuo-inset text-left p-4 rounded-2xl border border-neutral-900 space-y-3">
            <p className="text-xs font-black text-[hsl(var(--skeuo-accent))] uppercase tracking-widest flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5" /> Team Invite Link
            </p>
            <p className="text-xs font-mono text-neutral-500 break-all">{getInviteLink(teamToken)}</p>
            <button onClick={() => copyInviteLink(teamToken)}
              className="skeuo-button flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--skeuo-accent))] text-black text-xs font-black transition-all cursor-pointer">
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy Invite Link'}
            </button>
            <p className="text-[10px] text-neutral-600">Share this with your team. They click it, enter their name, and join.</p>
          </div>
        )}
        <div className="skeuo-inset p-4 rounded-2xl border border-neutral-900 text-left space-y-2">
          <p className="text-xs font-bold text-[hsl(var(--skeuo-accent))] uppercase tracking-widest">You're Logged In</p>
          <p className="text-xs text-neutral-500">Use your email and password to log in from any device.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div className="skeuo-card bg-neutral-950 border border-neutral-900 rounded-3xl p-8 space-y-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="space-y-3">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Step 1 — Who are you registering as?</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'individual', label: 'Individual', icon: User,  desc: 'Competing alone' },
              { value: 'team',       label: 'Team',       icon: Users, desc: 'Up to 4 members + invite link' },
            ].map((opt) => (
              <button key={opt.value} onClick={() => setType(opt.value as 'individual' | 'team')}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  type === opt.value ? 'skeuo-inset border-[hsl(var(--skeuo-accent))]/40' : 'skeuo-card border-neutral-900'}`}>
                <opt.icon className={`w-6 h-6 mb-2 ${type === opt.value ? 'text-[hsl(var(--skeuo-accent))]' : 'text-neutral-500'}`} />
                <p className={`font-black uppercase tracking-tight ${type === opt.value ? 'text-[hsl(var(--skeuo-accent))]' : 'text-neutral-200'}`}>{opt.label}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {type && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Step 2 — Your Details</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">{type === 'team' ? 'Team Name' : 'Full Name'}</label>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={type === 'team' ? 'e.g. Team Alpha' : 'e.g. Musa Kalisa'}
                    className="skeuo-inset w-full px-4 py-3 bg-black/60 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">{type === 'team' ? 'Team Leader Email' : 'Your Email'}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                      className="skeuo-inset w-full pl-11 pr-4 py-3 bg-black/60 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-400">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="skeuo-inset w-full pl-11 pr-4 py-3 bg-black/60 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-400">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="skeuo-inset w-full pl-11 pr-4 py-3 bg-black/60 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">University / Organization</label>
                  <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. University of Rwanda"
                    className="skeuo-inset w-full px-4 py-3 bg-black/60 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none" />
                </div>
              </div>

              <AnimatePresence>
                {type === 'team' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Step 3 — Team Members (min 2, max 4)</p>
                    <div className="skeuo-inset p-3 rounded-xl border border-neutral-900 flex items-start gap-2">
                      <Link2 className="w-4 h-4 text-[hsl(var(--skeuo-accent))] shrink-0 mt-0.5" />
                      <p className="text-xs text-neutral-500">After registering, you will get a <span className="text-[hsl(var(--skeuo-accent))] font-bold">team invite link</span> to share with your members.</p>
                    </div>
                    {members.map((member, i) => (
                      <div key={i} className="flex gap-2">
                        <input type="text" value={member} onChange={(e) => updateMember(i, e.target.value)}
                          placeholder={`Member ${i + 1} full name`}
                          className="skeuo-inset flex-1 px-4 py-3 bg-black/60 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none" />
                        {members.length > 2 && (
                          <button onClick={() => removeMember(i)} className="skeuo-button p-3 rounded-xl text-neutral-500 hover:text-red-400 transition-all cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {members.length < 4 && (
                      <button onClick={addMember} className="flex items-center gap-2 text-sm text-[hsl(var(--skeuo-accent))] hover:opacity-80 transition-colors cursor-pointer">
                        <Plus className="w-4 h-4" /> Add member
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="skeuo-inset flex items-center gap-2 p-3 rounded-xl border border-red-900/40">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button onClick={handleRegister} disabled={loading}
                className="skeuo-button w-full py-4 bg-[hsl(var(--skeuo-accent))] disabled:opacity-40 text-black font-black rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-tight cursor-pointer">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Registering...</> : <><CheckCircle className="w-5 h-5" /> Complete Registration</>}
              </button>

              {onGoLogin && (
                <p className="text-xs text-center text-neutral-500">
                  Already registered?{' '}
                  <button onClick={onGoLogin} className="text-[hsl(var(--skeuo-accent))] font-bold hover:underline cursor-pointer">Log in instead</button>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}