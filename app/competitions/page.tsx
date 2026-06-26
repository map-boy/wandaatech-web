'use client'
// app/competitions/page.tsx

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { LogOut } from 'lucide-react'
import ChallengesTab from './ChallengesTab'
import RegisterTab from './RegisterTab'
import LeaderboardTab from './LeaderboardTab'
import LoginTab from './LoginTab'

type Tab = 'challenges' | 'register' | 'leaderboard' | 'login'

function CompetitionsInner() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>('challenges')
  const [isRegistered, setIsRegistered] = useState(false)
  const [registeredName, setRegisteredName] = useState('')
  const [activeCompId, setActiveCompId] = useState<string | null>(null)

  useEffect(() => {
    const name = localStorage.getItem('vaf_name') || ''
    if (name) { setIsRegistered(true); setRegisteredName(name) }
    const t = searchParams.get('tab') as Tab
    if (t && ['challenges', 'register', 'leaderboard', 'login'].includes(t)) setTab(t)
  }, [searchParams])

  function handleRegistered(name: string) {
    setIsRegistered(true)
    setRegisteredName(name)
    setTab('leaderboard')
  }

  function handleLoggedIn(name: string) {
    setIsRegistered(true)
    setRegisteredName(name)
    setTab('leaderboard')
  }

  function handleGoRegister(compId?: string) {
    if (compId) setActiveCompId(compId)
    setTab('register')
  }

  function handleGoLogin() {
    setTab('login')
  }

  function handleLogout() {
    localStorage.removeItem('vaf_token')
    localStorage.removeItem('vaf_name')
    localStorage.removeItem('vaf_type')
    localStorage.removeItem('vaf_team')
    localStorage.removeItem('vaf_team_token')
    setIsRegistered(false)
    setRegisteredName('')
    setTab('login')
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'challenges',  label: 'Challenges'  },
    { id: isRegistered ? 'leaderboard' : 'register', label: isRegistered ? 'Leaderboard' : 'Register' },
    { id: 'login',       label: isRegistered ? '' : 'Login' },
  ].filter((t) => t.label !== '')

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex gap-1 p-1 rounded-2xl bg-white/5 dark:bg-slate-900/40 border border-border/60 w-fit">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  tab === t.id
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {isRegistered && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-red-400 border border-border/60 hover:border-red-500/30 transition-all"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" /> Log out
            </button>
          )}
        </div>

        {tab === 'challenges'  && <ChallengesTab  isRegistered={isRegistered} registeredName={registeredName} onGoRegister={handleGoRegister} />}
        {tab === 'register'    && <RegisterTab    onRegistered={handleRegistered} onGoLogin={handleGoLogin} competitionId={activeCompId} />}
        {tab === 'login'       && <LoginTab       onLoggedIn={handleLoggedIn} onGoRegister={() => setTab('register')} />}
        {tab === 'leaderboard' && <LeaderboardTab isRegistered={isRegistered} />}
      </main>
    </div>
  )
}

export default function CompetitionsPage() {
  return (
    <Suspense>
      <CompetitionsInner />
    </Suspense>
  )
}