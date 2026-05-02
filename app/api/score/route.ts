// app/api/score/route.ts

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CODE_MASTERY_COLUMNS = [
  'confidence',
  'model_name',
  'preprocessing_steps',
  'feature_count',
  'validation_strategy',
  'used_cross_validation',
  'handled_class_imbalance',
  'train_test_split_ratio',
]

interface GroundTruthRow {
  row_id: string
  true_label: string
  difficulty_tier: 'easy' | 'medium' | 'hard'
  adversarial: boolean
  column_weight: number
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

function send(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`))
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file          = form.get('file') as File
  const username      = (form.get('username') as string)?.trim()
  const modelName     = (form.get('modelName') as string)?.trim()
  const competitionId = form.get('competitionId') as string | null

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ── 1. Validate inputs ──────────────────────────────────────────
        if (!file || !username || !modelName) {
          send(controller, { message: 'Missing file, username, or model name.' })
          controller.close(); return
        }

        // ── 2. Check daily submission limit ─────────────────────────────
        if (competitionId) {
          const { data: comp } = await supabase
            .from('competitions')
            .select('max_submissions_per_day')
            .eq('id', competitionId)
            .single()

          if (comp?.max_submissions_per_day) {
            const today = new Date(); today.setHours(0, 0, 0, 0)
            const { count } = await supabase
              .from('submissions')
              .select('*', { count: 'exact', head: true })
              .eq('username', username)
              .eq('competition_id', competitionId)
              .gte('created_at', today.toISOString())

            if ((count ?? 0) >= comp.max_submissions_per_day) {
              send(controller, {
                message: `Daily submission limit reached (${comp.max_submissions_per_day}/day). Come back tomorrow.`
              })
              controller.close(); return
            }

            const remaining = comp.max_submissions_per_day - (count ?? 0) - 1
            send(controller, { step: `✓ Submission limit OK — ${remaining} more allowed today` })
          }
        }

        send(controller, { step: '✓ File received — parsing CSV...' })
        const csvText    = await file.text()
        const submission = parseCSV(csvText)

        if (submission.length === 0) {
          send(controller, { message: 'CSV is empty or has no data rows.' })
          controller.close(); return
        }

        const headers = Object.keys(submission[0])
        if (!headers.includes('row_id') || !headers.includes('predicted_label')) {
          send(controller, { message: 'CSV must have "row_id" and "predicted_label" columns.' })
          controller.close(); return
        }

        send(controller, { step: `✓ Parsed ${submission.length} rows` })

        // ── 3. Load ground truth ────────────────────────────────────────
        send(controller, { step: '✓ Loading ground truth from database...' })
        let gtQuery = supabase.from('ground_truth').select('*')
        if (competitionId) gtQuery = gtQuery.eq('competition_id', competitionId)

        const { data: groundTruth, error: gtError } = await gtQuery
        if (gtError || !groundTruth || groundTruth.length === 0) {
          send(controller, { message: 'Ground truth not found. Ask your lecturer to upload it.' })
          controller.close(); return
        }
        send(controller, { step: `✓ Ground truth loaded — ${groundTruth.length} rows` })

        // ── 4. Load competition config ──────────────────────────────────
        let compConfig = {
          maxScoreCap: 92.0,
          weightAccuracy: 0.45,
          weightF1: 0.30,
          weightCode: 0.25,
          adversarialBonus: 2.0,
          diffWeights: { easy: 1.0, medium: 1.5, hard: 2.0 },
        }
        if (competitionId) {
          const { data: comp } = await supabase
            .from('competitions')
            .select('max_score_cap,weight_accuracy,weight_f1,weight_code,adversarial_bonus,diff_weight_easy,diff_weight_medium,diff_weight_hard')
            .eq('id', competitionId)
            .single()
          if (comp) {
            compConfig = {
              maxScoreCap:      comp.max_score_cap      ?? compConfig.maxScoreCap,
              weightAccuracy:   comp.weight_accuracy    ?? compConfig.weightAccuracy,
              weightF1:         comp.weight_f1          ?? compConfig.weightF1,
              weightCode:       comp.weight_code        ?? compConfig.weightCode,
              adversarialBonus: comp.adversarial_bonus  ?? compConfig.adversarialBonus,
              diffWeights: {
                easy:   comp.diff_weight_easy   ?? 1.0,
                medium: comp.diff_weight_medium ?? 1.5,
                hard:   comp.diff_weight_hard   ?? 2.0,
              },
            }
          }
        }

        // ── 5. Build lookup maps ────────────────────────────────────────
        send(controller, { step: '✓ Matching predictions to ground truth...' })
        const gtMap = new Map<string, GroundTruthRow>()
        for (const row of groundTruth as GroundTruthRow[]) gtMap.set(row.row_id, row)

        const subMap = new Map<string, string>()
        for (const row of submission) subMap.set(row.row_id, row.predicted_label?.toLowerCase() ?? '')

        // ── 6. Score accuracy (weighted by difficulty) ──────────────────
        send(controller, { step: '✓ Calculating weighted accuracy...' })
        let totalWeight       = 0
        let earnedWeight      = 0
        let adversarialBonus  = 0
        const classActual:    string[] = []
        const classPredicted: string[] = []
        const feedback:       string[] = []
        const rowResults:     object[] = []

        for (const gt of groundTruth as GroundTruthRow[]) {
          const predicted = subMap.get(gt.row_id)
          const correct   = predicted === gt.true_label.toLowerCase()
          const w         = compConfig.diffWeights[gt.difficulty_tier] * gt.column_weight

          if (gt.adversarial) {
            if (correct) adversarialBonus += compConfig.adversarialBonus
          } else {
            totalWeight  += w
            if (correct) earnedWeight += w
          }

          if (predicted !== undefined) {
            classActual.push(gt.true_label.toLowerCase())
            classPredicted.push(predicted)
          } else {
            feedback.push(`Row ${gt.row_id}: missing — prediction not found`)
          }

          rowResults.push({ row_id: gt.row_id, correct, predicted: predicted ?? 'MISSING', true: gt.true_label })
        }

        const accuracyScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0
        send(controller, { step: `✓ Accuracy: ${accuracyScore.toFixed(1)}%` })

        // ── 7. Score F1 (macro-averaged) ────────────────────────────────
        send(controller, { step: '✓ Calculating macro F1 score...' })
        const classes     = [...new Set(classActual)]
        const perClassF1: Record<string, number> = {}

        for (const cls of classes) {
          const tp = classActual.filter((a, i) => a === cls && classPredicted[i] === cls).length
          const fp = classPredicted.filter((p, i) => p === cls && classActual[i] !== cls).length
          const fn = classActual.filter((a, i) => a === cls && classPredicted[i] !== cls).length
          const precision = tp + fp > 0 ? tp / (tp + fp) : 0
          const recall    = tp + fn > 0 ? tp / (tp + fn) : 0
          perClassF1[cls] = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0
        }

        const f1Score = classes.length > 0
          ? (Object.values(perClassF1).reduce((a, b) => a + b, 0) / classes.length) * 100
          : 0
        send(controller, { step: `✓ Macro F1: ${f1Score.toFixed(1)}%` })

        // ── 8. Score code mastery ────────────────────────────────────────
        send(controller, { step: '✓ Auditing code mastery columns...' })
        const presentCols  = CODE_MASTERY_COLUMNS.filter((c) => headers.includes(c))
        const missingCols  = CODE_MASTERY_COLUMNS.filter((c) => !headers.includes(c))
        const codeScore    = (presentCols.length / CODE_MASTERY_COLUMNS.length) * 100
        const columnAudit  = { present: presentCols, missing: missingCols }

        if (missingCols.length > 0) {
          feedback.push(`Code columns missing: ${missingCols.join(', ')} — add these to improve your code score`)
        }
        send(controller, { step: `✓ Code mastery: ${codeScore.toFixed(1)}% (${presentCols.length}/${CODE_MASTERY_COLUMNS.length} columns)` })

        // ── 9. Composite score + cap ─────────────────────────────────────
        send(controller, { step: '✓ Calculating final weighted score...' })
        const composite = (
          accuracyScore  * compConfig.weightAccuracy +
          f1Score        * compConfig.weightF1 +
          codeScore      * compConfig.weightCode
        ) + adversarialBonus

        const finalScore = Math.min(composite, compConfig.maxScoreCap)
        feedback.push(`Score capped at ${compConfig.maxScoreCap}% — by design, no one gets 100%.`)
        if (adversarialBonus > 0) feedback.push(`Adversarial bonus: +${adversarialBonus.toFixed(1)} pts`)
        send(controller, { step: `✓ Final score: ${finalScore.toFixed(1)}% (cap: ${compConfig.maxScoreCap}%)` })

        // ── 10. Lookup registration ──────────────────────────────────────
        const { data: registration } = await supabase
          .from('registrations')
          .select('id, group_id, team_name')
          .eq('display_name', username)
          .maybeSingle()

        // ── 11. Save submission ──────────────────────────────────────────
        send(controller, { step: '✓ Saving results to database...' })
        const { error: saveError } = await supabase.from('submissions').insert({
          competition_id:    competitionId,
          registration_id:   registration?.id ?? null,
          username,
          group_id:          registration?.group_id ?? null,
          accuracy_score:    Math.round(accuracyScore  * 10) / 10,
          f1_score:          Math.round(f1Score         * 10) / 10,
          code_score:        Math.round(codeScore       * 10) / 10,
          composite_raw:     Math.round(composite       * 10) / 10,
          final_score:       Math.round(finalScore      * 10) / 10,
          adversarial_bonus: adversarialBonus,
          model_name:        modelName,
          per_class_f1:      perClassF1,
          column_audit:      columnAudit,
          feedback,
          row_results:       rowResults,
        })

        if (saveError) {
          feedback.push(`Warning: score calculated but failed to save — ${saveError.message}`)
          send(controller, { step: `❌ SAVE ERROR: ${saveError.message}` })
      } else {
          send(controller, { step: '✓ Saved to database successfully' })
    }
        
        

        send(controller, { step: '✓ Complete! Results on leaderboard.' })

        // ── 12. Return final result ──────────────────────────────────────
        send(controller, {
          finalScore:  Math.round(finalScore    * 10) / 10,
          accuracy:    Math.round(accuracyScore * 10) / 10,
          f1:          Math.round(f1Score       * 10) / 10,
          codeScore:   Math.round(codeScore     * 10) / 10,
          username,
          modelName,
          feedback,
        })

      } catch (err: any) {
        send(controller, { message: `Scorer error: ${err.message}` })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}