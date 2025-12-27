import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Users, ArrowRight } from 'lucide-react'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import { AuthGuard } from '../components/AuthGuard'
export const Route = createFileRoute('/dashboard')({
    component: Dashboard,
})

interface Event {
    id: string
    name: string
    description?: string
    event_type: string
    event_date?: string
    venue?: string
    poster_url?: string
}

function Dashboard() {
    const navigate = useNavigate()

    const { data: events, isLoading, error } = useQuery({
        queryKey: ['organizer-events'],
        queryFn: async () => {
            const res = await api.get('/organizers/dashboard')
            // Ensure we return an array. API result might be wrapped.
            return (res.data.data || res.data) as Event[]
        },
    })

    // Mock data for dev if API fails (Optional, but helpful for UI work without backend)
    // Remove if strict API only.

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 p-4 flex items-center justify-center">
                <div className="text-zinc-400 animate-pulse">Loading events...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 p-4 flex flex-col items-center justify-center">
                <div className="text-red-400 mb-2">Failed to load events</div>
                <pre className="text-xs text-zinc-600 mb-4">{JSON.stringify(error, null, 2)}</pre>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-zinc-800 rounded text-white"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-zinc-950 p-4 pb-20">
                <h1 className="text-2xl font-bold text-white mb-6">Assigned Events</h1>

                {(!events || events.length === 0) && (
                    <div className="text-zinc-500 text-center py-10">
                        No events assigned to you yet.
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events?.map((event) => (
                        <Link
                            key={event.id}
                            to={`/events/${event.id}/sessions` as any}
                            className="block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors active:scale-[0.98]"
                        >
                            {event.poster_url && (
                                <div className="h-32 w-full bg-zinc-800 overflow-hidden">
                                    <img src={event.poster_url} alt={event.name} className="w-full h-full object-cover opacity-80" />
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-white mb-2">{event.name}</h3>

                                <div className="space-y-2 text-sm text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs border border-zinc-700">
                                            {event.event_type}
                                        </span>
                                    </div>
                                    {event.event_date && (
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>{formatDate(event.event_date)}</span>
                                        </div>
                                    )}
                                    {event.venue && (
                                        <div className="flex items-center gap-2">
                                            <Users size={14} />
                                            <span>{event.venue}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center text-indigo-400 text-sm font-medium">
                                    Manage Attendance <ArrowRight size={14} className="ml-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AuthGuard>
    )
}
