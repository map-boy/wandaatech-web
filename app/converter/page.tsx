'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, Upload, Download, FileText,
  RefreshCw, X, CheckCircle, AlertCircle, Info, Target
} from 'lucide-react'

const TOOLS = [
  {
    id: 'docx-to-pdf', icon: '📝', label: 'DOCX → PDF',
    desc: 'Word document to PDF', tag: 'Most used', tagColor: 'emerald',
    accept: '.docx,.doc', group: 'to-pdf',
  },
  {
    id: 'txt-to-pdf', icon: '📃', label: 'TXT → PDF',
    desc: 'Plain text to PDF', tag: '', tagColor: '',
    accept: '.txt', group: 'to-pdf',
  },
  {
    id: 'img-to-pdf', icon: '🖼️', label: 'Image → PDF',
    desc: 'JPG, PNG, WebP to PDF', tag: 'Popular', tagColor: 'sky',
    accept: '.jpg,.jpeg,.png,.webp,.bmp', group: 'to-pdf',
  },
  {
    id: 'csv-to-pdf', icon: '📊', label: 'CSV → PDF',
    desc: 'Spreadsheet data to PDF', tag: '', tagColor: '',
    accept: '.csv', group: 'to-pdf',
  },
  {
    id: 'html-to-pdf', icon: '🌐', label: 'HTML → PDF',
    desc: 'Web page file to PDF', tag: '', tagColor: '',
    accept: '.html,.htm', group: 'to-pdf',
  },
  {
    id: 'compress-any', icon: '📦', label: 'Compress Any File',
    desc: 'PDF, DOCX, TXT, images — any file', tag: 'Universal', tagColor: 'amber',
    accept: '*', group: 'compress',
  },
  {
    id: 'img-to-jpg', icon: '📸', label: 'Image → JPEG',
    desc: 'Convert any image to JPEG', tag: '', tagColor: '',
    accept: '.png,.webp,.bmp,.gif', group: 'convert',
  },
  {
    id: 'img-to-png', icon: '🖼️', label: 'Image → PNG',
    desc: 'Convert any image to PNG', tag: '', tagColor: '',
    accept: '.jpg,.jpeg,.webp,.bmp', group: 'convert',
  },
  {
    id: 'pdf-to-img', icon: '📄', label: 'PDF → Images',
    desc: 'Extract PDF pages as PNG', tag: '', tagColor: '',
    accept: '.pdf', group: 'convert',
  },
]

const GROUPS = [
  { id: 'to-pdf',   label: '→ PDF',    emoji: '📄' },
  { id: 'compress', label: 'Compress', emoji: '📦' },
  { id: 'convert',  label: 'Convert',  emoji: '🔄' },
]

const TAG_STYLES: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  sky:     'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  amber:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
}

const COMPRESS_LEVELS = [
  { label: 'Maximum', subLabel: 'Smallest file', quality: 20, zipLevel: 9 },
  { label: 'High',    subLabel: 'Good for email', quality: 40, zipLevel: 7 },
  { label: 'Balanced',subLabel: 'Recommended',    quality: 65, zipLevel: 6 },
  { label: 'Light',   subLabel: 'Near-original',  quality: 82, zipLevel: 4 },
  { label: 'Minimal', subLabel: 'Best quality',   quality: 92, zipLevel: 1 },
]

type Status = 'idle' | 'processing' | 'done' | 'error'

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return bytes + ' B'
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

