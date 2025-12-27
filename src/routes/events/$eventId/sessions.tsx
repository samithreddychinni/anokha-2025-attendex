import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, MapPin, ChevronRight, Lock, AlertCircle, Eye } from 'lucide-react'
import api from '@/lib/api'
import { formatDate, formatTime } from '@/lib/utils'

import Loader from '@/components/Loader'

export const Route = createFileRoute('/events/$eventId/sessions')({
    component: SessionSelection,
})

interface Schedule {
    id: string
    event_date: string
    start_time: string
    end_time: string
    venue: string
}

interface EventDetail {
    id: string
    name: string
    schedules?: Schedule[]
}

function SessionSelection() {
    const { eventId } = Route.useParams()

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            // Using authenticated endpoint to get full details including schedule IDs
            const res = await api.get(`/events/${eventId}`)
            // Success response: { event: { ... }, message: "..." }
            if (res.data.event) {
                return res.data.event as EventDetail
            }
            return (res.data.data || res.data) as EventDetail
        },
    })

    if (isLoading) {
        return (
            <div className="min-h-screen p-4 flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen p-4 flex flex-col items-center justify-center text-center">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <AlertCircle className="text-red-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Unavailable</h3>
                <p className="text-zinc-400 mb-6">
                    Failed to load event details.
                </p>
                <Link
                    to="/dashboard"
                    className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl active:scale-95 transition-transform"
                >
                    Back to Dashboard
                </Link>
            </div>
        )
    }

    const sessions = event.schedules || []

    return (
        <div className="min-h-screen p-4 pb-20">
            <div className="mb-8 pt-4">
                <Link to="/dashboard" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-4 transition-colors">
                    <ChevronRight className="rotate-180 mr-1" size={16} /> Back
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">{event.name}</h1>
                <p className="text-zinc-400">Select a session to lock in and begin.</p>
            </div>

            <div className="space-y-4">
                {sessions.length === 0 ? (
                    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
                        No sessions scheduled for this event.
                    </div>
                ) : (
                    sessions.map(session => (
                        // Inside sessions.map(session => ( ...
                        <Link
                            to={`/events/${eventId}/sessions/${session.id}/preview` as any}
                            onClick={(e) => e.stopPropagation()}
                        // ...
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                            <Calendar size={18} />
                                        </div>
                                        <span className="font-semibold text-white text-base sm:text-lg">{formatDate(session.event_date)}</span>
                                    </div>

                                    <div className="space-y-1.5 pl-1">
                                        <div className="flex items-center gap-2.5 text-zinc-400 text-sm">
                                            <Clock size={15} />
                                            <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-zinc-400 text-sm">
                                            <MapPin size={15} />
                                            <span>{session.venue}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                                <Link
                                    to={`/events/${eventId}/sessions/${session.id}/preview` as any}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
                                >
                                    <Eye size={14} /> Preview List
                                </Link>

                                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                                    <span className="group-hover:text-indigo-300 transition-colors">Select</span>
                                    <Lock size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
