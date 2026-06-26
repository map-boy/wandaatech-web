'use client'

// app/competitions/LoginTab.tsx

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, AlertCircle, Loader2, CheckCircle } from 'lucide-react'

export default function LoginTab({ onLoggedIn, onGoRegister }: {
  onLoggedIn: (name: string) => void
  onGoRegister: () => void
}) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin() {
    setError('')
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email.'); return }
    if (!password)                              { setError('Please enter your password.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed.')
        setLoading(false)
        return
      }

      localStorage.setItem('vaf_token', data.token)
      localStorage.setItem('vaf_name', data.displayName)
      localStorage.setItem('vaf_type', data.type)
      if (data.type === 'team' && data.teamName)  localStorage.setItem('vaf_team', data.teamName)
      if (data.type === 'team' && data.teamToken) localStorage.setItem('vaf_team_token', data.teamToken)

      onLoggedIn(data.displayName)
    } catch (e: any) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <motion.div className="rounded-3xl border border-emerald-500/20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl p-8 shadow-2xl space-y-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center space-y-1">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6 text-emerald-500" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Welcome Back</h2>
          <p className="text-xs text-muted-foreground">Log in with the email and password you registered with.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="your@email.com"
                className="w-full pl-11 pr-4 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-black/20 dark:bg-black/40 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-tight">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Logging in...</> : <><CheckCircle className="w-5 h-5" /> Log In</>}
        </button>

        <p className="text-xs text-center text-muted-foreground">
          Not registered yet?{' '}
          <button onClick={onGoRegister} className="text-emerald-500 font-bold hover:underline">
            Create an account
          </button>
        </p>
      </motion.div>
    </div>
  )
}