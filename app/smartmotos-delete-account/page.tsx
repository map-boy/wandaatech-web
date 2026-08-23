'use client'
import { Trash2, Clock, Mail, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SmartMotosDeleteAccountPage() {
  return (
    <main className="min-h-screen py-12 bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-500 transition-colors mb-8 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12 border-b border-border pb-8">
          <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit">
            <Trash2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Delete Your SmartMotos Account</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4" />
              <span>Last Updated: August 23, 2026</span>
            </p>
          </div>
        </div>

        <div className="prose prose-emerald dark:prose-invert max-w-none space-y-12">
          <section>
            <p>
              SmartMotos (developed by VAF UBWENGE TECH) lets you request deletion of your account
              and associated data at any time. Follow the steps below.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Mail className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">How to Request Deletion</h2>
            </div>
            <ol className="space-y-2">
              <li>Send an email to <a href="mailto:techubwenge@gmail.com" className="text-emerald-500 hover:underline">techubwenge@gmail.com</a> from the email address linked to your SmartMotos account.</li>
              <li>Use the subject line: <strong>&quot;Delete My SmartMotos Account&quot;</strong>.</li>
              <li>Include the phone number registered on your account so we can verify your identity.</li>
              <li>We will confirm your request by email and process deletion within 7 business days.</li>
            </ol>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <AlertCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-semibold m-0">What Gets Deleted</h2>
            </div>
            <ul className="space-y-2">
              <li><strong>Deleted:</strong> your name, email, phone number, profile data, saved locations, and device/notification tokens.</li>
              <li><strong>Retained (as required by law or for fraud prevention):</strong> completed trip records and payment transaction history, kept for up to 5 years for financial and tax record-keeping, after which they are permanently deleted or anonymized.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Questions</h2>
            <p>
              Contact us at{' '}
              <a href="mailto:techubwenge@gmail.com" className="text-emerald-500 hover:underline">
                techubwenge@gmail.com
              </a>{' '}
              for any questions about this process.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
