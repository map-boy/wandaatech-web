'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ML_MODELS } from '@/lib/constants/ml-models'
import { predictModel } from '@/lib/ml-service'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, Cpu, Zap, Activity, BrainCircuit, Terminal 
} from 'lucide-react'

export function IntelligenceLab() {
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
      setError(err.message || 'Connection to Neural Engine failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="lab" className="py-8 bg-[#020617] border-t border-emerald-500/10 min-h-fit relative">
      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        
        {/* Compact Header */}
        <div className="flex items-center gap-3 mb-6">
          <BrainCircuit className="text-emerald-500 w-5 h-5" />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">
            Neural <span className="text-emerald-500">Workspace</span>
          </h2>
        </div>

        <Tabs defaultValue={ML_MODELS[0].id} className="flex flex-col lg:flex-row gap-6 items-start" onValueChange={() => {
          setPrediction(null); setError(null); setUserInput('')
        }}>
          
          {/* SIDEBAR: Always visible, no folding */}
          <div className="w-full lg:w-[260px] shrink-0 bg-slate-950/40 border border-slate-800 rounded-xl p-3 backdrop-blur-xl">
            <div className="mb-3 px-2 border-b border-slate-800 pb-2">
               <span className="text-emerald-500 font-mono text-[8px] tracking-widest uppercase font-bold">Model Engine</span>
            </div>
            <TabsList className="flex flex-col h-auto bg-transparent gap-1.5 p-0">
              {ML_MODELS.map((model) => (
                <TabsTrigger 
                  key={model.id} 
                  value={model.id} 
                  className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg border border-transparent data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 transition-all overflow-hidden"
                >
                  <Cpu className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-bold text-[9px] uppercase tracking-wide truncate">{model.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 w-full">
            {ML_MODELS.map((model) => (
              <TabsContent key={model.id} value={model.id} className="mt-0 focus:outline-none">
                <div className="flex flex-col gap-4">
                  
                  {/* DATA INPUT AREA */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-900/10 border border-slate-800/60 rounded-xl p-4 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">{model.category} Stream</label>
                        <Terminal className="text-emerald-500/20 w-3 h-3" />
                    </div>
                    
                    {/* Compact Textarea */}
                    <Textarea 
                      placeholder={model.placeholder}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="h-[100px] bg-black/50 border-slate-800 rounded-lg font-mono text-emerald-400 text-xs p-3 resize-none shadow-inner focus:ring-1 focus:ring-emerald-500/30"
                    />

                    {/* EXECUTE BUTTON: Small height, Big length (Full width) */}
                    <Button 
                      onClick={() => handleRunModel(model.id)} 
                      className="w-full h-10 mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-[0.3em] rounded-lg shadow-lg transition-all active:scale-[0.99] shrink-0" 
                      disabled={loading || !userInput}
                    >
                      {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Zap className="h-3 w-3 fill-current mr-2" />}
                      Execute {model.name}
                    </Button>
                    
                    {error && <p className="text-red-500 text-[9px] mt-2 font-mono uppercase text-center">{error}</p>}
                  </motion.div>

                  {/* RESULTS AREA - Slim and Wide */}
                  <div className="bg-black border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[120px] shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-40" />
                    
                    <AnimatePresence mode="wait">
                      {!prediction && !loading && (
                        <motion.div key="idle" className="flex items-center gap-3 opacity-20">
                          <Activity className="w-5 h-5 text-emerald-500" />
                          <p className="text-emerald-500 font-mono text-[9px] uppercase tracking-[0.4em]">Neural.Awaiting_Input</p>
                        </motion.div>
                      )}

                      {loading && (
                        <motion.div key="loading" className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                          <p className="text-white font-mono text-[9px] uppercase tracking-widest animate-pulse">Running Paths...</p>
                        </motion.div>
                      )}

                      {prediction && (
                        <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center relative z-10">
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[7px] mb-1 px-2 h-4">INFERENCE_RESULT</Badge>
                          <h4 className="text-4xl font-black text-white tracking-tighter uppercase leading-tight">
                            {prediction}
                          </h4>
                          <div className="flex justify-center gap-1 mt-2">
                             <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                             <div className="w-1 h-1 bg-emerald-500/50 rounded-full" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  )
}