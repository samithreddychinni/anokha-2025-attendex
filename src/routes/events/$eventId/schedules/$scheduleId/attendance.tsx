'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, X, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'
import QrScanner from 'react-qr-scanner'
import { toast } from 'sonner'
import api from '@/lib/api'
import Loader from '@/components/Loader'

// --- Types ---
interface Participant {
  attendance_id?: number
  student_id?: string
  student_name?: string
  student_email?: string
  check_in?: string | null
  check_out?: string | null
  id?: string
  name?: string
  email?: string
}

interface ScanData {
  studentId: string
  scheduleId: string
}

// --- Component ---
export const Route = createFileRoute(
  '/events/$eventId/schedules/$scheduleId/attendance',
)({
  component: AttendanceScanner,
})

function AttendanceScanner() {
  const { eventId, scheduleId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // State
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<'success' | 'error' | 'neutral'>('neutral')
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch Participants for Local Validation
  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['attendance', eventId, scheduleId, 'preview'],
    queryFn: async () => {
      const res = await api.get(`/attendance/list/${eventId}/${scheduleId}`)
      const data = res.data.participants || res.data.data || res.data
      return (Array.isArray(data) ? data : []) as Participant[]
    },
    staleTime: 1000 * 60 * 5 // Cache for 5 mins
  })

  // API Mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, sid }: { studentId: string, sid: string }) => {
      // POST /attendance/solo/mark/IN/:studentId/:scheduleId
      return await api.post(`/attendance/solo/mark/IN/${studentId}/${sid}`)
    },
    onSuccess: (data, variables) => {
      triggerFeedback('success')
      toast.success("Marked Successfully", {
        description: `Student ID: ${variables.studentId.slice(0, 8)}...`
      })
      // Optimistically update or invalidate query
      queryClient.invalidateQueries({ queryKey: ['attendance', eventId, scheduleId] })
    },
    onError: (error: any) => {
        triggerFeedback('error')
        // Special handling for 400 (Duplicate)
        if (error.response?.status === 400) {
            toast.error("Already Processed", {
                description: "Student is already checked in/out."
            })
        } else {
             toast.error("Submission Failed", {
                description: error.response?.data?.message || "Could not mark attendance."
             })
        }
    },
    onSettled: () => {
      setIsProcessing(false)
    }
  })

  // Feedback Trigger
  const triggerFeedback = (type: 'success' | 'error') => {
    // Vibrate
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? 200 : 500)
    }
    // Visual Flash
    setFeedback(type)
    setTimeout(() => setFeedback('neutral'), 300)
  }

  // Scan Handler
  const handleScan = useCallback((data: any) => {
    if (!data || isProcessing) return

    const rawText = data?.text
    if (!rawText) return

    // 1. Debounce same code
    if (rawText === lastScanned) {
        // Prevent rapid refire on same code
        return
    }

    try {
      setIsProcessing(true)
      
      // 2. Parse JSON
      let parsed: ScanData
      try {
        parsed = JSON.parse(rawText)
      } catch (e) {
        throw new Error("Invalid QR Format")
      }

      const { studentId, scheduleId: scannedScheduleId } = parsed

      // 3. Validation
      if (!studentId || !scannedScheduleId) throw new Error("Missing ID fields")
      
      if (scannedScheduleId !== scheduleId) {
        throw new Error("Wrong Event Schedule")
      }

      // 4. Local Check (Is student in list?)
      if (participants) {
        const isValidStudent = participants.some(p => 
            (p.student_id === studentId) || (p.id === studentId)
        )
        if (!isValidStudent) {
            throw new Error("Student Not Registered")
        }
      }

      // If valid, proceed
      setLastScanned(rawText)
      
      // Clear last scanned after 3s to allow re-scan if needed
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = setTimeout(() => setLastScanned(null), 3000)

      // 5. Call API
      markAttendanceMutation.mutate({ studentId, sid: scheduleId })

    } catch (err: any) {
      setIsProcessing(false)
      // Only show error toast if it's a "new" error (simple throttle)
    //   triggerFeedback('error') // Optional: Don't flash red for every random QR, only "valid" structure format errors
      console.warn("Scan Error:", err.message)
      
      if (err.message === "Wrong Event Schedule") {
          triggerFeedback('error')
          toast.warning("Wrong Event", { description: "This ticket is for a different schedule." })
      } else if (err.message === "Student Not Registered") {
          triggerFeedback('error')
          toast.error("Not Registered", { description: "Student not found in guest list." })
      } 
      // Ignore random non-JSON QRs silently or just log
    }
  }, [isProcessing, lastScanned, scheduleId, participants, markAttendanceMutation])

  const handleError = (err: any) => {
    console.error("Camera Error:", err)
  }

  // Preview styling
  const previewStyle = {
    height: '100%',
    width: '100%',
    objectFit: 'cover'
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Feedback Overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 z-50 ${
          feedback === 'success' ? 'bg-white/80' : 
          feedback === 'error' ? 'bg-red-500/50' : 'opacity-0'
        }`}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
        <Link 
            to={`/events/${eventId}/schedules/${scheduleId}/preview` as any}
            className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <p className="text-xs text-white/70 font-medium uppercase tracking-widest text-center">Scanner Active</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Camera Viewport */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
         <QrScanner
            delay={300}
            style={previewStyle as any}
            onError={handleError}
            onScan={handleScan}
            constraints={{
                video: { facingMode: 'environment' }
            }}
          />
          
          {/* Scan Target UI */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64 border-2 border-white/80 rounded-3xl">
                {/* Corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -mt-1 -ml-1 rounded-tl-xl"/>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary -mt-1 -mr-1 rounded-tr-xl"/>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary -mb-1 -ml-1 rounded-bl-xl"/>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary -mb-1 -mr-1 rounded-br-xl"/>
                
                {/* Scanning Animation Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),1)] animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          </div>

          {!participants && isLoadingParticipants && (
              <div className="absolute bottom-32 left-0 right-0 flex justify-center">
                  <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2">
                      <Loader size="sm" /> Syncing Roster...
                  </div>
              </div>
          )}
      </div>

      {/* Footer / Status */}
      <div className="bg-background pb-8 pt-6 px-6 rounded-t-3xl -mt-6 relative z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-center">Scan Participant Ticket</h2>
            <p className="text-center text-muted-foreground text-sm">
                Align the QR code within the frame. <br/>
                Verification happens automatically.
            </p>

            {/* Manual Entry Fallback */}
            <button 
                onClick={() => toast.info("Manual Entry", { description: "Feature coming soon" })}
                className="w-full mt-2 py-3 bg-secondary/50 text-secondary-foreground rounded-xl font-medium text-sm hover:bg-secondary transition-colors"
             >
                Enter ID Manually
            </button>
        </div>
      </div>
    </div>
  )
}
