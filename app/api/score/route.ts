// app/api/score/route.ts
// ============================================================
// VAF UBWENGE TECH -- Streaming ML Scoring API
// Now supports per-competition leaderboard + truth files
// Truth file path: ml-assets/truth_{competition_id}.json
// ============================================================

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function encode(text: string) {
  return new TextEncoder().encode(text)
}

function sendProgress(controller: ReadableStreamDefaultController, step: string) {
  const safe = step.replace(/[^\x20-\x7E]/g, '').replace(/"/g, "'")
  controller.enqueue(encode(`event: progress\ndata: {"step":"${safe}"}\n\n`))
}

function parseCSV(text: string): string[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return []

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const predIdx = header.indexOf('prediction')

  if (predIdx !== -1) {
    return lines
      .slice(1)
      .map((line) => line.split(',')[predIdx]?.trim() || '')
      .filter(Boolean)
  }

  return lines
    .filter((line) => line !== 'prediction')
    .map((line) => line.split(',')[0]?.trim() || '')
    .filter(Boolean)
}

function calculateMetrics(predictions: string[], truth: string[]) {
  const total = Math.min(predictions.length, truth.length)
  let correct = 0, truePositive = 0, falsePositive = 0, falseNegative = 0

  for (let i = 0; i < total; i++) {
    const pred   = predictions[i].toLowerCase().trim()
    const actual = truth[i].toLowerCase().trim()

    if (pred === actual) {
      correct++
      if (actual === '1' || actual === 'true' || actual === 'positive') truePositive++
    } else {
      if (pred === '1' || pred === 'true' || pred === 'positive') falsePositive++
      else falseNegative++
    }
  }

  const accuracy  = parseFloat(((correct / total) * 100).toFixed(2))
  const precision = truePositive + falsePositive > 0
    ? parseFloat(((truePositive / (truePositive + falsePositive)) * 100).toFixed(2)) : 0
  const recall    = truePositive + falseNegative > 0
    ? parseFloat(((truePositive / (truePositive + falseNegative)) * 100).toFixed(2)) : 0
  const f1        = precision + recall > 0
    ? parseFloat(((2 * precision * recall) / (precision + recall)).toFixed(2)) : 0

  return { accuracy, precision, recall, f1 }
}

export async function POST(req: NextRequest) {
  const formData      = await req.formData()
  const file          = formData.get('file') as File
  const username      = formData.get('username') as string
  const modelName     = formData.get('modelName') as string
  const competitionId = formData.get('competitionId') as string | null

  if (!file || !username || !modelName) {
    return new Response('Missing file, username or modelName', { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {

        sendProgress(controller, 'Scanning your CSV file...')
        await new Promise((r) => setTimeout(r, 600))

        const csvText     = await file.text()
        const predictions = parseCSV(csvText)

        if (predictions.length === 0) {
          controller.enqueue(encode('event: error\ndata: {"message":"CSV file is empty or has no prediction column."}\n\n'))
          controller.close()
          return
        }

        sendProgress(controller, `Found ${predictions.length} predictions. Loading truth file...`)
        await new Promise((r) => setTimeout(r, 600))

        const truthPath = competitionId
          ? `truth_${competitionId}.json`
          : 'master_truth.json'

        const { data: truthData, error: truthError } = await supabase
          .storage
          .from('ml-assets')
          .download(truthPath)

        if (truthError || !truthData) {
          const msg = competitionId
            ? `No truth file found. Admin must upload truth_${competitionId}.json to ml-assets.`
            : 'Could not load master truth file from storage.'
          controller.enqueue(encode(`event: error\ndata: {"message":"${msg}"}\n\n`))
          controller.close()
          return
        }

        const truthText = await truthData.text()
        const truthJson = JSON.parse(truthText)
        const truth: string[] = truthJson.labels || truthJson.predictions || truthJson

        sendProgress(controller, 'Calculating Accuracy...')
        await new Promise((r) => setTimeout(r, 700))

        const { accuracy, precision, recall, f1 } = calculateMetrics(predictions, truth)

        sendProgress(controller, `Accuracy: ${accuracy}%`)
        await new Promise((r) => setTimeout(r, 500))
        sendProgress(controller, `F1 Score: ${f1}%`)
        await new Promise((r) => setTimeout(r, 500))
        sendProgress(controller, `Precision: ${precision}% | Recall: ${recall}%`)
        await new Promise((r) => setTimeout(r, 500))
        sendProgress(controller, 'Saving to leaderboard...')
        await new Promise((r) => setTimeout(r, 400))

        const insertPayload: any = {
          username,
          model_name: modelName,
          accuracy,
          f1_score:   f1,
          precision,
          recall,
        }
        if (competitionId) insertPayload.competition_id = competitionId

        const { error: insertError } = await supabase
          .from('leaderboard')
          .insert(insertPayload)

        if (insertError) {
          controller.enqueue(encode(`event: error\ndata: {"message":"Failed to save score: ${insertError.message}"}\n\n`))
          controller.close()
          return
        }

        await supabase.from('live_feed').insert({
          username,
          score:   accuracy,
          message: `${username} scored ${accuracy}% with ${modelName}!`,
        })

        controller.enqueue(encode(
          `event: result\ndata: ${JSON.stringify({ accuracy, f1, precision, recall, username, modelName, competitionId })}\n\n`
        ))

        controller.close()

      } catch (err: any) {
        const safeMsg = (err.message || 'Unknown error').replace(/"/g, "'").replace(/[^\x20-\x7E]/g, '')
        controller.enqueue(encode(`event: error\ndata: {"message":"${safeMsg}"}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}