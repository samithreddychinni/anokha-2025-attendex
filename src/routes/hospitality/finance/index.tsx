'use client'

import { useState, useCallback, useRef } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Scanner } from '@yudiel/react-qr-scanner'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  X,
  Wallet,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudentCard } from '@/components/hospitality/StudentCard'
import { ConfirmationModal } from '@/components/hospitality/ConfirmationModal'
import {
  useStudentRecord,
  useProcessPayment,
} from '@/hooks/hospitality/useStudentMutation'
import { isValidHospitalityID, type HospitalityID } from '@/types/hospitality'

export const Route = createFileRoute('/hospitality/finance/')({
  component: FinanceScanner,
})

function FinanceScanner() {
  const [scannedHospId, setScannedHospId] = useState<HospitalityID | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScannedRef = useRef<string | null>(null)
  const isShowingOverlayRef = useRef<boolean>(false)

  const { data: studentResponse, isLoading: isLoadingStudent } = useStudentRecord(scannedHospId || undefined)
  const processPaymentMutation = useProcessPayment()

  const student = studentResponse?.success ? studentResponse.data : null

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

      // Delay transition to show green screen
      setTimeout(() => {
        setScannedHospId(hospId)
        setIsProcessing(false)
      }, 1500)
    },
    [isProcessing, scanResult, showResultFeedback]
  )

  const handleError = (err: any) => {
    console.error('Camera Error:', err)
  }

  const handleConfirmPayment = async () => {
    if (!scannedHospId) return

    const result = await processPaymentMutation.mutateAsync(scannedHospId)

    setShowConfirmModal(false)

    if (result.success) {
      toast.success('Payment Verified', {
        description: 'Redirect student to HOSP 2 for hostel check-in',
        position: 'bottom-center',
      })
      setScannedHospId(null)
    }
  }

  const resetScanner = () => {
    setScannedHospId(null)
    lastScannedRef.current = null
    isShowingOverlayRef.current = false
  }

  const previewStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    objectFit: 'cover' as const,
  }

  // Show student details after scan
  if (scannedHospId && student) {
    const canProcessPayment = student.accommodation_status === 'REQUESTED'

    return (
      <div className="min-h-[calc(100vh-80px)] p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header with X button on right */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Finance</h1>
              <p className="text-sm text-muted-foreground">Payment Verification</p>
            </div>
            <button
              onClick={resetScanner}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <StudentCard student={student} showStatus />

          {/* Action buttons based on status */}
          <div className="space-y-3">
            {canProcessPayment ? (
              <Button
                className="w-full h-14 text-lg"
                size="lg"
                onClick={() => setShowConfirmModal(true)}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Accept Payment
              </Button>
            ) : (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {student.accommodation_status === 'PAID'
                    ? 'Payment already processed. Redirect to HOSP 2.'
                    : student.accommodation_status === 'CHECKED_IN'
                      ? 'Student already checked into hostel.'
                      : student.accommodation_status === 'CHECKED_OUT'
                        ? 'Student has already checked out.'
                        : student.accommodation_status === 'NONE'
                          ? 'No payment required (Day Scholar).'
                          : `Cannot process payment. Status: ${student.accommodation_status}`}
                </p>
              </div>
            )}
          </div>
        </div>

        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmPayment}
          title="Confirm Payment"
          description={`Confirm payment received from ${student.name} for hostel accommodation at ${student.hostel_name}?`}
          confirmText="Accept Payment"
          isLoading={processPaymentMutation.isPending}
        />
      </div>
    )
  }

  // Show loading state
  if (scannedHospId && isLoadingStudent) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading student details...</p>
        </div>
      </div>
    )
  }

  // Show error if student not found
  if (scannedHospId && studentResponse && !studentResponse.success) {
    return (
      <div className="min-h-[calc(100vh-80px)] p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header with X button on right */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Finance</h1>
              <p className="text-sm text-muted-foreground">Student not found</p>
            </div>
            <button
              onClick={resetScanner}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center p-8 bg-destructive/10 rounded-lg">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="font-medium text-destructive">Student Not Found</p>
            <p className="text-sm text-muted-foreground mt-2">{studentResponse.error}</p>
          </div>
        </div>
      </div>
    )
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
            Finance Scanner
          </p>
        </div>
        <Link
          to="/hospitality"
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
            <Wallet className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Payment Verification</h2>
          </div>
          <p className="text-center text-muted-foreground text-sm">
            Scan the Hospitality ID to verify payment
          </p>
        </div>
      </div>
    </div>
  )
}
