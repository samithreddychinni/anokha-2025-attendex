'use client'

import { useState, useCallback, useRef } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Scanner } from '@yudiel/react-qr-scanner'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  X,
  Shield,
} from 'lucide-react'
import { isValidHospitalityID } from '@/types/hospitality'
import { clearHospitalitySession } from '@/components/Login'

export const Route = createFileRoute('/hospitality/security/')({
  component: SecurityScanner,
})

function SecurityScanner() {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleLogout = () => {
    clearHospitalitySession()
  }
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null)

  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScannedRef = useRef<string | null>(null)
  const isShowingOverlayRef = useRef<boolean>(false)

  const showResultFeedback = useCallback((type: 'success' | 'error') => {
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? 200 : 500)
    }
    isShowingOverlayRef.current = true
    setScanResult(type)
    if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current)
    resultTimeoutRef.current = setTimeout(() => {
      setScanResult(null)
      isShowingOverlayRef.current = false
    }, 2000)
  }, [])

  const handleScan = useCallback(
    (result: any) => {
      if (!result || isProcessing || scanResult) return
      if (isShowingOverlayRef.current) return

      const rawText = result?.[0]?.rawValue
      if (!rawText) return

      if (rawText === lastScannedRef.current) return

      setIsProcessing(true)
      lastScannedRef.current = rawText

      setTimeout(() => {
        lastScannedRef.current = null
      }, 3000)

      const hospId = rawText.trim().toUpperCase()

      if (!isValidHospitalityID(hospId)) {
        showResultFeedback('error')
        toast.error('Invalid ID', {
          description: 'Please scan a valid Hospitality ID (e.g., A123)',
          position: 'bottom-center',
        })
        setIsProcessing(false)
        return
      }

      showResultFeedback('success')

      // Delay navigation to show green screen
      setTimeout(() => {
        navigate({ to: '/hospitality/security/$hospId', params: { hospId } })
        setIsProcessing(false)
      }, 1500)
    },
    [isProcessing, scanResult, showResultFeedback, navigate]
  )

  const handleError = (err: any) => {
    console.error('Camera Error:', err)
  }

  const previewStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    objectFit: 'cover' as const,
  }

  // Scanner view
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {scanResult && (
        <div
          className={`absolute inset-0 z-[60] flex items-center justify-center transition-opacity duration-300 ${
            scanResult === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'
          }`}
        >
          {scanResult === 'success' ? (
            <CheckCircle2 className="w-32 h-32 text-white animate-pulse" strokeWidth={2} />
          ) : (
            <XCircle className="w-32 h-32 text-white animate-pulse" strokeWidth={2} />
          )}
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
        <div className="w-10" />
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <p className="text-xs text-white/70 font-medium uppercase tracking-widest text-center">
            Security Scanner
          </p>
        </div>
        <Link
          to="/login"
          onClick={handleLogout}
          className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"
        >
          <X size={24} />
        </Link>
      </div>

      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <Scanner
          scanDelay={300}
          onError={handleError}
          onScan={handleScan}
          constraints={{ facingMode: 'environment' }}
          styles={{ video: previewStyle }}
        />
      </div>

      <div className="bg-background pb-8 pt-6 px-6 rounded-t-3xl -mt-6 relative z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Security Verification</h2>
          </div>
          <p className="text-center text-muted-foreground text-sm">
            Scan the Hospitality ID to view student details
          </p>
        </div>
      </div>
    </div>
  )
}
