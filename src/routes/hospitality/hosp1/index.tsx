'use client'

import { useState, useCallback } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Scanner } from '@yudiel/react-qr-scanner'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  QrCode,
  IdCard,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HostelSelector } from '@/components/hospitality/HostelSelector'
import { ConfirmationModal } from '@/components/hospitality/ConfirmationModal'
import { useHospitalityScanner } from '@/hooks/hospitality/useHospitalityScanner'
import {
  useHostels,
  useCreateStudentMapping,
} from '@/hooks/hospitality/useStudentMutation'

export const Route = createFileRoute('/hospitality/hosp1/')({
  component: Hosp1Scanner,
})

function Hosp1Scanner() {
  const navigate = useNavigate()
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const {
    state,
    handleProfileQRScan,
    handleHospIdScan,
    setSelectedHostel,
    reset,
    goBack,
  } = useHospitalityScanner()

  const { data: hostelsResponse, isLoading: isLoadingHostels } = useHostels()
  const createMappingMutation = useCreateStudentMapping()

  const hostels = hostelsResponse?.success ? hostelsResponse.data?.hostels || [] : []

  // Determine if student needs hostel based on student_type from profile
  // EXTERNAL students need hostel, AMRITA_SISTER can choose
  const needsHostel = state.studentProfile?.student_type === 'EXTERNAL'

  // Handle QR scan based on current step
  // IMPORTANT: Don't process scans while overlay is showing (success or error)
  const handleScan = useCallback(
    async (result: any) => {
      // Block ALL scans while overlay is showing or processing
      if (!result || state.isProcessing || state.scanResult) return

      const rawText = result?.[0]?.rawValue
      if (!rawText) return

      if (state.step === 'PROFILE_QR') {
        const success = await handleProfileQRScan(rawText)
        if (!success) {
          toast.error('Invalid QR', {
            description: 'Please scan a valid Profile QR code',
            position: 'bottom-center',
          })
        }
      } else if (state.step === 'HOSP_ID') {
        const success = await handleHospIdScan(rawText)
        if (!success) {
          toast.error('Invalid ID', {
            description: 'Please scan a valid Hospitality ID (e.g., A123)',
            position: 'bottom-center',
          })
        }
      }
    },
    [state.step, state.isProcessing, state.scanResult, handleProfileQRScan, handleHospIdScan]
  )

  const handleError = (err: any) => {
    console.error('Camera Error:', err)
  }

  // Confirm and create mapping
  const handleConfirmMapping = async () => {
    if (!state.scannedStudentId || !state.scannedHospId) {
      return
    }

    // Determine accommodation type based on hostel selection
    const accommodationType = state.selectedHostel ? 'HOSTEL' : 'NONE'

    const result = await createMappingMutation.mutateAsync({
      student_id: state.scannedStudentId,
      hospitality_id: state.scannedHospId,
      accommodation_type: accommodationType,
      hostel_name: state.selectedHostel?.name,
    })

    setShowConfirmModal(false)

    if (result.success && result.data) {
      const status = result.data.accommodation_status
      if (status === 'REQUESTED') {
        toast.message('Redirect to Finance', {
          description: 'Student needs to complete payment first',
          position: 'bottom-center',
        })
      } else if (status === 'PAID') {
        toast.message('Redirect to HOSP 2', {
          description: 'Student can proceed to hostel check-in',
          position: 'bottom-center',
        })
      } else {
        toast.success('Registration Complete', {
          description: 'Student registered as day scholar',
          position: 'bottom-center',
        })
      }
      reset()
    }
  }

  // Check if we can proceed to confirmation
  const canProceedToConfirm = needsHostel ? !!state.selectedHostel : true

  const previewStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    objectFit: 'cover' as const,
  }

  // Render scanner view for PROFILE_QR and HOSP_ID steps
  if (state.step === 'PROFILE_QR' || state.step === 'HOSP_ID') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Scan result overlay - blocks all interactions */}
        {state.scanResult && (
          <div
            className={`absolute inset-0 z-[60] flex items-center justify-center transition-opacity duration-300 ${
              state.scanResult === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
            }`}
          >
            {state.scanResult === 'success' ? (
              <CheckCircle2 className="w-32 h-32 text-white animate-pulse" strokeWidth={2} />
            ) : (
              <XCircle className="w-32 h-32 text-white animate-pulse" strokeWidth={2} />
            )}
          </div>
        )}

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
          <button
            onClick={state.step === 'PROFILE_QR' ? () => navigate({ to: '/hospitality' }) : goBack}
            className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <p className="text-xs text-white/70 font-medium uppercase tracking-widest text-center">
              {state.step === 'PROFILE_QR' ? 'Scan Profile QR' : 'Scan Hospitality ID'}
            </p>
          </div>
          <div className="w-10" />
        </div>

        {/* Scanner */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
          <Scanner
            scanDelay={300}
            onError={handleError}
            onScan={handleScan}
            constraints={{ facingMode: 'environment' }}
            styles={{ video: previewStyle }}
          />
        </div>

        {/* Bottom panel */}
        <div className="bg-background pb-8 pt-6 px-6 rounded-t-3xl -mt-6 relative z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-3">
              {state.step === 'PROFILE_QR' ? (
                <QrCode className="h-6 w-6 text-primary" />
              ) : (
                <IdCard className="h-6 w-6 text-primary" />
              )}
              <h2 className="text-xl font-bold">
                {state.step === 'PROFILE_QR' ? 'Scan Profile QR' : 'Scan Hospitality ID'}
              </h2>
            </div>
            <p className="text-center text-muted-foreground text-sm">
              {state.step === 'PROFILE_QR'
                ? 'Scan the student\'s Profile QR code to begin registration'
                : 'Scan the Hospitality ID card to map to this student'}
            </p>
            {state.step === 'HOSP_ID' && state.studentProfile && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium">{state.studentProfile.name}</p>
                <p className="text-xs text-muted-foreground">{state.studentProfile.college}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render accommodation/hostel selection view
  if (state.step === 'ACCOMMODATION') {
    return (
      <div className="min-h-[calc(100vh-80px)] p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Registration</h1>
              <p className="text-sm text-muted-foreground">Complete student registration</p>
            </div>
          </div>

          {/* Student Details Card - Combined with Hospitality ID */}
          {state.studentProfile && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {state.studentProfile.name}
                  </CardTitle>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">
                    {state.studentProfile.student_type.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{state.studentProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{state.studentProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{state.studentProfile.college}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-mono text-xs">{state.studentProfile.student_id}</span>
                  </div>
                </div>

                {/* Hospitality ID - Integrated */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IdCard className="h-4 w-4" />
                      <span className="text-sm">Hospitality ID</span>
                    </div>
                    <span className="font-mono font-bold text-xl text-primary">
                      {state.scannedHospId}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accommodation Section - Based on student type */}
          {needsHostel ? (
            // External student - must select hostel
            <div className="space-y-3">
              <p className="text-sm font-medium">Select Hostel</p>
              <HostelSelector
                hostels={hostels}
                selectedHostelId={state.selectedHostel?.id}
                onSelect={setSelectedHostel}
                isLoading={isLoadingHostels}
              />
            </div>
          ) : (
            // Amrita Sister - no accommodation needed
            <Card className="bg-muted/30">
              <CardContent className="p-6 text-center">
                <Home className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-lg">Not opted for Accommodation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Student will be registered as a day scholar
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!canProceedToConfirm}
            onClick={() => setShowConfirmModal(true)}
          >
            Continue to Confirmation
          </Button>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmMapping}
          title="Confirm Registration"
          description={`Register ${state.studentProfile?.name} with Hospitality ID ${state.scannedHospId}? ${
            state.selectedHostel
              ? `Hostel: ${state.selectedHostel?.name}`
              : 'No accommodation (Day Scholar)'
          }`}
          confirmText="Confirm Registration"
          isLoading={createMappingMutation.isPending}
        />
      </div>
    )
  }

  // Default: show button to start scanning
  return (
    <div className="min-h-[calc(100vh-80px)] p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/hospitality">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">HOSP 1</h1>
            <p className="text-sm text-muted-foreground">Registration & Mapping</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Start by scanning the student's Profile QR code, then scan their Hospitality ID card
              to complete the mapping.
            </p>
            <Button className="w-full" size="lg" onClick={reset}>
              <QrCode className="mr-2 h-5 w-5" />
              Start Scanning
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Check-out</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Process daily check-out for day scholars or final check-out for hostel students.
            </p>
            <Link to="/hospitality/hosp1/checkout">
              <Button variant="outline" className="w-full" size="lg">
                Go to Check-out
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
