'use client'

import { useState, useCallback, useRef } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Scanner } from '@yudiel/react-qr-scanner'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  X,
  LogOut,
  LogIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudentCard } from '@/components/hospitality/StudentCard'
import { ConfirmationModal } from '@/components/hospitality/ConfirmationModal'
import {
  useStudentRecord,
  useDailyCheckInOut,
  useFinalCheckOut,
} from '@/hooks/hospitality/useStudentMutation'
import { isValidHospitalityID, type HospitalityID } from '@/types/hospitality'

export const Route = createFileRoute('/hospitality/hosp1/checkout')({
  component: Hosp1Checkout,
})

function Hosp1Checkout() {
  const [scannedHospId, setScannedHospId] = useState<HospitalityID | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'daily_in' | 'daily_out' | 'final' | null>(null)

  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScannedRef = useRef<string | null>(null)

  const { data: studentResponse, isLoading: isLoadingStudent } = useStudentRecord(scannedHospId || undefined)
  const dailyCheckInOutMutation = useDailyCheckInOut()
  const finalCheckOutMutation = useFinalCheckOut()

  const student = studentResponse?.success ? studentResponse.data : null

  const showResultFeedback = useCallback((type: 'success' | 'error') => {
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? 200 : 500)
    }
    setScanResult(type)
    if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current)
    resultTimeoutRef.current = setTimeout(() => {
      setScanResult(null)
    }, 2000)
  }, [])

  const handleScan = useCallback(
    (result: any) => {
      if (!result || isProcessing || scanResult) return

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

      // Delay transition to show green screen for 1.5 seconds
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

  const handleConfirmAction = async () => {
    if (!scannedHospId || !confirmAction) return

    let success = false

    if (confirmAction === 'final') {
      const result = await finalCheckOutMutation.mutateAsync(scannedHospId)
      success = result.success
    } else {
      const result = await dailyCheckInOutMutation.mutateAsync({
        hospId: scannedHospId,
        isCheckingOut: confirmAction === 'daily_out',
      })
      success = result.success
    }

    setShowConfirmModal(false)
    setConfirmAction(null)

    if (success) {
      setScannedHospId(null)
    }
  }

  const openConfirmModal = (action: 'daily_in' | 'daily_out' | 'final') => {
    setConfirmAction(action)
    setShowConfirmModal(true)
  }

  const resetScanner = () => {
    setScannedHospId(null)
    lastScannedRef.current = null
  }

  // Get today's check-in status for daily students
  const getTodayCheckInStatus = () => {
    if (!student || student.accommodation_status !== 'NONE') return null

    const today = new Date().toISOString().split('T')[0]
    const todayRecord = student.daily_check_ins?.find((d) => d.date === today)

    if (!todayRecord) return 'not_checked_in'
    if (todayRecord.check_out_time) return 'checked_out'
    return 'checked_in'
  }

  const todayStatus = getTodayCheckInStatus()

  const previewStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    objectFit: 'cover' as const,
  }

  // Show student details after scan
  if (scannedHospId && student) {
    return (
      <div className="min-h-[calc(100vh-80px)] p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header with X button on right */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Check-out</h1>
              <p className="text-sm text-muted-foreground">Process check-out for student</p>
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
            {student.accommodation_status === 'NONE' && (
              <>
                {todayStatus === 'not_checked_in' && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => openConfirmModal('daily_in')}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Daily Check-in
                  </Button>
                )}
                {todayStatus === 'checked_in' && (
                  <Button
                    className="w-full"
                    size="lg"
                    variant="destructive"
                    onClick={() => openConfirmModal('daily_out')}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Daily Check-out
                  </Button>
                )}
                {todayStatus === 'checked_out' && (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Already checked out for today
                    </p>
                  </div>
                )}
              </>
            )}

            {student.accommodation_status === 'CHECKED_IN' && (
              <Button
                className="w-full"
                size="lg"
                variant="destructive"
                onClick={() => openConfirmModal('final')}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Final Hostel Check-out
              </Button>
            )}

            {student.accommodation_status === 'CHECKED_OUT' && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Student has already checked out
                </p>
              </div>
            )}

            {(student.accommodation_status === 'REQUESTED' ||
              student.accommodation_status === 'PAID') && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Cannot check out. Current status: {student.accommodation_status}
                  </p>
                </div>
              )}
          </div>


        </div>

        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false)
            setConfirmAction(null)
          }}
          onConfirm={handleConfirmAction}
          title={
            confirmAction === 'final'
              ? 'Final Check-out'
              : confirmAction === 'daily_out'
                ? 'Daily Check-out'
                : 'Daily Check-in'
          }
          description={
            confirmAction === 'final'
              ? `Complete final hostel check-out for ${student.name}? This action cannot be undone.`
              : confirmAction === 'daily_out'
                ? `Process daily check-out for ${student.name}?`
                : `Process daily check-in for ${student.name}?`
          }
          confirmText={confirmAction === 'final' ? 'Final Check-out' : 'Confirm'}
          variant={confirmAction === 'final' ? 'destructive' : 'default'}
          isLoading={dailyCheckInOutMutation.isPending || finalCheckOutMutation.isPending}
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
              <h1 className="text-xl font-bold">Check-out</h1>
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

          <Button className="w-full" onClick={resetScanner}>
            Scan Again
          </Button>
        </div>
      </div>
    )
  }

  // Scanner view
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {scanResult && (
        <div
          className={`absolute inset-0 z-[60] flex items-center justify-center transition-opacity duration-300 ${scanResult === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'
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
            Scan to Check-out
          </p>
        </div>
        <Link
          to="/hospitality/hosp1"
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
            <LogOut className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Check-out Scanner</h2>
          </div>
          <p className="text-center text-muted-foreground text-sm">
            Scan the Hospitality ID to process check-out
          </p>
        </div>
      </div>
    </div>
  )
}
