'use client'

import { useState } from 'react'
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react'

interface ContactProps {
  title?: string
  subtitle?: string
  email?: string
}

/**
 * Contact form. Posts to /api/contact, which stores the message so it can be
 * read in the admin panel — the previous version only wrote to the console.
 */
export function Contact({
  title = 'Get in Touch',
  subtitle = 'Questions, partnerships, or press — we read everything that comes in.',
  email = 'support@wandaatech.rw',
}: ContactProps) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setErrorMessage(data?.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '', website: '' })
    } catch {
      setErrorMessage('We could not reach the server. Check your connection and try again.')
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="border-b border-border bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="space-y-3 text-center">
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl">{title}</h2>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">{subtitle}</p>
          </div>

          {status === 'sent' ? (
            <div className="skeuo-card flex flex-col items-center gap-3 p-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-lg font-bold text-foreground">Message received</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Thanks for writing. We read every message and usually reply within two business days.
              </p>
              <button onClick={() => setStatus('idle')} className="skeuo-button mt-2 px-5 py-2 text-sm font-bold">
                <span className="skeuo-glow-text">Send another</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="skeuo-card space-y-5 p-6 sm:p-8">
              {/* Honeypot — hidden from people, tempting to bots. */}
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={update('website')}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" required>
                  <input
                    required
                    value={form.name}
                    onChange={update('name')}
                    placeholder="Jane Uwase"
                    className="skeuo-inset w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                  />
                </Field>

                <Field label="Email address" required>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@example.com"
                    className="skeuo-inset w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                  />
                </Field>
              </div>

              <Field label="Subject">
                <input
                  value={form.subject}
                  onChange={update('subject')}
                  placeholder="Partnership, press, or a question"
                  className="skeuo-inset w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </Field>

              <Field label="Message" required>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={update('message')}
                  placeholder="Tell us what you need."
                  className="skeuo-inset w-full resize-y bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </Field>

              {status === 'error' && (
                <p className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMessage}
                </p>
              )}

              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-xs text-muted-foreground">
                  Prefer email? Write to{' '}
                  <a href={`mailto:${email}`} className="skeuo-glow-text underline">
                    {email}
                  </a>
                </p>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="skeuo-button flex items-center gap-2 px-7 py-3 text-sm font-bold disabled:opacity-50"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span className="skeuo-glow-text">Send message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-emerald-500">*</span>}
      </span>
      {children}
    </label>
  )
}
