'use client'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

export default function SmartMotosSupportPage() {
  return (
    <main className="min-h-screen py-12 bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-500 transition-colors mb-8 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold mb-6">SmartMotos Support</h1>
        <p className="mb-4">Need help with the SmartMotos app? We're here for you.</p>
        <p className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <a href="mailto:techubwenge@gmail.com" className="text-emerald-500 hover:underline">techubwenge@gmail.com</a>
        </p>
        <p className="mt-8 text-sm text-muted-foreground">
          For account, payment, ride, or delivery issues, email us and we'll respond as soon as possible.
        </p>
      </div>
    </main>
  )
}
