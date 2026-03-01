'use client'
// app/upload/page.tsx
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, ArrowLeft, Upload, FileText, File, CheckCircle, AlertCircle, X } from 'lucide-react'

const ACCEPTED = ['.pdf', '.docx', '.txt', '.md']
const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
]

type UploadStatus = 'idle' | 'dragging' | 'uploading' | 'success' | 'error'

interface UploadResult {
  id: string
  title: string
  fileName: string
  contentLength: number
}

export default function UploadPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<UploadResult | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFile = useCallback((f: File) => {
    setError('')
    setResult(null)
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.')
      return
    }
    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED.includes(ext) && !ACCEPTED_MIME.includes(f.type)) {
      setError(`Unsupported file type. Please use: ${ACCEPTED.join(', ')}`)
      return
    }
    setFile(f)
    // Auto-fill title from filename
    const autoTitle = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    setTitle(autoTitle)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setStatus('idle')
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  async function upload() {
    if (!file) return
    setStatus('uploading')
    setError('')
    setProgress(0)

    // Fake progress animation
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 85))
    }, 200)

    const formData = new FormData()
    formData.append('file', file)
    if (title.trim()) formData.append('title', title.trim())

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      clearInterval(interval)
      setProgress(100)

      if (res.ok) {
        const data = await res.json()
        setResult(data.item)
        setStatus('success')
      } else {
        const data = await res.json()
        setError(data.error || 'Upload failed')
        setStatus('error')
      }
    } catch {
      clearInterval(interval)
      setError('Network error. Please try again.')
      setStatus('error')
    }
  }

  const fileIcon = file?.name.endsWith('.pdf')
    ? <FileText className="w-8 h-8 text-red-400" aria-hidden="true" />
    : <File className="w-8 h-8 text-blue-400" aria-hidden="true" />

  return (
    <main className="min-h-screen bg-ink-950" role="main">
      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 border-b border-ink-800/50 backdrop-blur-md bg-ink-950/80">
        <Link href="/" className="flex items-center gap-2" aria-label="Second Brain home">
          <Brain className="w-5 h-5 text-amber-500" aria-hidden="true" />
          <span className="font-display text-lg text-ink-100">Second Brain</span>
        </Link>
        <Link href="/dashboard" className="flex items-center gap-2 text-ink-400 hover:text-ink-200 text-sm transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Dashboard
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-mono tracking-widest uppercase mb-3">
            <Upload className="w-3 h-3" aria-hidden="true" />
            Document Upload
          </div>
          <h1 className="font-display text-5xl text-ink-50 mb-2">Upload a file</h1>
          <p className="text-ink-500 text-sm">
            PDF, DOCX, TXT, or MD — we'll extract the text and AI-enrich it automatically.
          </p>
        </div>

        {/* Success state */}
        {status === 'success' && result && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 p-5 bg-green-500/10 border border-green-500/20 rounded-2xl"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="text-green-300 font-medium mb-1">Upload successful!</div>
                <div className="text-ink-400 text-sm">{result.fileName} → "{result.title}"</div>
                <div className="text-ink-600 text-xs mt-1">{result.contentLength.toLocaleString()} characters extracted · AI is summarizing in background</div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link
                href="/dashboard"
                className="flex-1 text-center py-2.5 bg-amber-600 hover:bg-amber-500 text-ink-950 font-medium rounded-xl text-sm transition-all"
              >
                View in Dashboard
              </Link>
              <button
                onClick={() => { setFile(null); setTitle(''); setStatus('idle'); setResult(null) }}
                className="flex-1 py-2.5 border border-ink-700 hover:border-ink-500 text-ink-400 rounded-xl text-sm transition-all"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}

        {status !== 'success' && (
          <>
            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Drop zone for file upload. Click or drag a file here."
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setStatus('dragging') }}
              onDragLeave={() => setStatus('idle')}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              className={`relative mb-6 p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center
                ${status === 'dragging'
                  ? 'border-amber-500 bg-amber-500/5'
                  : file
                  ? 'border-ink-700 bg-ink-900'
                  : 'border-ink-800 bg-ink-900/50 hover:border-ink-600 hover:bg-ink-900'
                }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(',')}
                className="sr-only"
                aria-label="File input"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  {fileIcon}
                  <div>
                    <div className="text-ink-200 font-medium">{file.name}</div>
                    <div className="text-ink-600 text-xs mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setTitle(''); setError('') }}
                    className="p-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-500 hover:text-ink-300 transition-all"
                    aria-label="Remove selected file"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-ink-800 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-ink-500" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-ink-300 font-medium mb-1">Drop your file here</div>
                    <div className="text-ink-600 text-sm">or click to browse</div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {ACCEPTED.map((ext) => (
                      <span key={ext} className="text-xs font-mono px-2 py-0.5 bg-ink-800 text-ink-500 rounded">
                        {ext}
                      </span>
                    ))}
                  </div>
                  <div className="text-ink-700 text-xs">Max 10MB</div>
                </div>
              )}
            </div>

            {/* Title input */}
            {file && (
              <div className="mb-6">
                <label htmlFor="upload-title" className="block text-ink-400 text-xs font-mono tracking-wider uppercase mb-2">
                  Title <span className="text-ink-700 normal-case font-sans tracking-normal">(auto-filled from filename)</span>
                </label>
                <input
                  id="upload-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-ink-900 border border-ink-800 focus:border-amber-600/50 rounded-xl text-ink-100 placeholder-ink-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all text-sm"
                  placeholder="Give this document a title"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div role="alert" aria-live="assertive" className="mb-4 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                {error}
              </div>
            )}

            {/* Progress bar */}
            {status === 'uploading' && (
              <div className="mb-4" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
                <div className="flex justify-between text-xs font-mono text-ink-600 mb-1.5">
                  <span>Uploading & extracting text...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-ink-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload button */}
            <button
              onClick={upload}
              disabled={!file || status === 'uploading'}
              className="w-full flex items-center justify-center gap-2 py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-ink-950 font-semibold rounded-xl transition-all text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-ink-950"
              aria-busy={status === 'uploading'}
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              {status === 'uploading' ? 'Processing...' : 'Upload & Extract'}
            </button>

            <p className="text-center text-ink-700 text-xs mt-4">
              Text is extracted server-side. Files are not permanently stored.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