export default function ConverterPage() {
  const [activeGroup, setActiveGroup]     = useState('to-pdf')
  const [tool, setTool]                   = useState(TOOLS[0])
  const [file, setFile]                   = useState<File | null>(null)
  const [status, setStatus]               = useState<Status>('idle')
  const [errorMsg, setErrorMsg]           = useState('')
  const [downloadUrl, setDownloadUrl]     = useState<string | null>(null)
  const [downloadName, setDownloadName]   = useState('')
  const [outputSize, setOutputSize]       = useState<number | null>(null)
  const [compressLevel, setCompressLevel] = useState(2)
  const [dragOver, setDragOver]           = useState(false)
  const [targetKB, setTargetKB]           = useState<string>('')
  const [progressMsg, setProgressMsg]     = useState('')
  const [finalQuality, setFinalQuality]   = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const zipLevel = COMPRESS_LEVELS[compressLevel].zipLevel

  const visibleTools = TOOLS.filter(t => t.group === activeGroup)

  const reset = useCallback(() => {
    setFile(null)
    setStatus('idle')
    setErrorMsg('')
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setDownloadUrl(null)
    setDownloadName('')
    setOutputSize(null)
    setProgressMsg('')
    setFinalQuality(null)
  }, [downloadUrl])

  const handleFile = (f: File) => { reset(); setFile(f) }
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [reset])

  const handleGroupChange = (gid: string) => {
    setActiveGroup(gid)
    const first = TOOLS.find(t => t.group === gid)!
    setTool(first); reset()
  }

  // ── Auto-compress image canvas to fit KB target ──
  // Tries quality from 90 down to 5 until size fits
  const compressCanvasToTarget = (
    canvas: HTMLCanvasElement,
    fmt: string,
    targetBytes: number
  ): Promise<{ blob: Blob; quality: number }> => {
    return new Promise((resolve, reject) => {
      const qualities = [90, 75, 60, 45, 35, 25, 15, 8, 5]
      let idx = 0
      const tryNext = () => {
        if (idx >= qualities.length) {
          // return best we have at lowest quality
          canvas.toBlob((b) => {
            if (b) resolve({ blob: b, quality: qualities[qualities.length - 1] })
            else reject(new Error('Compression failed'))
          }, fmt, 0.05)
          return
        }
        const q = qualities[idx++]
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Compression failed')); return }
          if (blob.size <= targetBytes || idx >= qualities.length) {
            resolve({ blob, quality: q })
          } else {
            setProgressMsg(`Trying quality ${q}%... (${formatSize(blob.size)})`)
            tryNext()
          }
        }, fmt, q / 100)
      }
      tryNext()
    })
  }

  // ── Text → PDF with optional size fitting ──
  const buildTextPdf = async (text: string, fileName: string, landscape = false) => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    // @ts-ignore
    const { jsPDF } = window.jspdf

    const targetBytes = targetKB ? parseFloat(targetKB) * 1024 : null
    // For text PDFs we try reducing font size to shrink
    const fontSizes = targetBytes ? [12, 10, 9, 8, 7] : [12]

    for (const fontSize of fontSizes) {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: landscape ? 'landscape' : 'portrait' })
      pdf.setFontSize(fontSize)
      const maxW = landscape ? 270 : 180
      const maxH = landscape ? 190 : 280
      const lineH = fontSize * 0.35 + 2
      const lines = pdf.splitTextToSize(text, maxW)
      let y = 15
      lines.forEach((line: string) => {
        if (y > maxH) { pdf.addPage(); y = 15 }
        pdf.text(line, 10, y); y += lineH
      })
      const blob = pdf.output('blob')
      if (!targetBytes || blob.size <= targetBytes) {
        return { blob, name: fileName, quality: fontSize }
      }
      setProgressMsg(`Trying font size ${fontSize}pt... (${formatSize(blob.size)})`)
    }

    // Last resort — return smallest version
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    pdf.setFontSize(7)
    const lines = pdf.splitTextToSize(text, 180)
    let y = 15
    lines.forEach((line: string) => {
      if (y > 280) { pdf.addPage(); y = 15 }
      pdf.text(line, 10, y); y += 4
    })
    return { blob: pdf.output('blob'), name: fileName, quality: 7 }
  }

  // ── DOCX → PDF ──
  const doDocxToPdf = async (file: File) => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js')
    const arrayBuffer = await file.arrayBuffer()
    // @ts-ignore
    const result = await mammoth.convertToHtml({ arrayBuffer })
    const tmp = document.createElement('div')
    tmp.innerHTML = result.value
    const text = tmp.innerText || tmp.textContent || ''
    return buildTextPdf(text, file.name.replace(/\.[^.]+$/, '') + '.pdf')
  }

  // ── TXT → PDF ──
  const doTxtToPdf = async (file: File) => {
    const text = await file.text()
    return buildTextPdf(text, file.name.replace(/\.[^.]+$/, '') + '.pdf')
  }

  // ── CSV → PDF ──
  const doCsvToPdf = async (file: File) => {
    const text = await file.text()
    const rows = text.split('\n').map(r => r.split(',').map(c => c.trim().substring(0, 25)).join(' | '))
    return buildTextPdf(rows.join('\n'), file.name.replace(/\.[^.]+$/, '') + '.pdf', true)
  }

  // ── HTML → PDF ──
  const doHtmlToPdf = async (file: File) => {
    const html = await file.text()
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    const text = tmp.innerText || tmp.textContent || ''
    return buildTextPdf(text, file.name.replace(/\.[^.]+$/, '') + '.pdf')
  }

  // ── Image → PDF with auto-compress to target KB ──
  const doImgToPdf = async (file: File) => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    return new Promise<{ blob: Blob; name: string; quality: number }>((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = async () => {
        const w = img.width, h = img.height
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)

        const targetBytes = targetKB ? parseFloat(targetKB) * 1024 : null
        // @ts-ignore
        const { jsPDF } = window.jspdf

        if (!targetBytes) {
          // No target — use default quality 80
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          const orientation = w > h ? 'landscape' : 'portrait'
          const pdf = new jsPDF({ orientation, unit: 'px', format: [w, h] })
          pdf.addImage(dataUrl, 'JPEG', 0, 0, w, h)
          resolve({ blob: pdf.output('blob'), name: file.name.replace(/\.[^.]+$/, '') + '.pdf', quality: 80 })
          return
        }

        // Auto-compress: try reducing quality until PDF fits target
        const qualities = [85, 70, 55, 40, 30, 20, 12, 7]
        let bestBlob: Blob | null = null
        let bestQ = 85

        for (const q of qualities) {
          setProgressMsg(`Optimizing image quality ${q}%...`)
          const dataUrl = canvas.toDataURL('image/jpeg', q / 100)
          const orientation = w > h ? 'landscape' : 'portrait'
          const pdf = new jsPDF({ orientation, unit: 'px', format: [w, h] })
          pdf.addImage(dataUrl, 'JPEG', 0, 0, w, h)
          const blob = pdf.output('blob')
          bestBlob = blob
          bestQ = q
          if (blob.size <= targetBytes) break
        }

        resolve({
          blob: bestBlob!,
          name: file.name.replace(/\.[^.]+$/, '') + '.pdf',
          quality: bestQ
        })
      }
      img.onerror = () => reject(new Error('Cannot load image'))
      img.src = url
    })
  }

  // ── Universal compressor ──
  const doCompressAny = async (file: File) => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
    const isImage = file.type.startsWith('image/')

    if (isImage) {
      return new Promise<{ blob: Blob; name: string; quality: number }>((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = async () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width; canvas.height = img.height
          canvas.getContext('2d')!.drawImage(img, 0, 0)
          URL.revokeObjectURL(url)
          const fmt = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
          const ext = file.type === 'image/png' ? '.png' : '.jpg'
          const q = COMPRESS_LEVELS[compressLevel].quality
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Compression failed'))
            resolve({ blob, name: file.name.replace(/\.[^.]+$/, '') + '_compressed' + ext, quality: q })
          }, fmt, q / 100)
        }
        img.onerror = () => reject(new Error('Cannot load image'))
        img.src = url
      })
    } else {
      const arrayBuffer = await file.arrayBuffer()
      const uint8 = new Uint8Array(arrayBuffer)
      // @ts-ignore
      const zip = new JSZip()
      zip.file(file.name, uint8, { binary: true })
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: zipLevel }
      })
      return { blob, name: file.name.replace(/\.[^.]+$/, '') + '_compressed.zip', quality: 0 }
    }
  }

  // ── PDF → Images ──
  const doPdfToImg = async (file: File) => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
    // @ts-ignore
    const pdfjsLib = window.pdfjsLib
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    // @ts-ignore
    const zip = new JSZip()
    const folder = zip.folder('pages')!
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const vp = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = vp.width; canvas.height = vp.height
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
      folder.file(`page-${String(i).padStart(3, '0')}.png`, canvas.toDataURL('image/png').split(',')[1], { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    return { blob, name: file.name.replace(/\.[^.]+$/, '') + '_pages.zip', quality: 0 }
  }

  // ── Image format ──
  const doImgConvert = (file: File, fmt: string, ext: string) => {
    return new Promise<{ blob: Blob; name: string; quality: number }>((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width; canvas.height = img.height
        canvas.getContext('2d')!.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Conversion failed'))
          URL.revokeObjectURL(url)
          resolve({ blob, name: file.name.replace(/\.[^.]+$/, '') + ext, quality: 90 })
        }, fmt, 0.9)
      }
      img.onerror = () => reject(new Error('Cannot load image'))
      img.src = url
    })
  }

  // ── Main handler ──
  const run = async () => {
    if (!file) return
    setStatus('processing')
    setErrorMsg('')
    setProgressMsg('Starting...')
    setFinalQuality(null)
    try {
      let result: { blob: Blob; name: string; quality: number }
      switch (tool.id) {
        case 'docx-to-pdf':  result = await doDocxToPdf(file);  break
        case 'txt-to-pdf':   result = await doTxtToPdf(file);   break
        case 'img-to-pdf':   result = await doImgToPdf(file);   break
        case 'csv-to-pdf':   result = await doCsvToPdf(file);   break
        case 'html-to-pdf':  result = await doHtmlToPdf(file);  break
        case 'compress-any': result = await doCompressAny(file); break
        case 'img-to-jpg':   result = await doImgConvert(file, 'image/jpeg', '.jpg'); break
        case 'img-to-png':   result = await doImgConvert(file, 'image/png',  '.png'); break
        case 'pdf-to-img':   result = await doPdfToImg(file);   break
        default: throw new Error('Tool not available')
      }
      const dlUrl = URL.createObjectURL(result.blob)
      setDownloadUrl(dlUrl)
      setDownloadName(result.name)
      setOutputSize(result.blob.size)
      setFinalQuality(result.quality)
      setProgressMsg('')
      setStatus('done')
    } catch (e: any) {
      setStatus('error')
      setProgressMsg('')
      setErrorMsg(e?.message || 'Something went wrong. Please try again.')
    }
  }

  const isCompressor = tool.id === 'compress-any'
  const isToPdf      = tool.group === 'to-pdf'
  const targetBytes  = targetKB ? parseFloat(targetKB) * 1024 : null
  const fitsTarget   = outputSize !== null && targetBytes ? outputSize <= targetBytes : true

  return (
    <main className="min-h-screen bg-background text-foreground py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-500 transition-colors mb-10 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Document Converter</h1>
          <p className="text-muted-foreground text-lg">Convert and compress files — private, instant, free.</p>
        </div>

        {/* Group tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {GROUPS.map((g) => (
            <button key={g.id} onClick={() => handleGroupChange(g.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                activeGroup === g.id
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'bg-card border-border/60 text-muted-foreground hover:border-emerald-500/30'
              }`}>
              <span>{g.emoji}</span> {g.label}
            </button>
          ))}
        </div>

        {/* Tool selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {visibleTools.map((t) => (
            <button key={t.id} onClick={() => { setTool(t); reset() }}
              className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${
                tool.id === t.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-border/60 bg-card hover:border-emerald-500/30'
              }`}>
              {t.tag && (
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TAG_STYLES[t.tagColor]}`}>
                  {t.tag}
                </span>
              )}
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="text-sm font-bold text-foreground leading-tight">{t.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.desc}</div>
            </button>
          ))}
        </div>

        {/* ── KB target size input — → PDF only ── */}
        <AnimatePresence>
          {isToPdf && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-bold text-foreground">Target File Size in KB <span className="text-muted-foreground font-normal">(optional)</span></p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the maximum KB your PDF should be. The converter will automatically reduce quality until the file fits. Leave empty to use default quality.
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number" min="10" placeholder="e.g. 500"
                      value={targetKB}
                      onChange={(e) => setTargetKB(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-500">KB</span>
                  </div>
                  {targetKB && (
                    <button onClick={() => setTargetKB('')} className="p-3 rounded-xl border border-border/60 text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {targetKB && (
                  <div className="flex gap-3 flex-wrap">
                    {['100', '200', '500', '1000', '2000'].map(kb => (
                      <button key={kb} onClick={() => setTargetKB(kb)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          targetKB === kb ? 'bg-emerald-500 text-white border-emerald-500' : 'border-border/60 text-muted-foreground hover:border-emerald-500/30'
                        }`}>
                        {parseInt(kb) >= 1000 ? `${parseInt(kb)/1000}MB` : `${kb}KB`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compression level — compress tab only */}
        <AnimatePresence>
          {isCompressor && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Compression Level</p>
              <div className="grid grid-cols-5 gap-2">
                {COMPRESS_LEVELS.map((level, idx) => (
                  <button key={idx} onClick={() => setCompressLevel(idx)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      compressLevel === idx ? 'border-emerald-500 bg-emerald-500/10' : 'border-border/60 bg-card hover:border-emerald-500/30'
                    }`}>
                    <p className={`text-xs font-bold ${compressLevel === idx ? 'text-emerald-400' : 'text-foreground'}`}>{level.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{level.subLabel}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Accepts any file: <span className="text-emerald-400">PDF · DOCX · TXT · PPTX · XLSX · JPG · PNG · CSV · ZIP · any</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !file && fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 mb-4 ${
            file ? 'cursor-default' : 'cursor-pointer'
          } ${dragOver ? 'border-emerald-500 bg-emerald-500/10' : file ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border/60 bg-card hover:border-emerald-500/30 hover:bg-emerald-500/5'}`}
        >
          <input ref={fileRef} type="file" accept={tool.accept} className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="file" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{file.name}</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Original size: <span className="text-amber-400 font-semibold">{formatSize(file.size)}</span>
                    {targetKB && <span className="text-muted-foreground"> → target: <span className="text-emerald-400 font-semibold">{targetKB} KB</span></span>}
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); reset() }} className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                  <X className="w-3 h-3" /> Remove file
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-semibold text-foreground">
                    {isCompressor ? 'Drop any file here' : <>Drop your <span className="text-emerald-500">{tool.label.split('→')[0].trim()}</span> file here</>}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-muted-foreground/50">
                  {isCompressor ? 'PDF · DOCX · TXT · PPTX · XLSX · JPG · PNG · any file' : tool.accept.replaceAll('.', '').toUpperCase()}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {file && (
          <button onClick={() => fileRef.current?.click()} className="w-full mb-4 py-2 text-sm text-muted-foreground hover:text-emerald-500 border border-border/40 rounded-xl transition-colors">
            Choose a different file
          </button>
        )}

        {/* Processing progress */}
        <AnimatePresence>
          {status === 'processing' && progressMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin flex-shrink-0" />
              <p className="text-sm text-emerald-400">{progressMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Convert button */}
        <button onClick={run} disabled={!file || status === 'processing'}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg mb-6">
          {status === 'processing' ? (
            <><RefreshCw className="w-5 h-5 animate-spin" /> {targetKB && isToPdf ? 'Compressing to fit target...' : 'Processing...'}</>
          ) : isCompressor ? <>📦 Compress File</>
          : <>{tool.icon} Convert to {tool.label.split('→')[1]?.trim()}{targetKB && isToPdf ? ` (max ${targetKB}KB)` : ''}</>}
        </button>

        {/* Result */}
        <AnimatePresence>
          {status === 'done' && downloadUrl && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`rounded-2xl border p-6 mb-4 ${fitsTarget ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1">
                  {fitsTarget
                    ? <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  }
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-foreground">
                      {fitsTarget ? (isCompressor ? 'Compression complete!' : 'Conversion complete!') : 'Done — but slightly over target'}
                    </p>
                    <p className="text-sm text-muted-foreground">{downloadName}</p>
                    {outputSize !== null && (
                      <div className="mt-2 space-y-1">
                        {file && <p className="text-sm">
                          Before: <span className="text-amber-400 font-semibold">{formatSize(file.size)}</span>
                          {' → '}
                          After: <span className={`font-semibold ${fitsTarget ? 'text-emerald-400' : 'text-amber-400'}`}>{formatSize(outputSize)}</span>
                        </p>}
                        {targetKB && (
                          <p className={`text-xs font-semibold ${fitsTarget ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {fitsTarget
                              ? `✅ Fits within ${targetKB} KB target`
                              : `⚠️ ${formatSize(outputSize)} — ${formatSize(outputSize - parseFloat(targetKB) * 1024)} over target. File content may need reducing.`
                            }
                          </p>
                        )}
                        {file && isCompressor && outputSize < file.size && (
                          <p className="text-xs text-emerald-400">Saved {Math.round((1 - outputSize / file.size) * 100)}%</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <a href={downloadUrl} download={downloadName}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-95 whitespace-nowrap">
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Could not process file</p>
                <p className="text-sm text-muted-foreground mt-0.5">{errorMsg}</p>
                <button onClick={reset} className="text-xs text-emerald-500 hover:text-emerald-400 mt-2">Try again</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {[
            { icon: '🔒', title: 'Fully Private',  desc: 'Files never leave your device' },
            { icon: '⚡', title: 'Auto-compress',   desc: 'Fits your KB target automatically' },
            { icon: '🆓', title: '100% Free',       desc: 'No account, no payment, no limits' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border/60 bg-card p-4 text-center space-y-1">
              <div className="text-2xl">{item.icon}</div>
              <p className="font-bold text-foreground text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}