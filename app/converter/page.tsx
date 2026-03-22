'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, Upload, Download, FileText,
  RefreshCw, X, CheckCircle, AlertCircle, Target, ArrowRight
} from 'lucide-react'

// ── TO-PDF tools ──
const TO_PDF_TOOLS = [
  { id: 'docx-to-pdf', icon: '📝', label: 'DOCX → PDF', desc: 'Word document to PDF (text, images, mixed)', tag: 'Most used', tagColor: 'emerald', accept: '.docx,.doc' },
  { id: 'txt-to-pdf',  icon: '📃', label: 'TXT → PDF',  desc: 'Plain text to PDF', tag: '', tagColor: '', accept: '.txt' },
  { id: 'img-to-pdf',  icon: '🖼️', label: 'Image → PDF', desc: 'JPG, PNG, WebP to PDF', tag: 'Popular', tagColor: 'sky', accept: '.jpg,.jpeg,.png,.webp,.bmp' },
  { id: 'csv-to-pdf',  icon: '📊', label: 'CSV → PDF',  desc: 'Spreadsheet data to PDF', tag: '', tagColor: '', accept: '.csv' },
  { id: 'html-to-pdf', icon: '🌐', label: 'HTML → PDF', desc: 'Web page file to PDF', tag: '', tagColor: '', accept: '.html,.htm' },
]

// ── CONVERT tools (fixed pairs + custom) ──
const CONVERT_TOOLS = [
  { id: 'img-to-jpg',    icon: '📸', label: 'Image → JPEG', desc: 'Convert any image to JPEG', tag: '', tagColor: '', accept: '.png,.webp,.bmp,.gif' },
  { id: 'img-to-png',    icon: '🖼️', label: 'Image → PNG',  desc: 'Convert any image to PNG',  tag: '', tagColor: '', accept: '.jpg,.jpeg,.webp,.bmp' },
  { id: 'pdf-to-img',    icon: '📄', label: 'PDF → Images', desc: 'Extract PDF pages as PNG',   tag: '', tagColor: '', accept: '.pdf' },
  { id: 'pdf-to-txt',    icon: '📄', label: 'PDF → TXT',    desc: 'Extract text from PDF',      tag: '', tagColor: '', accept: '.pdf' },
  { id: 'custom-convert',icon: '⚙️', label: 'Custom Convert', desc: 'You choose: from any format to any format', tag: 'Flexible', tagColor: 'violet', accept: '*' },
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
  violet:  'bg-violet-500/10 text-violet-400 border border-violet-500/20',
}

// ZIP compression levels for non-image files
const ZIP_LEVELS = [
  { label: 'Best quality',  comment: 'Barely compressed — original quality', zipLevel: 1 },
  { label: 'Near original', comment: 'Very slight compression',               zipLevel: 3 },
  { label: 'Recommended',   comment: 'Best balance — good for most files',    zipLevel: 6 },
  { label: 'Bad quality',   comment: 'Aggressive compression',                zipLevel: 7 },
  { label: 'Worse quality', comment: 'Heavy — noticeably compressed',          zipLevel: 8 },
  { label: 'Worst quality', comment: 'Maximum — smallest possible',            zipLevel: 9 },
]

// Live quality prediction for images based on target size vs original
function getQualityPrediction(fileSizeBytes: number, targetVal: string, unit: 'KB' | 'MB') {
  if (!targetVal || !fileSizeBytes) return null
  const targetBytes = parseFloat(targetVal) * (unit === 'MB' ? 1024 * 1024 : 1024)
  const ratio = targetBytes / fileSizeBytes
  if (ratio >= 0.9)  return { label: 'Best quality',  emoji: '🟢', color: 'text-emerald-400', detail: 'Almost no visible difference — very close to original' }
  if (ratio >= 0.7)  return { label: 'Near original', emoji: '🟢', color: 'text-emerald-400', detail: 'Barely noticeable reduction — great for printing and email' }
  if (ratio >= 0.5)  return { label: 'Good quality',  emoji: '🟡', color: 'text-yellow-400',  detail: 'Slight quality loss — perfectly fine for screen viewing' }
  if (ratio >= 0.3)  return { label: 'Acceptable',    emoji: '🟡', color: 'text-yellow-400',  detail: 'Noticeable compression — readable but not ideal for printing' }
  if (ratio >= 0.15) return { label: 'Bad quality',   emoji: '🟠', color: 'text-orange-400',  detail: 'Heavy compression — image will look blurry' }
  if (ratio >= 0.07) return { label: 'Worse quality', emoji: '🔴', color: 'text-red-400',     detail: 'Very poor quality — barely usable, very small file size' }
  return               { label: 'Worst quality',       emoji: '🔴', color: 'text-red-400',     detail: 'Extreme compression — image will be nearly unrecognizable' }
}

