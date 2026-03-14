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
    <section id="ml-lab" className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Abstract Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-600/5 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-[2px] w-8 bg-emerald-500" />
              <span className="text-emerald-500 font-mono text-sm tracking-widest uppercase">Neural Network Interface</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Intelligence <span className="text-emerald-500">Lab</span>
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gray-400 max-w-md text-sm md:text-base border-l border-emerald-500/30 pl-6"
          >
            Deploying high-performance machine learning models for real-time data analysis and predictive insights.
          </motion.p>
        </div>

        <Tabs defaultValue={ML_MODELS[0].id} className="space-y-8" onValueChange={() => {
          setPrediction(null)
          setError(null)
          setUserInput('')
        }}>
          
          <TabsList className="inline-flex h-auto p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            {ML_MODELS.map((model) => (
              <TabsTrigger 
                key={model.id} 
                value={model.id} 
                className="px-6 py-2.5 rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-black font-bold transition-all text-sm"
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
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-green-500/0 rounded-[2rem] blur opacity-75 group-hover:opacity-100 transition duration-1000" />
                  <div className="relative bg-[#0d0d0d] border border-white/10 rounded-[2rem] p-8 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Activity className="text-emerald-500 w-5 h-5" />
                        <h3 className="text-xl font-bold text-white uppercase">Data Entry</h3>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
                        {model.category}
                      </Badge>
                    </div>

                    <Textarea 
                      placeholder={model.placeholder}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="min-h-[220px] bg-black/40 border-white/5 rounded-xl font-mono text-emerald-500/90 placeholder:text-gray-700 focus:border-emerald-500/50 transition-all text-base mb-6"
                    />

                    <Button 
                      onClick={() => handleRunModel(model.id)} 
                      className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg uppercase tracking-tighter group overflow-hidden relative" 
                      disabled={loading || !userInput}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2 h-5 w-5 fill-current" />}
                        Process Intelligence
                      </span>
                    </Button>
                  </div>
                </motion.div>

                {/* Result Section (2/5 columns) */}
                <motion.div 
                  className="lg:col-span-2 space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[300px] text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                      <Cpu className="w-8 h-8 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors" />
                    </div>

                    <AnimatePresence mode="wait">
                      {!prediction && !loading && (
                        <motion.div key="idle" exit={{ opacity: 0 }} className="space-y-4">
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-500/30 flex items-center justify-center mx-auto">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                          </div>
                          <p className="text-emerald-500/50 font-mono text-xs uppercase tracking-widest">System Ready...</p>
                        </motion.div>
                      )}

                      {loading && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
                          <p className="text-white font-bold uppercase animate-pulse">Analyzing Data</p>
                        </motion.div>
                      )}

                      {prediction && (
                        <motion.div 
                          key="result"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="space-y-4 w-full"
                        >
                          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                            Inference Complete
                          </div>
                          <h4 className="text-6xl font-black text-white tracking-tighter break-words">
                            {prediction}
                          </h4>
                          <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full mt-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Technical Specs List */}
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 grid grid-cols-1 gap-4">
                    {[
                      { label: 'Latency', value: '< 24ms' },
                      { label: 'Precision', value: 'High' },
                      { label: 'Security', value: 'AES-256' }
                    ].map((spec) => (
                      <div key={spec.label} className="flex justify-between items-center px-4">
                        <span className="text-gray-500 text-xs uppercase font-bold tracking-widest">{spec.label}</span>
                        <span className="text-emerald-500 font-mono text-sm">{spec.value}</span>
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