'use client'
import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ArrowLeft, Users, AlertCircle, Eye, Search } from 'lucide-react'
import api from '@/lib/api'
import Loader from '@/components/Loader'

export const Route = createFileRoute('/events/$eventId/schedules/$scheduleId/preview')({
  component: PreviewPage,
})

// Types based on potential API response
interface Participant {
  attendance_id?: number
  student_id?: string
  student_name?: string
  student_email?: string
  check_in?: string | null
  check_out?: string | null

  // Fallbacks (legacy or alternative)
  id?: string
  name?: string
  email?: string
  status?: 'present' | 'absent'
}

function PreviewPage() {
  const { eventId, scheduleId } = Route.useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: participants, isLoading, error } = useQuery({
    queryKey: ['attendance', eventId, scheduleId, 'preview'],
    queryFn: async () => {
      const res = await api.get(`/attendance/list/${eventId}/${scheduleId}`)
      console.log('Preview Data Response:', res.data)
      // Handle various response structures
      const data = res.data.participants || res.data.data || res.data
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

  const filteredList = list.filter(p => {
    const term = searchTerm.toLowerCase()
    const name = (p.student_name || p.name || '').toLowerCase()
    const email = (p.student_email || p.email || '').toLowerCase()
    return name.includes(term) || email.includes(term)
  })

  return (
    <div className="min-h-screen bg-background pb-24">

      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link to={`/events/${eventId}/schedules` as any} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back
              </Link>
              <h1 className="text-2xl font-bold">Registration Preview</h1>
              <p className="text-muted-foreground text-sm">{list.length} registered participants</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl bg-card">
              {searchTerm ? (
                <>
                  <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-muted mb-3">
                    <Search size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No matches found for "{searchTerm}"</p>
                </>
              ) : (
                <>
                  <Users className="mx-auto w-10 h-10 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">No participants found for this schedule.</p>
                </>
              )}
            </div>
          ) : (
            filteredList.map((p, i) => (
              <div key={p.student_id || p.id || i} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between opacity-90">
                <div>
                  <p className="font-semibold text-foreground">{p.student_name || p.name || 'Unknown Name'}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.student_email || p.email || 'No Email Provided'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${(p.status === 'present' || p.check_in)
                  ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                  : 'bg-secondary text-muted-foreground border border-border'
                  }`}>
                  {p.status || (p.check_in ? 'Present' : 'Registered')}
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