// Custom convert supported pairs
const CUSTOM_FROM_FORMATS = ['PDF', 'DOCX', 'TXT', 'JPG', 'PNG', 'WebP', 'BMP', 'CSV', 'HTML']
const CUSTOM_TO_FORMATS: Record<string, string[]> = {
  'PDF':  ['TXT', 'Images (PNG ZIP)'],
  'DOCX': ['PDF', 'TXT'],
  'TXT':  ['PDF'],
  'JPG':  ['PDF', 'PNG', 'WebP'],
  'PNG':  ['PDF', 'JPG', 'WebP'],
  'WebP': ['PDF', 'JPG', 'PNG'],
  'BMP':  ['PDF', 'JPG', 'PNG'],
  'CSV':  ['PDF', 'TXT'],
  'HTML': ['PDF', 'TXT'],
}

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
    s.src = src; s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

function waitForGlobal(name: string, ms = 12000): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = Date.now()
    const check = () => {
      if ((window as any)[name] !== undefined) { resolve(); return }
      if (Date.now() - t > ms) { reject(new Error(`${name} did not load`)); return }
      setTimeout(check, 100)
    }
    check()
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = src
  })
}

async function buildTextPdf(
  text: string, fileName: string, targetBytes: number | null,
  landscape = false, onProgress?: (msg: string) => void
): Promise<{ blob: Blob; name: string }> {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
  await waitForGlobal('jspdf')
  const { jsPDF } = (window as any).jspdf
  const fontSizes = targetBytes ? [12, 10, 9, 8, 7, 6] : [12]
  for (const fontSize of fontSizes) {
    if (onProgress && targetBytes) onProgress(`Building PDF at font size ${fontSize}pt...`)
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: landscape ? 'landscape' : 'portrait' })
    pdf.setFontSize(fontSize)
    const pageW = landscape ? 277 : 190, pageH = landscape ? 190 : 277
    const margin = 10, lineH = fontSize * 0.4 + 1.5
    const lines = pdf.splitTextToSize(text, pageW - margin * 2)
    let y = margin + fontSize * 0.4
    for (const line of lines) {
      if (y + lineH > pageH - margin) { pdf.addPage(); y = margin + fontSize * 0.4 }
      pdf.text(line, margin, y); y += lineH
    }
    const blob: Blob = pdf.output('blob')
    if (!targetBytes || blob.size <= targetBytes) return { blob, name: fileName }
  }
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  pdf.setFontSize(6)
  const lines = pdf.splitTextToSize(text, 170)
  let y = 10
  for (const line of lines) {
    if (y > 280) { pdf.addPage(); y = 10 }
    pdf.text(line, 10, y); y += 3.5
  }
  return { blob: pdf.output('blob'), name: fileName }
}

