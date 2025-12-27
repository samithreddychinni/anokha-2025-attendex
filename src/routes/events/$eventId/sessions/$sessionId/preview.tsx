import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Users, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import Loader from '@/components/Loader'
import { formatDate } from '@/lib/utils'

export const Route = createFileRoute('/events/$eventId/sessions/$sessionId/preview')({
  component: PreviewMode,
})

interface Participant {
  id: string
  student_id: string
  name: string
  status: 'REGISTERED' | 'PRESENT' | 'ABSENT'
}

function PreviewMode() {
  const { eventId, sessionId } = Route.useParams()

  const { data: participants, isLoading, error } = useQuery({
    queryKey: ['attendance-preview', eventId, sessionId],
    queryFn: async () => {
      // Note: Your table says /attendance/list/:eventId/:scheduleId
      // Ensure sessionId here corresponds to scheduleId in your API
      const res = await api.get(`/attendance/list/${eventId}/${sessionId}`)
      return (res.data.data || res.data || []) as Participant[]
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-4">
          <AlertCircle className="text-red-500 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Unavailable</h3>
        <p className="text-zinc-400 mb-6">
          Failed to load participant list.
        </p>
        <Link
          to={`/events/${eventId}/sessions` as any}
          className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl active:scale-95 transition-transform"
        >
          Back to Sessions
        </Link>
      </div>
    )
  }

  const list = Array.isArray(participants) ? participants : []

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="mb-6 pt-4">
        <Link to={`/events/${eventId}/sessions` as any} className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4 transition-colors">
          <ChevronRight className="rotate-180 mr-1" size={16} /> Back
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Preview Mode</h1>
            <p className="text-zinc-400 text-sm">Read-only view of registrations</p>
          </div>
          <div className="bg-indigo-500/10 px-3 py-1.5 rounded-lg text-indigo-400 font-mono text-sm">
            {list.length} Records
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
            No participants found for this session.
          </div>
        ) : (
          list.map((p, i) => (
            <div key={i} className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-white font-medium">{p.name || 'Unknown Name'}</p>
                  <p className="text-sm text-zinc-500 font-mono">{p.student_id}</p>
                </div>
              </div>
              <div>
                {p.status === 'PRESENT' && (
                  <div className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase bg-green-500/10 px-2 py-1 rounded">
                    <CheckCircle size={12} /> Present
                  </div>
                )}
                {p.status === 'ABSENT' && (
                  <div className="flex items-center gap-1 text-red-500 text-xs font-bold uppercase bg-red-500/10 px-2 py-1 rounded">
                    <XCircle size={12} /> Absent
                  </div>
                )}
                {p.status === 'REGISTERED' && (
                  <div className="flex items-center gap-1 text-zinc-500 text-xs font-bold uppercase bg-zinc-500/10 px-2 py-1 rounded">
                    Registered
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
