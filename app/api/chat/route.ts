// app/api/chat/route.ts
// ──────────────────────────────────────────────────────────────
// VAF UBWENGE TECH — AI Chatbot using HuggingFace Inference API
//
// Add these to your .env.local:
//   HF_TOKEN=hf_xxxxxxxxxxxxxxxx
//   HF_MODEL=openai/gpt-oss-120b:cerebras     ← fast public model
//   or
//   HF_MODEL=umwe/wandaa-v02-merged            ← your own WANDAA model
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are the official AI assistant for VAF Ubwenge TECH, a student-led tech startup based in Kigali, Rwanda. Your name is "VAF AI".

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

const HF_API = 'https://api-inference.huggingface.co/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const token = process.env.HF_TOKEN
    const model = process.env.HF_MODEL

    if (!token || !model) {
      return NextResponse.json(
        { error: 'HF_TOKEN or HF_MODEL not set in .env.local' },
        { status: 500 }
      )
    }

    const hfRes = await fetch(HF_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 512,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!hfRes.ok) {
      const err = await hfRes.text()
      console.error('HF API error:', err)
      return NextResponse.json({ error: 'AI service error', detail: err }, { status: 502 })
    }

    const data = await hfRes.json()
    return NextResponse.json(data)

  } catch (err: any) {
    console.error('Chat route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}