export default function ConverterPage() {
  const [activeGroup, setActiveGroup]   = useState('to-pdf')
  const [toPdfTool, setToPdfTool]       = useState(TO_PDF_TOOLS[0])
  const [convertTool, setConvertTool]   = useState(CONVERT_TOOLS[0])
  const [file, setFile]                 = useState<File | null>(null)
  const [status, setStatus]             = useState<Status>('idle')
  const [errorMsg, setErrorMsg]         = useState('')
  const [downloadUrl, setDownloadUrl]   = useState<string | null>(null)
  const [downloadName, setDownloadName] = useState('')
  const [outputSize, setOutputSize]     = useState<number | null>(null)
  const [dragOver, setDragOver]         = useState(false)
  const [progressMsg, setProgressMsg]   = useState('')
  const [docInfo, setDocInfo]           = useState('')

  // ── TO-PDF settings ──
  const [targetKB, setTargetKB]         = useState('')

  // ── COMPRESS settings ──
  const [compressTargetUnit, setCompressTargetUnit] = useState<'KB' | 'MB'>('KB')
  const [compressTargetValue, setCompressTargetValue] = useState('')
  const [selectedQualityIdx, setSelectedQualityIdx] = useState(2) // Recommended

  // ── CUSTOM CONVERT settings ──
  const [customFrom, setCustomFrom] = useState('PDF')
  const [customTo, setCustomTo]     = useState('TXT')

  const fileRef = useRef<HTMLInputElement>(null)

  const currentTool = activeGroup === 'to-pdf' ? toPdfTool : convertTool
  const targetBytes = targetKB ? parseFloat(targetKB) * 1024 : null

  const compressTargetBytes = compressTargetValue
    ? parseFloat(compressTargetValue) * (compressTargetUnit === 'MB' ? 1024 * 1024 : 1024)
    : null

  const reset = useCallback(() => {
    setFile(null); setStatus('idle'); setErrorMsg('')
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setDownloadUrl(null); setDownloadName(''); setOutputSize(null)
    setProgressMsg(''); setDocInfo('')
  }, [downloadUrl])

  const handleFile  = (f: File) => { reset(); setFile(f) }
  const handleDrop  = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]; if (f) handleFile(f)
  }, [reset])
  const handleGroup = (gid: string) => { setActiveGroup(gid); reset() }

  // ── accept string for current tool ──
  const getAccept = () => {
    if (activeGroup === 'compress') return '*'
    if (activeGroup === 'to-pdf')   return toPdfTool.accept
    if (convertTool.id === 'custom-convert') {
      const map: Record<string, string> = {
        'PDF': '.pdf', 'DOCX': '.docx,.doc', 'TXT': '.txt',
        'JPG': '.jpg,.jpeg', 'PNG': '.png', 'WebP': '.webp',
        'BMP': '.bmp', 'CSV': '.csv', 'HTML': '.html,.htm',
      }
      return map[customFrom] || '*'
    }
    return convertTool.accept
  }

  // ══════════════════════════════════
  // DOCX → PDF
  // ══════════════════════════════════
  const doDocxToPdf = async (file: File): Promise<{ blob: Blob; name: string }> => {
    setProgressMsg('Opening DOCX file...')
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
    await waitForGlobal('JSZip')
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    await waitForGlobal('jspdf')
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js')
    await waitForGlobal('mammoth')

    const arrayBuffer = await file.arrayBuffer()
    setProgressMsg('Extracting contents...')
    const zip = await (window as any).JSZip.loadAsync(arrayBuffer)

    const IMAGE_EXTS = ['jpg','jpeg','png','gif','bmp','webp']
    const VIDEO_EXTS = ['mp4','avi','mov','wmv','mkv','webm','flv']
    const mediaFiles = Object.keys(zip.files).filter(f => f.startsWith('word/media/') && !zip.files[f].dir)
    const imageFiles = mediaFiles.filter(f => IMAGE_EXTS.includes(f.split('.').pop()?.toLowerCase() || ''))
    const videoFiles = mediaFiles.filter(f => VIDEO_EXTS.includes(f.split('.').pop()?.toLowerCase() || ''))

    let docText = ''
    try {
      const result = await (window as any).mammoth.extractRawText({ arrayBuffer })
      docText = (result.value || '').trim()
    } catch { /* continue */ }

    const hasImages = imageFiles.length > 0
    const hasText   = docText.length > 5
    const hasVideos = videoFiles.length > 0

    const parts = []
    if (hasText)   parts.push(`${docText.length} characters`)
    if (hasImages) parts.push(`${imageFiles.length} image(s)`)
    if (hasVideos) parts.push(`${videoFiles.length} video(s) — note added`)
    setDocInfo(parts.join(' · '))

    if (!hasText && !hasImages) throw new Error('Document appears empty or unreadable. Try resaving as .docx from Word.')

    const { jsPDF } = (window as any).jspdf
    const MIME: Record<string, string> = { jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',gif:'image/gif',bmp:'image/bmp',webp:'image/webp' }

    if (hasImages) {
      const imgDataUrls: string[] = []
      for (let i = 0; i < imageFiles.length; i++) {
        setProgressMsg(`Loading image ${i + 1} of ${imageFiles.length}...`)
        const ext = imageFiles[i].split('.').pop()?.toLowerCase() || 'jpg'
        const b64 = await zip.files[imageFiles[i]].async('base64')
        imgDataUrls.push(`data:${MIME[ext] || 'image/jpeg'};base64,${b64}`)
      }

      const qualities = targetBytes ? [85,70,55,42,30,20,12] : [82]
      let bestBlob: Blob = new Blob()

      for (const q of qualities) {
        if (targetBytes) setProgressMsg(`Optimizing quality ${q}%...`)
        const firstImg = await loadImage(imgDataUrls[0])
        const pdf = new jsPDF({ orientation: firstImg.width > firstImg.height ? 'landscape' : 'portrait', unit: 'px', format: [firstImg.width, firstImg.height], compress: true })

        for (let i = 0; i < imgDataUrls.length; i++) {
          setProgressMsg(`Adding image ${i + 1} of ${imgDataUrls.length}...`)
          const img = await loadImage(imgDataUrls[i])
          if (i > 0) pdf.addPage([img.width, img.height], img.width > img.height ? 'landscape' : 'portrait')
          const canvas = document.createElement('canvas')
          canvas.width = img.width; canvas.height = img.height
          canvas.getContext('2d')!.drawImage(img, 0, 0)
          pdf.addImage(canvas.toDataURL('image/jpeg', q / 100), 'JPEG', 0, 0, img.width, img.height)
        }

        if (hasText) {
          pdf.addPage()
          pdf.setFontSize(11)
          const lines = pdf.splitTextToSize(docText, 180)
          let y = 15
          for (const line of lines) { if (y > 280) { pdf.addPage(); y = 15 } pdf.text(line, 10, y); y += 6 }
        }
        if (hasVideos) {
          pdf.addPage()
          pdf.setFontSize(12); pdf.setTextColor(120,120,120)
          pdf.text('Note: This document contained video(s) that cannot be embedded in PDF.', 10, 20)
          videoFiles.forEach((vf, i) => { pdf.setFontSize(10); pdf.text(`• ${vf.split('/').pop()}`, 10, 35 + i * 8) })
        }
        const blob: Blob = pdf.output('blob')
        bestBlob = blob
        if (!targetBytes || blob.size <= targetBytes) break
      }
      return { blob: bestBlob, name: file.name.replace(/\.[^.]+$/, '') + '.pdf' }
    }

    let fullText = docText
    if (hasVideos) {
      fullText += '\n\n---\nNote: Videos in this document (cannot be embedded in PDF):\n'
      videoFiles.forEach(vf => { fullText += `• ${vf.split('/').pop()}\n` })
    }
    return buildTextPdf(fullText, file.name.replace(/\.[^.]+$/, '') + '.pdf', targetBytes, false, setProgressMsg)
  }

  // ── TXT → PDF ──
  const doTxtToPdf = async (file: File) => {
    setProgressMsg('Reading text file...')
    const text = await file.text()
    if (!text.trim()) throw new Error('The text file is empty.')
    return buildTextPdf(text.trim(), file.name.replace(/\.[^.]+$/, '') + '.pdf', targetBytes, false, setProgressMsg)
  }

  // ── CSV → PDF ──
  const doCsvToPdf = async (file: File) => {
    setProgressMsg('Reading CSV...')
    const raw = await file.text()
    if (!raw.trim()) throw new Error('The CSV file is empty.')
    const text = raw.split('\n').filter(r => r.trim())
      .map(r => r.split(',').map(c => c.trim().replace(/^"|"$/g, '').substring(0, 30)).join('  |  ')).join('\n')
    return buildTextPdf(text, file.name.replace(/\.[^.]+$/, '') + '.pdf', targetBytes, true, setProgressMsg)
  }

  // ── HTML → PDF ──
  const doHtmlToPdf = async (file: File) => {
    setProgressMsg('Reading HTML...')
    const html = await file.text()
    const tmp = document.createElement('div')
    tmp.innerHTML = html; tmp.querySelectorAll('script,style').forEach(el => el.remove())
    const text = (tmp.innerText || tmp.textContent || '').trim()
    if (!text) throw new Error('No readable text found in this HTML file.')
    return buildTextPdf(text, file.name.replace(/\.[^.]+$/, '') + '.pdf', targetBytes, false, setProgressMsg)
  }

  // ── Image → PDF ──
  const doImgToPdf = async (file: File) => {
    setProgressMsg('Loading image...')
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    await waitForGlobal('jspdf')
    return new Promise<{ blob: Blob; name: string }>((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = async () => {
        try {
          const w = img.width, h = img.height
          const canvas = document.createElement('canvas')
          canvas.width = w; canvas.height = h
          canvas.getContext('2d')!.drawImage(img, 0, 0)
          URL.revokeObjectURL(url)
          const { jsPDF } = (window as any).jspdf
          const orientation = w > h ? 'landscape' : 'portrait'
          const qualities = targetBytes ? [85,70,55,42,30,22,14,8] : [82]
          let bestBlob: Blob = new Blob()
          for (const q of qualities) {
            if (targetBytes) setProgressMsg(`Optimizing quality ${q}%...`)
            const pdf = new jsPDF({ orientation, unit: 'px', format: [w, h] })
            pdf.addImage(canvas.toDataURL('image/jpeg', q / 100), 'JPEG', 0, 0, w, h)
            const blob: Blob = pdf.output('blob')
            bestBlob = blob
            if (!targetBytes || blob.size <= targetBytes) break
          }
          resolve({ blob: bestBlob, name: file.name.replace(/\.[^.]+$/, '') + '.pdf' })
        } catch (e: any) { reject(e) }
      }
      img.onerror = () => reject(new Error('Cannot load image'))
      img.src = url
    })
  }

  // ══════════════════════════════════
  // COMPRESS — with KB/MB target input
  // ══════════════════════════════════
  const doCompressAny = async (file: File) => {
    const ext  = file.name.split('.').pop()?.toLowerCase() || ''

    // Files that can be re-encoded at lower quality (image canvas method)
    const canvasTypes = ['jpg','jpeg','png','webp','bmp','gif','tiff']
    // Files that are ALREADY compressed — ZIP won't help them much
    const alreadyCompressed = ['jpg','jpeg','mp4','mp3','zip','rar','7z','gz','webm','mkv','avi','mov','aac','ogg','flac','webp']
    // Files that compress well with ZIP (text-based)
    const zipFriendly = ['docx','doc','pptx','xlsx','txt','csv','html','xml','json','pdf','odt']

    const isCanvasImage = canvasTypes.includes(ext) || file.type.startsWith('image/')

    if (isCanvasImage) {
      // ── Image: use canvas re-encoding (always works, real compression) ──
      setProgressMsg('Loading image...')
      const bitmap = await createImageBitmap(file)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
      bitmap.close()

      // Always output as JPEG for best compression (except PNG if user wants lossless)
      const outputFmt = ext === 'png' && !compressTargetBytes ? 'image/png' : 'image/jpeg'
      const outputExt = outputFmt === 'image/png' ? '.png' : '.jpg'

      if (compressTargetBytes) {
        const qualities = [95, 82, 70, 58, 45, 33, 22, 14, 8, 4]
        let bestBlob: Blob = new Blob()
        for (const q of qualities) {
          setProgressMsg(`Trying quality ${q}%... (target: ${compressTargetValue}${compressTargetUnit})`)
          const blob = await new Promise<Blob>((res, rej) => {
            canvas.toBlob((b) => b ? res(b) : rej(new Error('Failed')), 'image/jpeg', q / 100)
          })
          bestBlob = blob
          if (blob.size <= compressTargetBytes) break
        }
        return { blob: bestBlob, name: file.name.replace(/\.[^.]+$/, '') + '_compressed.jpg' }
      } else {
        const q = 65
        setProgressMsg(`Compressing image at quality ${q}%...`)
        const blob = await new Promise<Blob>((res, rej) => {
          canvas.toBlob((b) => b ? res(b) : rej(new Error('Failed')), outputFmt, q / 100)
        })
        return { blob, name: file.name.replace(/\.[^.]+$/, '') + '_compressed' + outputExt }
      }
    } else {
      // ── Non-image: ZIP compression ──
      setProgressMsg('Compressing file...')
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
      await waitForGlobal('JSZip')

      const isAlreadyCompressed = alreadyCompressed.includes(ext)
      // Use max compression for zip-friendly files, store-only for already-compressed
      const zipLevel = isAlreadyCompressed ? 1 : (ZIP_LEVELS[selectedQualityIdx]?.zipLevel ?? 6)

      const arrayBuffer = await file.arrayBuffer()
      const zip = new (window as any).JSZip()
      zip.file(file.name, new Uint8Array(arrayBuffer), { binary: true })
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: isAlreadyCompressed ? 'STORE' : 'DEFLATE',
        compressionOptions: { level: zipLevel }
      })

      // Warn user if already-compressed file barely shrank
      if (isAlreadyCompressed && blob.size > file.size * 0.95) {
        setDocInfo(`⚠️ This file type (${ext.toUpperCase()}) is already compressed and cannot be reduced further with ZIP. Try converting it to a different format instead.`)
      }

      return { blob, name: file.name.replace(/\.[^.]+$/, '') + '_compressed.zip' }
    }
  }

  // ══════════════════════════════════
  // CONVERT tools
  // ══════════════════════════════════
  const doPdfToImg = async (file: File) => {
    setProgressMsg('Loading PDF reader...')
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
    await waitForGlobal('pdfjsLib')
    const pdfjsLib = (window as any).pdfjsLib
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
    await waitForGlobal('JSZip')
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
    const zip = new (window as any).JSZip()
    const folder = zip.folder('pages')!
    for (let i = 1; i <= pdf.numPages; i++) {
      setProgressMsg(`Extracting page ${i} of ${pdf.numPages}...`)
      const page = await pdf.getPage(i)
      const vp = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = vp.width; canvas.height = vp.height
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
      folder.file(`page-${String(i).padStart(3, '0')}.png`, canvas.toDataURL('image/png').split(',')[1], { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    return { blob, name: file.name.replace(/\.[^.]+$/, '') + '_pages.zip' }
  }

  const doPdfToTxt = async (file: File) => {
    setProgressMsg('Extracting text from PDF...')
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
    await waitForGlobal('pdfjsLib')
    const pdfjsLib = (window as any).pdfjsLib
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      setProgressMsg(`Reading page ${i} of ${pdf.numPages}...`)
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((item: any) => item.str).join(' ')
      fullText += `\n--- Page ${i} ---\n${pageText}\n`
    }
    const blob = new Blob([fullText], { type: 'text/plain' })
    return { blob, name: file.name.replace(/\.[^.]+$/, '') + '.txt' }
  }

  const doImgConvert = (file: File, fmt: string, ext: string) => {
    return new Promise<{ blob: Blob; name: string }>((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width; canvas.height = img.height
        canvas.getContext('2d')!.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Conversion failed'))
          URL.revokeObjectURL(url)
          resolve({ blob, name: file.name.replace(/\.[^.]+$/, '') + ext })
        }, fmt, 0.9)
      }
      img.onerror = () => reject(new Error('Cannot load image'))
      img.src = url
    })
  }

  // ── Custom convert handler ──
  const doCustomConvert = async (file: File) => {
    const from = customFrom, to = customTo
    setProgressMsg(`Converting ${from} → ${to}...`)

    if (to === 'PDF') {
      if (from === 'DOCX') return doDocxToPdf(file)
      if (from === 'TXT')  return doTxtToPdf(file)
      if (from === 'CSV')  return doCsvToPdf(file)
      if (from === 'HTML') return doHtmlToPdf(file)
      if (['JPG','PNG','WebP','BMP'].includes(from)) return doImgToPdf(file)
    }
    if (to === 'TXT') {
      if (from === 'PDF') return doPdfToTxt(file)
      if (from === 'CSV') {
        const text = await file.text()
        return { blob: new Blob([text], { type: 'text/plain' }), name: file.name.replace(/\.[^.]+$/, '') + '.txt' }
      }
      if (from === 'HTML') {
        const html = await file.text()
        const tmp = document.createElement('div'); tmp.innerHTML = html
        const text = tmp.innerText || tmp.textContent || ''
        return { blob: new Blob([text], { type: 'text/plain' }), name: file.name.replace(/\.[^.]+$/, '') + '.txt' }
      }
      if (from === 'DOCX') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js')
        await waitForGlobal('mammoth')
        const result = await (window as any).mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
        return { blob: new Blob([result.value || ''], { type: 'text/plain' }), name: file.name.replace(/\.[^.]+$/, '') + '.txt' }
      }
    }
    if (to === 'Images (PNG ZIP)' && from === 'PDF') return doPdfToImg(file)
    if (to === 'PNG'  && ['JPG','WebP','BMP'].includes(from)) return doImgConvert(file, 'image/png', '.png')
    if (to === 'JPG'  && ['PNG','WebP','BMP'].includes(from)) return doImgConvert(file, 'image/jpeg', '.jpg')
    if (to === 'WebP' && ['JPG','PNG','BMP'].includes(from))  return doImgConvert(file, 'image/webp', '.webp')
    throw new Error(`${from} → ${to} conversion is not yet supported.`)
  }

  // ── Main run ──
  const run = async () => {
    if (!file) return
    setStatus('processing'); setErrorMsg(''); setProgressMsg('Starting...'); setDocInfo('')
    try {
      let result: { blob: Blob; name: string }

      if (activeGroup === 'compress') {
        result = await doCompressAny(file)
      } else if (activeGroup === 'to-pdf') {
        switch (toPdfTool.id) {
          case 'docx-to-pdf': result = await doDocxToPdf(file); break
          case 'txt-to-pdf':  result = await doTxtToPdf(file);  break
          case 'img-to-pdf':  result = await doImgToPdf(file);  break
          case 'csv-to-pdf':  result = await doCsvToPdf(file);  break
          case 'html-to-pdf': result = await doHtmlToPdf(file); break
          default: throw new Error('Unknown tool')
        }
      } else {
        switch (convertTool.id) {
          case 'img-to-jpg':     result = await doImgConvert(file, 'image/jpeg', '.jpg'); break
          case 'img-to-png':     result = await doImgConvert(file, 'image/png', '.png');  break
          case 'pdf-to-img':     result = await doPdfToImg(file);    break
          case 'pdf-to-txt':     result = await doPdfToTxt(file);    break
          case 'custom-convert': result = await doCustomConvert(file); break
          default: throw new Error('Unknown tool')
        }
      }

      setDownloadUrl(URL.createObjectURL(result.blob))
      setDownloadName(result.name)
      setOutputSize(result.blob.size)
      setProgressMsg('')
      setStatus('done')
    } catch (e: any) {
      setStatus('error'); setProgressMsg('')
      setErrorMsg(e?.message || 'Something went wrong. Please try again.')
    }
  }

  const isCompress = activeGroup === 'compress'
  const isToPdf    = activeGroup === 'to-pdf'
  const isConvert  = activeGroup === 'convert'
  const isCustom   = isConvert && convertTool.id === 'custom-convert'

  const compressResultFits = outputSize !== null && compressTargetBytes ? outputSize <= compressTargetBytes : true
  const pdfResultFits      = outputSize !== null && targetBytes ? outputSize <= targetBytes : true
  const fitsTarget         = isCompress ? compressResultFits : pdfResultFits

  const getAcceptStr = getAccept()

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
            <button key={g.id} onClick={() => handleGroup(g.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                activeGroup === g.id
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'bg-card border-border/60 text-muted-foreground hover:border-emerald-500/30'
              }`}>
              {g.emoji} {g.label}
            </button>
          ))}
        </div>

        {/* ── TO-PDF tool grid ── */}
        <AnimatePresence>
          {isToPdf && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TO_PDF_TOOLS.map((t) => (
                  <button key={t.id} onClick={() => { setToPdfTool(t); reset() }}
                    className={`relative p-4 rounded-2xl border text-left transition-all ${
                      toPdfTool.id === t.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-border/60 bg-card hover:border-emerald-500/30'
                    }`}>
                    {t.tag && <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TAG_STYLES[t.tagColor]}`}>{t.tag}</span>}
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <div className="text-sm font-bold text-foreground">{t.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.desc}</div>
                  </button>
                ))}
              </div>

              {/* DOCX info */}
              {toPdfTool.id === 'docx-to-pdf' && (
                <div className="mt-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-xs font-bold text-emerald-400 mb-2">Handles automatically</p>
                  <div className="grid grid-cols-3 gap-1.5 text-xs text-muted-foreground">
                    {['📝 Text docs','🖼️ Docs with images','📊 Tables','📄 Mixed content','🗜️ KB/MB target','🎥 Videos → note'].map(item => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>


        {/* ── CONVERT tool grid + custom ── */}
        <AnimatePresence>
          {isConvert && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CONVERT_TOOLS.map((t) => (
                  <button key={t.id} onClick={() => { setConvertTool(t); reset() }}
                    className={`relative p-4 rounded-2xl border text-left transition-all ${
                      convertTool.id === t.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-border/60 bg-card hover:border-emerald-500/30'
                    }`}>
                    {t.tag && <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TAG_STYLES[t.tagColor]}`}>{t.tag}</span>}
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <div className="text-sm font-bold text-foreground">{t.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>

              {/* Custom convert FROM → TO selector */}
              {isCustom && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 space-y-4">
                  <p className="text-sm font-bold text-violet-400">Choose conversion</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* FROM */}
                    <div className="flex-1 min-w-[120px]">
                      <p className="text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">From</p>
                      <select
                        value={customFrom}
                        onChange={(e) => {
                          setCustomFrom(e.target.value)
                          const toOptions = CUSTOM_TO_FORMATS[e.target.value] || []
                          setCustomTo(toOptions[0] || '')
                          reset()
                        }}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm font-semibold"
                      >
                        {CUSTOM_FROM_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center pt-5">
                      <ArrowRight className="w-5 h-5 text-violet-400" />
                    </div>

                    {/* TO */}
                    <div className="flex-1 min-w-[120px]">
                      <p className="text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">To</p>
                      <select
                        value={customTo}
                        onChange={(e) => { setCustomTo(e.target.value); reset() }}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm font-semibold"
                      >
                        {(CUSTOM_TO_FORMATS[customFrom] || []).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {customFrom && customTo && (
                    <p className="text-xs text-violet-400">
                      Will convert: <span className="font-bold">{customFrom}</span> → <span className="font-bold">{customTo}</span>
                      {' · '}
                      <span className="text-muted-foreground">Upload a .{customFrom.toLowerCase()} file below</span>
                    </p>
                  )}
                </motion.div>
              )}
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
          <input ref={fileRef} type="file" accept={getAcceptStr} className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="file" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Size: <span className="text-amber-400 font-semibold">{formatSize(file.size)}</span>
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); reset() }} className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
                  <X className="w-3 h-3" /> Remove
                </button>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-semibold text-foreground">
                    {isCompress ? 'Drop any file to compress' :
                     isCustom   ? `Drop your ${customFrom} file here` :
                     isToPdf    ? <>Drop your <span className="text-emerald-500">{toPdfTool.label.split('→')[0].trim()}</span> file here</> :
                                  <>Drop your <span className="text-emerald-500">{convertTool.label.split('→')[0].trim()}</span> file here</>
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {file && (
          <button onClick={() => fileRef.current?.click()} className="w-full mb-4 py-2 text-sm text-muted-foreground hover:text-emerald-500 border border-border/40 rounded-xl transition-colors">
            Choose a different file
          </button>
        )}

        {/* ── PDF target size — shown after file is uploaded ── */}
        <AnimatePresence>
          {isToPdf && file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-bold text-foreground">
                    Target File Size
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the max KB you need the PDF to be. The converter will automatically reduce quality until it fits.
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number" min="10" placeholder="e.g. 500"
                      value={targetKB}
                      onChange={(e) => setTargetKB(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-500">KB</span>
                  </div>
                  {targetKB && (
                    <button onClick={() => setTargetKB('')} className="p-3 rounded-xl border border-border/60 text-muted-foreground hover:text-red-400 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['100','200','500','1000','2000'].map(kb => (
                    <button key={kb} onClick={() => setTargetKB(kb)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        targetKB === kb
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'border-border/60 text-muted-foreground hover:border-emerald-500/30'
                      }`}>
                      {parseInt(kb) >= 1000 ? `${parseInt(kb)/1000}MB` : `${kb}KB`}
                    </button>
                  ))}
                </div>
                {targetKB && (
                  <p className="text-xs text-emerald-400">
                    ✅ PDF will be compressed to fit within <span className="font-bold">{targetKB} KB</span>
                    {parseInt(targetKB) >= 1000 && <span> ({(parseInt(targetKB)/1024).toFixed(1)} MB)</span>}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* ── COMPRESS settings (shown after file upload) ── */}
        <AnimatePresence>
          {isCompress && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6 space-y-4">

              {/* Target size input */}
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-bold text-foreground">
                    Target File Size
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Enter the maximum size you need. The converter will automatically compress to fit. Upload a file above to see quality prediction.</p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input type="number" min="1"
                      placeholder={compressTargetUnit === 'KB' ? 'e.g. 500' : 'e.g. 2'}
                      value={compressTargetValue}
                      onChange={(e) => setCompressTargetValue(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5">
                      {(['KB','MB'] as const).map(u => (
                        <button key={u} onClick={() => setCompressTargetUnit(u)}
                          className={`text-xs px-2 py-1 rounded-lg font-bold transition-all ${compressTargetUnit === u ? 'bg-emerald-500 text-white' : 'text-muted-foreground hover:text-emerald-400'}`}>
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                  {compressTargetValue && (
                    <button onClick={() => setCompressTargetValue('')} className="p-3 rounded-xl border border-border/60 text-muted-foreground hover:text-red-400 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Quick presets */}
                <div className="flex gap-2 flex-wrap">
                  {[{v:'100',u:'KB'},{v:'200',u:'KB'},{v:'500',u:'KB'},{v:'1',u:'MB'},{v:'2',u:'MB'},{v:'5',u:'MB'}].map(p => (
                    <button key={p.v+p.u}
                      onClick={() => { setCompressTargetValue(p.v); setCompressTargetUnit(p.u as 'KB'|'MB') }}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        compressTargetValue === p.v && compressTargetUnit === p.u
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'border-border/60 text-muted-foreground hover:border-emerald-500/30'
                      }`}>
                      {p.v}{p.u}
                    </button>
                  ))}
                </div>

                {/* Live quality prediction — only for images with target set */}
                {file && file.type.startsWith('image/') && compressTargetValue && (() => {
                  const pred = getQualityPrediction(file.size, compressTargetValue, compressTargetUnit)
                  if (!pred) return null
                  return (
                    <div className={`mt-2 p-3 rounded-xl border ${
                      pred.color === 'text-emerald-400' ? 'border-emerald-500/30 bg-emerald-500/5' :
                      pred.color === 'text-yellow-400'  ? 'border-yellow-500/30 bg-yellow-500/5' :
                      pred.color === 'text-orange-400'  ? 'border-orange-500/30 bg-orange-500/5' :
                                                          'border-red-500/30 bg-red-500/5'
                    }`}>
                      <p className={`text-sm font-bold ${pred.color}`}>{pred.emoji} {pred.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{pred.detail}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Compressing from <span className="font-semibold text-amber-400">{formatSize(file.size)}</span>
                        {' '}to <span className="font-semibold text-emerald-400">{compressTargetValue}{compressTargetUnit}</span>
                        {' '}({Math.round((parseFloat(compressTargetValue) * (compressTargetUnit === 'MB' ? 1024 * 1024 : 1024)) / file.size * 100)}% of original)
                      </p>
                    </div>
                  )
                })()}

                {/* For non-image files, just show a simple note */}
                {file && !file.type.startsWith('image/') && compressTargetValue && (
                  <div className="mt-2 p-3 rounded-xl border border-sky-500/20 bg-sky-500/5">
                    <p className="text-xs text-sky-400">
                      📦 Will compress into ZIP and try to reach {compressTargetValue}{compressTargetUnit}.
                      Note: ZIP compression works best on text files (DOCX, TXT, CSV). Already-compressed files (JPG, MP4, ZIP) may not shrink much.
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Accepts any file: <span className="text-emerald-400">PDF · DOCX · TXT · JPG · PNG · PPTX · XLSX · any</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress */}
        <AnimatePresence>
          {status === 'processing' && progressMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin flex-shrink-0" />
              <p className="text-sm text-emerald-400">{progressMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action button */}
        <button onClick={run} disabled={!file || status === 'processing'}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg mb-6">
          {status === 'processing'
            ? <><RefreshCw className="w-5 h-5 animate-spin" /> Processing...</>
            : isCompress
              ? <>📦 Compress {compressTargetValue ? `to ${compressTargetValue}${compressTargetUnit}` : `(${ZIP_LEVELS[selectedQualityIdx]?.label ?? 'Recommended'})`}</>
              : isCustom
                ? <>⚙️ Convert {customFrom} → {customTo}</>
                : isToPdf
                  ? <>{toPdfTool.icon} Convert to PDF{targetKB ? ` (max ${targetKB}KB)` : ''}</>
                  : <>{convertTool.icon} {convertTool.label}</>
          }
        </button>

        {/* Result */}
        <AnimatePresence>
          {status === 'done' && downloadUrl && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`rounded-2xl border p-6 mb-4 ${fitsTarget ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1">
                  {fitsTarget
                    ? <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  }
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-foreground">
                      {fitsTarget ? (isCompress ? 'Compressed!' : 'Converted!') : 'Done — slightly over target'}
                    </p>
                    <p className="text-sm text-muted-foreground">{downloadName}</p>
                    {docInfo && <p className="text-xs text-emerald-400">Detected: {docInfo}</p>}
                    {outputSize !== null && file && (
                      <p className="text-sm">
                        {formatSize(file.size)} → <span className={`font-semibold ${fitsTarget ? 'text-emerald-400' : 'text-amber-400'}`}>{formatSize(outputSize)}</span>
                        {outputSize < file.size && <span className="text-xs text-emerald-400 ml-2">({Math.round((1 - outputSize / file.size) * 100)}% smaller)</span>}
                      </p>
                    )}
                    {!fitsTarget && <p className="text-xs text-amber-400">⚠️ Content is too dense to compress further</p>}
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
            { icon: '⚡', title: 'Auto-compress',   desc: 'Fits your KB/MB target automatically' },
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