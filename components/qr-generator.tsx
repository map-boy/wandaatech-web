'use client'

import { useState, useRef, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Link as LinkIcon, Palette, Zap, History, Trash2, ExternalLink } from 'lucide-react'

export function QRGenerator() {
  const [link, setLink] = useState("https://vafubwengetech.com")
  const [qrColor, setQrColor] = useState("#10b981")
  const [history, setHistory] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('vaf-qr-history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const downloadQR = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Save to history
    if (link && !history.includes(link)) {
      const updated = [link, ...history].slice(0, 5)
      setHistory(updated)
      localStorage.setItem('vaf-qr-history', JSON.stringify(updated))
    }
    
    const url = canvas.toDataURL("image/png")
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "VAF-TECH-QR.png"
    anchor.click()
  }

  if (!mounted) return null

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="p-8 bg-slate-950 border border-emerald-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 mb-4">
            <Zap className="text-emerald-500" size={24} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            QR <span className="text-emerald-500">Engine</span>
          </h2>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center">
              <LinkIcon size={18} className="text-emerald-500/50" />
            </div>
            <input 
              type="text" 
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-emerald-500/10 rounded-2xl text-white focus:outline-none focus:border-emerald-500/50 text-sm"
              placeholder="Target URL..."
            />
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-emerald-500/5">
            <Palette size={18} className="text-emerald-500/50" />
            <input 
              type="color" 
              value={qrColor}
              onChange={(e) => setQrColor(e.target.value)}
              className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg"
            />
          </div>

          <div className="flex justify-center p-6 bg-white rounded-[2rem]">
            <QRCodeCanvas
              ref={canvasRef}
              value={link}
              size={180}
              level={"H"}
              fgColor={qrColor}
              imageSettings={{
                src: "/vaf-logo.png",
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          <button 
            onClick={downloadQR}
            className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl transition-all uppercase tracking-tight"
          >
            <Download size={20} />
            Export PNG
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="p-6 bg-slate-950 border border-emerald-500/10 rounded-[2rem]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Recent Nodes</span>
            <button onClick={() => {setHistory([]); localStorage.removeItem('vaf-qr-history')}}>
              <Trash2 size={14} className="text-slate-600 hover:text-red-500" />
            </button>
          </div>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div key={idx} onClick={() => setLink(item)} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-transparent hover:border-emerald-500/20 cursor-pointer">
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{item}</span>
                <ExternalLink size={12} className="text-slate-600" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}