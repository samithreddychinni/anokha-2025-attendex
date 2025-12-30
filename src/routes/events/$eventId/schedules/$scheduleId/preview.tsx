'use client'
import { useState, useRef, useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, ArrowLeft, Users, AlertCircle, Search, MoreVertical, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import Loader from '@/components/Loader'
import type { Participant } from '@/types'

export const Route = createFileRoute('/events/$eventId/schedules/$scheduleId/preview')({
  component: PreviewPage,
})

function PreviewPage() {
  const { eventId, scheduleId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const menuRef = useRef<HTMLDivElement>(null)
  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { data: participants, isLoading, error } = useQuery({
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
    }
  })

  // Use the cached events list - this was already fetched on the events page with Infinity staleTime
  const { data: eventDetails } = useQuery({
    queryKey: ['attendance', 'events-list'],
    queryFn: async () => {
      const res = await api.get('/attendance/list/event')
      return res.data.events || res.data.data || res.data
    },
    staleTime: Infinity,
    gcTime: Infinity,
    select: (data) => {
      // Find the matching event from the cached list
      const list = (Array.isArray(data) ? data : []) as any[]
      return list.find(e => e.event_id === eventId)
    }
  })

  const isGroup = eventDetails?.is_group === true || eventDetails?.is_group === 'true' || eventDetails?.is_group === 'GROUP'

  const markMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const endpoint = isGroup 
        ? `/attendance/team/mark/IN/${studentId}/${scheduleId}`
        : `/attendance/solo/mark/IN/${studentId}/${scheduleId}`
      const res = await api.post(endpoint)
      return res
    },
    onSuccess: () => {
      toast.success('Attendance Marked', {
        description: 'Student has been checked in successfully',
        position: 'bottom-center'
      })
      queryClient.invalidateQueries({ queryKey: ['attendance', eventId, scheduleId] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to mark attendance'
      if (error.response?.status === 400) {
        toast.error('Already Marked', {
          description: 'Student is already checked in',
          position: 'bottom-center'
        })
      } else {
        toast.error('Failed', {
          description: message,
          position: 'bottom-center'
        })
      }
    }
  })

  const unmarkMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const endpoint = isGroup 
        ? `/attendance/team/unMark/IN/${studentId}/${scheduleId}`
        : `/attendance/solo/unMark/IN/${studentId}/${scheduleId}`
      const res = await api.delete(endpoint)
      return res
    },
    onSuccess: () => {
      toast.success('Attendance Unmarked', {
        description: 'Student check-in has been removed',
        position: 'bottom-center'
      })
      queryClient.invalidateQueries({ queryKey: ['attendance', eventId, scheduleId] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to unmark attendance'
      if (error.response?.status === 400) {
        toast.error('Not Marked', {
          description: 'Student is not checked in',
          position: 'bottom-center'
        })
      } else {
        toast.error('Failed', {
          description: message,
          position: 'bottom-center'
        })
      }
    }
  })

  const handleMark = (studentId: string) => {
    setOpenMenuId(null)
    markMutation.mutate(studentId)
  }

  const handleUnmark = (studentId: string) => {
    setOpenMenuId(null)
    unmarkMutation.mutate(studentId)
  }

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

  // Pagination logic
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE)
  const paginatedList = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto p-4">
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

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
            <>
              {paginatedList.map((p, i) => {
                const studentId = p.student_id || p.id || ''
                const uniqueKey = `${studentId}-${i}`
                const isCheckedIn = p.status === 'present' || !!p.check_in
                
                return (
                  <div key={uniqueKey} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{p.student_name || p.name || 'Unknown Name'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.student_email || p.email || 'No Email Provided'}
                      </p>
                      {isCheckedIn && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                          <UserCheck size={12} /> Checked In
                        </span>
                      )}
                    </div>
                    
                    <div className="relative" ref={openMenuId === uniqueKey ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === uniqueKey ? null : uniqueKey)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        disabled={markMutation.isPending || unmarkMutation.isPending}
                      >
                        <MoreVertical size={18} className="text-muted-foreground" />
                      </button>
                      
                      {openMenuId === uniqueKey && (
                        <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[140px] py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          <button
                            onClick={() => handleMark(studentId)}
                            disabled={markMutation.isPending}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 transition-colors"
                          >
                            <UserCheck size={16} className="text-green-600" />
                            Mark
                          </button>
                          <button
                            onClick={() => handleUnmark(studentId)}
                            disabled={unmarkMutation.isPending}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 transition-colors"
                          >
                            <UserX size={16} className="text-red-600" />
                            Unmark
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pb-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 left-4 right-4 z-40">
        <button
          onClick={handleStartAttendance}
          className="w-full bg-primary text-primary-foreground font-bold p-4 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Start QR Scanner</span>
          <ChevronRight size={20} />
        </button>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          Or use the menu on each participant to mark manually
        </p>
      </div>
    </div>
  )
}
