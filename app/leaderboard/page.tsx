import { redirect } from 'next/navigation'

export default function LeaderboardRedirect() {
  redirect('/competitions?tab=leaderboard')
}