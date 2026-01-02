'use client'

import { useState, useCallback, useRef } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Scanner } from '@yudiel/react-qr-scanner'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Shield,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStudentRecord } from '@/hooks/hospitality/useStudentMutation'
import { isValidHospitalityID, getStatusLabel, getStatusColor, type HospitalityID } from '@/types/hospitality'

export const Route = createFileRoute('/hospitality/security/')({
  component: SecurityScanner,
})

function SecurityScanner() {
  const [scannedHospId, setScannedHospId] = useState<HospitalityID | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScannedRef = useRef<string | null>(null)

  const { data: studentResponse, isLoading: isLoadingStudent } = useStudentRecord(scannedHospId || undefined)

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
      setScannedHospId(hospId)
      setShowDetailsModal(true)
      setIsProcessing(false)
    },
    [isProcessing, scanResult, showResultFeedback]
  )

  const handleError = (err: any) => {
    console.error('Camera Error:', err)
  }

  const closeModal = () => {
    setShowDetailsModal(false)
    setScannedHospId(null)
    lastScannedRef.current = null
  }

  const previewStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    objectFit: 'cover' as const,
  }

  const formatDateTime = (isoString: string | undefined) => {
    if (!isoString) return 'N/A'
    return new Date(isoString).toLocaleString()
  }

  // Scanner view with modal
  return (
    <>
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
          <Link
            to="/hospitality"
            className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} />
          </Link>
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <p className="text-xs text-white/70 font-medium uppercase tracking-widest text-center">
              Security Scanner
            </p>
          </div>
          <div className="w-10" />
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

      {/* Student Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Student Verification
            </DialogTitle>
          </DialogHeader>

          {isLoadingStudent && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}

          {studentResponse && !studentResponse.success && (
            <div className="py-8 text-center">
              <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="font-medium text-destructive">Not Found</p>
              <p className="text-sm text-muted-foreground mt-2">{studentResponse.error}</p>
            </div>
          )}

          {student && (
            <div className="space-y-4">
              {/* Hospitality ID Badge */}
              <div className="text-center py-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Hospitality ID</p>
                <p className="text-2xl font-mono font-bold text-primary">
                  {student.hospitality_id}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant={getStatusColor(student.accommodation_status)} className="text-sm">
                  {getStatusLabel(student.accommodation_status)}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {student.student_type.replace('_', ' ')}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {student.accommodation_type === 'HOSTEL' ? 'Hostel' : 'Day Scholar'}
                </Badge>
              </div>

              {/* Profile Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{student.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{student.college}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{student.student_id}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Accommodation Info */}
              {student.accommodation_type === 'HOSTEL' && student.hostel_name && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Accommodation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{student.hostel_name}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timestamps */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Check-in: {formatDateTime(student.check_in_date)}</span>
                  </div>
                  {student.payment_timestamp && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Payment: {formatDateTime(student.payment_timestamp)}</span>
                    </div>
                  )}
                  {student.hostel_check_in_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Hostel Check-in: {formatDateTime(student.hostel_check_in_date)}</span>
                    </div>
                  )}
                  {student.check_out_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Check-out: {formatDateTime(student.check_out_date)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Daily Check-ins */}
              {student.daily_check_ins && student.daily_check_ins.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Daily Check-ins ({student.daily_check_ins.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm max-h-32 overflow-y-auto">
                    {student.daily_check_ins.map((entry, idx) => (
                      <div key={idx} className="flex justify-between text-xs border-b pb-1">
                        <span>{entry.date}</span>
                        <span>
                          In: {new Date(entry.check_in_time).toLocaleTimeString()}
                          {entry.check_out_time &&
                            ` | Out: ${new Date(entry.check_out_time).toLocaleTimeString()}`}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button className="w-full" onClick={closeModal}>
                Close & Scan Another
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
