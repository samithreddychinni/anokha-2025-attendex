import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react'
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
            // Assuming public endpoint /events/:id or admin /events/admin/:id
            // Organizers should probably use the public one or dashboard one?
            // Docs: GET /events/:eventId
            const res = await api.get(`/events/${eventId}`)
            return (res.data.data || res.data) as EventDetail
        },
    })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 p-4 flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-zinc-950 p-4 text-center text-red-400">
                Failed to load event details.
            </div>
        )
    }

    const sessions = event.schedules || []

    return (
        <div className="min-h-screen p-4 pb-20">
            <div className="mb-6">
                <Link to="/dashboard" className="text-sm text-zinc-500 mb-2 block hover:text-white">&larr; Back to Dashboard</Link>
                <h1 className="text-2xl font-bold text-white">{event.name}</h1>
                <p className="text-zinc-400">Select a session to begin</p>
            </div>

            <div className="space-y-4">
                {sessions.length === 0 ? (
                    <div className="p-4 bg-zinc-900 rounded-lg text-zinc-500 text-center">
                        No sessions scheduled for this event.
                    </div>
                ) : (
                    sessions.map(session => (
                        <Link
                            key={session.id}
                            to={`/events/${eventId}/sessions/${session.id}/attendance` as any}
                            className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-white font-semibold mb-1">
                                        <Calendar size={16} className="text-indigo-400" />
                                        <span>{formatDate(session.event_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                                        <Clock size={16} />
                                        <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                        <MapPin size={16} />
                                        <span>{session.venue}</span>
                                    </div>
                                </div>
                                <ArrowRight className="text-zinc-600" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
