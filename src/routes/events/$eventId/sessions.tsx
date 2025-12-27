import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, MapPin, ChevronRight, Lock, AlertCircle } from 'lucide-react'
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
            // Using public endpoint because /events/admin/ is restricted to Admins.
            // Organizer != Admin.
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
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <AlertCircle className="text-destructive w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Unavailable</h3>
                <p className="text-muted-foreground mb-6">
                    Failed to load event details.
                </p>
                <Link
                    to="/dashboard"
                    className="px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl active:scale-95 transition-transform hover:bg-secondary/80"
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
                <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ChevronRight className="rotate-180 mr-1" size={16} /> Back
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">{event.name}</h1>
                <p className="text-muted-foreground">Select a session to lock in and begin.</p>
            </div>

            <div className="space-y-4">
                {sessions.length === 0 ? (
                    <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-8 text-center text-muted-foreground">
                        No sessions scheduled for this event.
                    </div>
                ) : (
                    sessions.map(session => (
                        <Link
                            key={session.id}
                            to={`/events/${eventId}/sessions/${session.id}/attendance` as any}
                            className="group block bg-card backdrop-blur-md border border-border rounded-2xl p-4 sm:p-5 hover:bg-muted/50 hover:border-ring transition-all active:scale-[0.98]"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Calendar size={18} />
                                        </div>
                                        <span className="font-semibold text-card-foreground text-base sm:text-lg">{formatDate(session.event_date)}</span>
                                    </div>

                                    <div className="space-y-1.5 pl-1">
                                        <div className="flex items-center gap-2.5 text-muted-foreground text-sm">
                                            <Clock size={15} />
                                            <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-muted-foreground text-sm">
                                            <MapPin size={15} />
                                            <span>{session.venue}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-border flex justify-between items-center">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                                    Tap to Select
                                </span>
                                <Lock size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
