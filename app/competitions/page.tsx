'use client'
// app/competitions/page.tsx

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import ChallengesTab from './ChallengesTab'
import RegisterTab from './RegisterTab'
import LeaderboardTab from './LeaderboardTab'

type Tab = 'challenges' | 'register' | 'leaderboard'

export default function CompetitionsPage() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>('challenges')
  const [isRegistered, setIsRegistered] = useState(false)
  const [registeredName, setRegisteredName] = useState('')

  useEffect(() => {
    const name = localStorage.getItem('vaf_name') || ''
    if (name) { setIsRegistered(true); setRegisteredName(name) }
    const t = searchParams.get('tab') as Tab
    if (t && ['challenges', 'register', 'leaderboard'].includes(t)) setTab(t)
  }, [searchParams])

  function handleRegistered(name: string) {
    localStorage.setItem('vaf_name', name)
    setIsRegistered(true)
    setRegisteredName(name)
    setTab('leaderboard')
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'challenges',  label: 'Challenges'  },
    { id: 'register',    label: 'Register'    },
    { id: 'leaderboard', label: 'Leaderboard' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-1 p-1 rounded-2xl bg-white/5 dark:bg-slate-900/40 border border-border/60 w-fit mx-auto mb-10">
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

        {tab === 'challenges'  && <ChallengesTab  isRegistered={isRegistered} registeredName={registeredName} onGoRegister={() => setTab('register')} />}
        {tab === 'register'    && <RegisterTab    onRegistered={handleRegistered} />}
        {tab === 'leaderboard' && <LeaderboardTab isRegistered={isRegistered} />}
      </main>
    </div>
  )
}