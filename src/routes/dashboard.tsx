import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Users, ChevronRight, AlertCircle } from 'lucide-react'
import api from '../lib/api'
import { formatDate } from '../lib/utils'
import Loader from '../components/Loader'
import { useAuth } from '../contexts/AuthContext'
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

    const { user } = useAuth()

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
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <AlertCircle className="text-destructive w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Unavailable</h3>
                <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                    Could not load your assigned events. Please try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl active:scale-95 transition-transform"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 pb-24">
            <header className="mb-8 pt-4">
                <h2 className="text-lg font-medium text-muted-foreground mb-1">
                    Welcome, <span className="text-foreground font-semibold">
                        {(user?.name || 'Organizer').length > 20 
                            ? `${(user?.name || 'Organizer').slice(0, 20)}..` 
                            : (user?.name || 'Organizer')}
                    </span>
                </h2>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Your Events</h1>
                <p className="text-muted-foreground">Select an event to manage attendance.</p>
            </header>

            {(!events || events.length === 0) && (
                <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-8 text-center text-card-foreground">
                    <p className="text-muted-foreground font-medium mb-2">No Events Assigned</p>
                    <p className="text-sm text-muted-foreground/80">
                        Contact an administrator if you believe this is an error.
                    </p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events?.map((event) => (
                    <Link
                        key={event.id}
                        to={`/events/${event.id}/sessions` as any}
                        className="group relative block bg-card backdrop-blur-md border border-border rounded-2xl overflow-hidden active:scale-[0.98] transition-all hover:bg-muted/50 hover:border-ring"
                    >
                        {event.poster_url && (
                            <div className="h-32 w-full bg-muted overflow-hidden relative">
                                <img
                                    src={event.poster_url}
                                    alt={event.name}
                                    className="w-full h-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                            </div>
                        )}

                        <div className="p-5 relative">
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 z-10">
                                {(() => {
                                    const status = event.event_date ? (
                                        new Date(event.event_date).toDateString() === new Date().toDateString() ? 'ongoing' :
                                        new Date(event.event_date) > new Date() ? 'upcoming' : 'completed'
                                    ) : 'upcoming';
                                    
                                    const styles = {
                                        ongoing: "bg-green-500/90 text-white border-green-500/20 shadow-green-500/20",
                                        upcoming: "bg-blue-500/90 text-white border-blue-500/20 shadow-blue-500/20",
                                        completed: "bg-slate-500/90 text-white border-slate-500/20 shadow-slate-500/20"
                                    };

                                    return (
                                        <span className={`backdrop-blur-sm text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${styles[status]}`}>
                                            {status}
                                        </span>
                                    );
                                })()}
                            </div>

                            <h3 className="text-lg md:text-xl font-bold text-card-foreground mb-3 pr-4 leading-tight">
                                {event.name}
                            </h3>

                            <div className="space-y-2.5 text-sm text-muted-foreground">
                                {event.event_date && (
                                    <div className="flex items-center gap-2.5">
                                        <Calendar size={16} className="text-muted-foreground" />
                                        <span className="font-medium">{formatDate(event.event_date)}</span>
                                    </div>
                                )}
                                {event.venue && (
                                    <div className="flex items-center gap-2.5">
                                        <Users size={16} className="text-muted-foreground" />
                                        <span className="font-medium">{event.venue}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex items-center justify-between text-card-foreground font-semibold">
                                <span>Select Event</span>
                                <div className="bg-muted p-2 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
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
