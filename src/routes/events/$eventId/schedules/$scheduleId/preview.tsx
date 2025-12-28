
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ArrowLeft, Users, AlertCircle, Eye } from 'lucide-react'
import api from '@/lib/api'
import Loader from '@/components/Loader'

export const Route = createFileRoute('/events/$eventId/schedules/$scheduleId/preview')({
  component: PreviewPage,
})

// Types based on potential API response
interface Participant {
  id?: string
  reg_id?: string
  register_id?: string
  name?: string
  student_name?: string
  roll_number?: string
  roll_no?: string
  status?: 'present' | 'absent'
}

function PreviewPage() {
  const { eventId, scheduleId } = Route.useParams()
  const navigate = useNavigate()

  const { data: participants, isLoading, error } = useQuery({
    queryKey: ['attendance', eventId, scheduleId, 'preview'],
    queryFn: async () => {
      const res = await api.get(`/attendance/list/${eventId}/${scheduleId}`)
      console.log('Preview Data Response:', res.data)
      // Handle various response structures
      const data = res.data.participants || res.data.data || res.data || []
      return (Array.isArray(data) ? data : []) as Participant[]
    }
  })

  // Handlers
  const handleStartAttendance = () => {
    navigate({ to: `/events/${eventId}/schedules/${scheduleId}/attendance` } as any)
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold mb-2">Could not load participants</h3>
        <p className="text-muted-foreground mb-6">Please check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-secondary rounded-lg font-medium">Retry</button>
      </div>
    )
  }

  const list = participants || []

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Read Only Banner */}
      <div className="bg-muted/80 backdrop-blur border-b text-center py-2 px-4 sticky top-0 z-50 flex items-center justify-center gap-2">
        <Eye size={16} className="text-muted-foreground" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview Mode — No Changes Allowed</span>
        <Eye size={16} className="text-muted-foreground" />
      </div>

      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to={`/events/${eventId}/schedules` as any} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Back
            </Link>
            <h1 className="text-2xl font-bold">Registration Preview</h1>
            <p className="text-muted-foreground text-sm">{list.length} registered participants</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {list.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl bg-card">
              <Users className="mx-auto w-10 h-10 text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">No participants found for this schedule.</p>
            </div>
          ) : (
            list.map((p, i) => (
              <div key={p.id || p.reg_id || i} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between opacity-90">
                <div>
                  <p className="font-semibold text-foreground">{p.name || p.student_name || 'Unknown Name'}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.reg_id || p.register_id || 'No ID'} • {p.roll_number || p.roll_no || 'No Roll No'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${(p.status || '').toLowerCase() === 'present'
                    ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                  }`}>
                  {p.status || 'Absent'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-4 right-4 z-40">
        <button
          onClick={handleStartAttendance}
          className="w-full bg-primary text-primary-foreground font-bold p-4 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Start Actual Attendance</span>
          <ChevronRight size={20} />
        </button>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          You will be able to mark attendance in the next screen.
        </p>
      </div>
    </div>
  )
}
