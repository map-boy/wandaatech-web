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
      <motion.div className="skeuo-card bg-neutral-950 border border-neutral-900 rounded-3xl p-8 space-y-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center space-y-1">
          <div className="skeuo-inset w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6 text-[hsl(var(--skeuo-accent))]" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-neutral-100">Welcome Back</h2>
          <p className="text-xs text-neutral-500">Log in with the email and password you registered with.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="your@email.com"
                className="skeuo-inset w-full pl-11 pr-4 py-3 bg-black/60 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="skeuo-inset w-full pl-11 pr-4 py-3 bg-black/60 border border-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="skeuo-inset flex items-center gap-2 p-3 rounded-xl border border-red-900/40">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          className="skeuo-button w-full py-4 bg-[hsl(var(--skeuo-accent))] disabled:opacity-40 text-black font-black rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-tight cursor-pointer">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Logging in...</> : <><CheckCircle className="w-5 h-5" /> Log In</>}
        </button>

        <p className="text-xs text-center text-neutral-500">
          Not registered yet?{' '}
          <button onClick={onGoRegister} className="text-[hsl(var(--skeuo-accent))] font-bold hover:underline cursor-pointer">
            Create an account
          </button>
        </p>
      </motion.div>
    </div>
  )
}