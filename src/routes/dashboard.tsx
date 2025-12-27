import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Users, ChevronRight, AlertCircle } from 'lucide-react'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import { AuthGuard } from '../components/AuthGuard'
import Loader from '../components/Loader'
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
            // API returns { message: "...", events: [...] }
            if (res.data.events && Array.isArray(res.data.events)) {
                return res.data.events as Event[]
            }
            // Fallback for other structures
            const data = res.data.data || res.data
            return (Array.isArray(data) ? data : []) as Event[]
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
                <p className="text-zinc-400 mb-6 max-w-xs mx-auto">
                    Could not load your assigned events. Please try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 pb-24">
            <header className="mb-8 pt-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Your Events</h1>
                <p className="text-zinc-400">Select an event to manage attendance.</p>
            </header>

            {(!events || events.length === 0) && (
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 text-center">
                    <p className="text-zinc-300 font-medium mb-2">No Events Assigned</p>
                    <p className="text-sm text-zinc-500">
                        Contact an administrator if you believe this is an error.
                    </p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events?.map((event) => (
                    <Link
                        key={event.id}
                        to={`/events/${event.id}/sessions` as any}
                        className="group relative block bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl overflow-hidden active:scale-[0.98] transition-all hover:bg-zinc-900/80 hover:border-zinc-700"
                    >
                        {event.poster_url && (
                            <div className="h-32 w-full bg-zinc-800 overflow-hidden relative">
                                <img
                                    src={event.poster_url}
                                    alt={event.name}
                                    className="w-full h-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent" />
                            </div>
                        )}

                        <div className="p-5 relative">
                            {/* Status Badge Example - optional logic */}
                            <div className="absolute top-0 right-5 -translate-y-1/2 z-10">
                                <span className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                                    Active
                                </span>
                            </div>

                            <h3 className="text-lg md:text-xl font-bold text-white mb-3 pr-4 leading-tight">
                                {event.name}
                            </h3>

                            <div className="space-y-2.5 text-sm text-zinc-400">
                                {event.event_date && (
                                    <div className="flex items-center gap-2.5">
                                        <Calendar size={16} className="text-zinc-500" />
                                        <span className="font-medium">{formatDate(event.event_date)}</span>
                                    </div>
                                )}
                                {event.venue && (
                                    <div className="flex items-center gap-2.5">
                                        <Users size={16} className="text-zinc-500" />
                                        <span className="font-medium">{event.venue}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex items-center justify-between text-white font-semibold">
                                <span>Select Event</span>
                                <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
