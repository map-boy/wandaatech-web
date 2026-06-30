'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN as string
const HF_MODEL = process.env.NEXT_PUBLIC_HF_MODEL || 'openai/gpt-oss-120b:cerebras'
const HF_URL   = 'https://router.huggingface.co/v1/chat/completions'

const SYSTEM_PROMPT = `You are the official AI assistant for VAF Ubwenge TECH, a student-led tech startup based in Kigali, Rwanda. Your name is "WANDAA".

About VAF Ubwenge TECH:
- Builds websites, mobile apps, desktop applications, and AI-powered tools
- Core projects:
  • Easy GO — logistics/delivery app with ML price prediction and GPS tracking, integrated with Mobile Money (MoMo)
  • Intelligence Lab — AI research division for machine learning, computer vision, and NLP
  • WANDAA — a Kinyarwanda language model (LLM) trained for African language AI; currently at version 0.07
  • QR Engine — a QR code generator tool
  • ML Leaderboard — platform where students submit ML predictions and compete
- Contact: support@wandaatech.rw  |  Location: Kigali, Rwanda

Rules:
- Be friendly, enthusiastic, and concise (under 150 words unless detail is needed)
- Respond in the same language the user writes in (English, French, or Kinyarwanda)
- For unknown questions, suggest contacting support@wandaatech.rw`

const WELCOME = "Hi! I'm WANDAA, your AI assistant. Ask me anything about our projects, team, competitions, or services! 🚀"

export function AIChatbot() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const bottomRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    setError('')
    const userMsg: Message = { role: 'user', content }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(HF_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HF_TOKEN}`,
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...updated,
          ],
          max_tokens: 512,
          temperature: 0.7,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message || `Error ${res.status}`)
      }

      const data = await res.json()
      const reply =
        data.choices?.[0]?.message?.content?.trim() ??
        "Sorry, I couldn't get a response. Please try again."

      setMessages([...updated, { role: 'assistant', content: reply }])
    } catch (err: any) {
      if (err instanceof TypeError) {
        setError('⚠️ Cannot reach the server. Check your internet connection.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] skeuo-card flex flex-col overflow-hidden"
            style={{ height: '480px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 shrink-0">
              <div className="w-9 h-9 rounded-xl skeuo-button flex items-center justify-center">
                <Bot className="w-5 h-5 skeuo-glow-text" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground uppercase tracking-tight">WANDAA</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--skeuo-accent))] animate-pulse" />
                  <span className="text-[10px] skeuo-glow-text font-mono font-bold uppercase tracking-widest">Online</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto p-1.5 rounded-xl skeuo-button text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

              {/* Welcome */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg skeuo-button flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 skeuo-glow-text" />
                </div>
                <div className="skeuo-inset rounded-tl-sm px-4 py-3 max-w-[85%]">
                  <p className="text-sm text-foreground leading-relaxed">{WELCOME}</p>
                </div>
              </div>

              {/* Conversation */}
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-lg skeuo-button flex items-center justify-center shrink-0 mt-0.5">
                    {msg.role === 'user'
                      ? <User className="w-3.5 h-3.5 text-foreground" />
                      : <Bot className="w-3.5 h-3.5 skeuo-glow-text" />
                    }
                  </div>
                  <div className={`px-4 py-3 max-w-[85%] text-sm leading-relaxed rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[hsl(var(--skeuo-accent))] text-black rounded-tr-sm font-medium'
                      : 'skeuo-inset text-foreground rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Loading dots */}
              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg skeuo-button flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 skeuo-glow-text" />
                  </div>
                  <div className="skeuo-inset rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-[hsl(var(--skeuo-accent))] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[hsl(var(--skeuo-accent))] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[hsl(var(--skeuo-accent))] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
                  {error}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-4 border-t border-border/40 shrink-0">
              <div className="flex items-center gap-2 skeuo-inset px-4 py-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask WANDAA anything..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl skeuo-button disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                >
                  {loading
                    ? <Loader2 className="w-3.5 h-3.5 skeuo-glow-text animate-spin" />
                    : <Send className="w-3.5 h-3.5 skeuo-glow-text" />
                  }
                </button>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/40 font-mono mt-2">
                Powered by VAF Intelligence Lab
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Button ── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full skeuo-button flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6 skeuo-glow-text" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="w-6 h-6 skeuo-glow-text" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}