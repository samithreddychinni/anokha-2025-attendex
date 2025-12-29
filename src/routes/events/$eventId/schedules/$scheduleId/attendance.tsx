'use client'
import { useState, useRef, useCallback } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { toast } from 'sonner'
import api from '@/lib/api'
import Loader from '@/components/Loader'
import type { Participant, ScanData } from '@/types'

export const Route = createFileRoute(
  '/events/$eventId/schedules/$scheduleId/attendance',
)({
  component: AttendanceScanner,
})

function AttendanceScanner() {
  const { eventId, scheduleId } = Route.useParams()
  const queryClient = useQueryClient()
  
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null)
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['attendance', eventId, scheduleId, 'preview'],
    queryFn: async () => {
      const res = await api.get(`/attendance/list/${eventId}/${scheduleId}`)
      const data = res.data.participants || res.data.data || res.data
      const rawList = Array.isArray(data) ? data : []
      const flattenedStudents: Participant[] = []
      
      rawList.forEach((item: any) => {
        if (item.students && Array.isArray(item.students)) {
          item.students.forEach((student: any) => {
            flattenedStudents.push(student)
          })
        } else {
          flattenedStudents.push(item)
        }
      })
      
      return flattenedStudents
    },
    staleTime: 1000 * 60 * 5
  })

  const { data: eventDetails } = useQuery({
    queryKey: ['event-details', eventId],
    queryFn: async () => {
      const res = await api.get('/attendance/list/event')
      const data = res.data.events || res.data.data || res.data
      const list = (Array.isArray(data) ? data : []) as any[]
      return list.find(e => e.event_id === eventId)
    },
    staleTime: 1000 * 60 * 60
  })

  const isGroup = eventDetails?.is_group === true || eventDetails?.is_group === 'true' || eventDetails?.is_group === 'GROUP'

  const showResultFeedback = (type: 'success' | 'error') => {
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? 200 : 500)
    }
    
    setScanResult(type)
    
    if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current)
    resultTimeoutRef.current = setTimeout(() => {
      setScanResult(null)
    }, 2000)
  }

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, sid }: { studentId: string, sid: string }) => {
      const endpoint = isGroup 
        ? `/attendance/team/mark/IN/${studentId}/${sid}`
        : `/attendance/solo/mark/IN/${studentId}/${sid}`
      
      return await api.post(endpoint)
    },
    onSuccess: () => {
      showResultFeedback('success')
      toast.success("Allow", {
        description: "Attendance marked successfully",
        position: "bottom-center"
      })
      queryClient.invalidateQueries({ queryKey: ['attendance', eventId, scheduleId] })
    },
    onError: (error: any) => {
      showResultFeedback('error')
      const errorMessage = error.response?.data?.message || "Could not mark attendance"
      
      if (error.response?.status === 400) {
        toast.error("Don't Allow", {
          description: "Already checked in or invalid request",
          position: "bottom-center"
        })
      } else {
        toast.error("Don't Allow", {
          description: errorMessage,
          position: "bottom-center"
        })
      }
    },
    onSettled: () => {
      setIsProcessing(false)
    }
  })

  const handleScan = useCallback((result: any) => {
    if (!result || isProcessing) return

    const rawText = result?.[0]?.rawValue
    if (!rawText) return

    if (rawText === lastScanned) {
      return
    }

    try {
      setIsProcessing(true)
      
      let parsed: ScanData
      try {
        parsed = JSON.parse(rawText)
      } catch {
        setIsProcessing(false)
        return
      }

      const { studentId, scheduleId: scannedScheduleId } = parsed

      if (!studentId || !scannedScheduleId) {
        setIsProcessing(false)
        showResultFeedback('error')
        toast.error("Don't Allow", { 
          description: "Invalid QR code - missing required fields",
          position: "bottom-center"
        })
        return
      }
      
      if (scannedScheduleId !== scheduleId) {
        setIsProcessing(false)
        showResultFeedback('error')
        toast.error("Don't Allow", { 
          description: "This ticket is for a different schedule",
          position: "bottom-center"
        })
        return
      }

      const isRegistered = participants ? participants.some(p => 
        (p.student_id === studentId) || (p.id === studentId)
      ) : false

      if (!isRegistered) {
        console.log(`Student ${studentId} not found in local roster, proceeding with API call`)
      }

      setLastScanned(rawText)
      
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = setTimeout(() => setLastScanned(null), 3000)

      markAttendanceMutation.mutate({ studentId, sid: scheduleId })

    } catch (err: any) {
      setIsProcessing(false)
    }
  }, [isProcessing, lastScanned, scheduleId, participants, markAttendanceMutation])

  const handleError = (err: any) => {
    console.error("Camera Error:", err)
  }

  const previewStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    objectFit: 'cover' as const
  }

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
        <Link 
          to={`/events/${eventId}/schedules/${scheduleId}/preview` as any}
          className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <p className="text-xs text-white/70 font-medium uppercase tracking-widest text-center">Scanner Active</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <Scanner
          scanDelay={300}
          onError={handleError}
          onScan={handleScan}
          constraints={{
            facingMode: 'environment'
          }}
          styles={{
            video: previewStyle
          }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-64 border-2 border-white/80 rounded-3xl">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -mt-1 -ml-1 rounded-tl-xl"/>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary -mt-1 -mr-1 rounded-tr-xl"/>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary -mb-1 -ml-1 rounded-bl-xl"/>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary -mb-1 -mr-1 rounded-br-xl"/>
            
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),1)] animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        </div>

        {!participants && isLoadingParticipants && (
          <div className="absolute bottom-32 left-0 right-0 flex justify-center">
            <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2">
              <Loader /> Syncing Roster...
            </div>
          </div>
        )}
      </div>

      <div className="bg-background pb-8 pt-6 px-6 rounded-t-3xl -mt-6 relative z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-center">Scan Participant Ticket</h2>
          <p className="text-center text-muted-foreground text-sm">
            Align the QR code within the frame. <br/>
            Verification happens automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
