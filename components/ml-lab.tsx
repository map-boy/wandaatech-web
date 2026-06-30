'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ML_MODELS } from '@/lib/constants/ml-models'
import { predictModel } from '@/lib/ml-service'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Play, CheckCircle, AlertCircle, Loader2, Cpu, Zap, Activity } from 'lucide-react'

export function MLLab() {
  const [userInput, setUserInput] = useState('')
  const [prediction, setPrediction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRunModel = async (modelId: string) => {
    setLoading(true)
    setPrediction(null)
    setError(null)
    try {
      const result = await predictModel(modelId, userInput)
      setPrediction(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="ml-lab" className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-[2px] w-8 skeuo-glow-text bg-current" />
              <span className="skeuo-glow-text font-mono text-sm tracking-widest uppercase">Neural Network Interface</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter">
              Intelligence <span className="skeuo-glow-text">Lab</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-muted-foreground max-w-md text-sm md:text-base skeuo-inset py-3 px-5"
          >
            Deploying high-performance machine learning models for real-time data analysis and predictive insights.
          </motion.p>
        </div>

        <Tabs defaultValue={ML_MODELS[0].id} className="space-y-8" onValueChange={() => {
          setPrediction(null)
          setError(null)
          setUserInput('')
        }}>

          <TabsList className="inline-flex h-auto p-1 skeuo-inset gap-1">
            {ML_MODELS.map((model) => (
              <TabsTrigger
                key={model.id}
                value={model.id}
                className="px-6 py-2.5 rounded-xl data-[state=active]:skeuo-button font-bold transition-all text-sm"
              >
                {model.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {ML_MODELS.map((model) => (
            <TabsContent key={model.id} value={model.id} className="outline-none">
              <div className="grid lg:grid-cols-5 gap-8">

                {/* Input Section (3/5 columns) */}
                <motion.div
                  className="lg:col-span-3 group relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="skeuo-card p-8 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Activity className="skeuo-glow-text w-5 h-5" />
                        <h3 className="text-xl font-bold text-foreground uppercase">Data Entry</h3>
                      </div>
                      <Badge className="skeuo-inset skeuo-glow-text">
                        {model.category}
                      </Badge>
                    </div>

                    <Textarea
                      placeholder={model.placeholder}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="skeuo-inset min-h-[220px] font-mono skeuo-glow-text placeholder:text-muted-foreground/50 text-base mb-6"
                    />

                    <button
                      onClick={() => handleRunModel(model.id)}
                      className="skeuo-button w-full h-14 font-black text-lg uppercase tracking-tighter"
                      disabled={loading || !userInput}
                    >
                      <span className="relative z-10 flex items-center justify-center skeuo-glow-text">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2 h-5 w-5 fill-current" />}
                        Process Intelligence
                      </span>
                    </button>
                  </div>
                </motion.div>

                {/* Result Section (2/5 columns) */}
                <motion.div
                  className="lg:col-span-2 space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="skeuo-card p-8 flex flex-col items-center justify-center min-h-[300px] text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                      <Cpu className="w-8 h-8 skeuo-glow-text opacity-30 group-hover:opacity-60 transition-opacity" />
                    </div>

                    <AnimatePresence mode="wait">
                      {!prediction && !loading && (
                        <motion.div key="idle" exit={{ opacity: 0 }} className="space-y-4">
                          <div className="skeuo-inset w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <div className="w-2 h-2 rounded-full skeuo-glow-text bg-current animate-ping" />
                          </div>
                          <p className="skeuo-glow-text font-mono text-xs uppercase tracking-widest opacity-60">System Ready...</p>
                        </motion.div>
                      )}

                      {loading && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <Loader2 className="w-12 h-12 skeuo-glow-text animate-spin mx-auto" />
                          <p className="text-foreground font-bold uppercase animate-pulse">Analyzing Data</p>
                        </motion.div>
                      )}

                      {prediction && (
                        <motion.div
                          key="result"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="space-y-4 w-full"
                        >
                          <div className="inline-flex items-center justify-center px-4 py-1 skeuo-inset skeuo-glow-text text-[10px] font-bold uppercase tracking-widest mb-2">
                            Inference Complete
                          </div>
                          <h4 className="text-6xl font-black text-foreground tracking-tighter break-words">
                            {prediction}
                          </h4>
                          <div className="h-1 w-20 skeuo-glow-text bg-current mx-auto rounded-full mt-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Technical Specs List */}
                  <div className="skeuo-inset p-6 grid grid-cols-1 gap-4">
                    {[
                      { label: 'Latency', value: '< 24ms' },
                      { label: 'Precision', value: 'High' },
                      { label: 'Security', value: 'AES-256' }
                    ].map((spec) => (
                      <div key={spec.label} className="flex justify-between items-center px-4">
                        <span className="text-muted-foreground text-xs uppercase font-bold tracking-widest">{spec.label}</span>
                        <span className="skeuo-glow-text font-mono text-sm">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}