import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Calendar, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import Loader from '@/components/Loader'
import { formatDate } from '@/lib/utils'

export const Route = createFileRoute('/events/')({
  component: EventsList,
})

// Type definition based on "Returns a list where each item is a specific Schedule of an Event"
interface ScheduleItem {
  event_id: string
  event_schedule_id: string
  event_name: string
  event_date: string
  start_time: string
  end_time: string
  venue: string
  is_group?: boolean | string
  event_type?: string
  poster_url?: string // Optional, if available
}

function EventsList() {
  const { data: rawSchedules, isLoading, error } = useQuery({
    queryKey: ['attendance', 'events-list'],
    queryFn: async () => {
      const res = await api.get('/attendance/list/event')
      console.log("Events List Response:", res.data); // DEBUG
      
      // Handle various potential structures: [], { data: [] }, { events: [] }
      const data = res.data.events || res.data.data || res.data
      return (Array.isArray(data) ? data : []) as ScheduleItem[]
    }
  })

  // Group by Event ID
  const groupedEvents = (rawSchedules || []).reduce((acc, item) => {
    if (!acc.find(e => e.event_id === item.event_id)) {
      acc.push(item)
    }
    return acc
  }, [] as ScheduleItem[])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader /></div>
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center text-center">
        <AlertCircle className="text-destructive w-12 h-12 mb-4" />
        <h3 className="text-xl font-bold mb-2">Unavailable</h3>
        <p className="text-muted-foreground mb-6">Could not load events list.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-secondary rounded-xl font-medium">Retry</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 p-4">
       <header className="mb-8 pt-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Select Event</h1>
            <p className="text-muted-foreground">Choose an event to manage attendance.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupedEvents.length === 0 && (
                <div className="col-span-full text-center p-8 border border-dashed rounded-2xl text-muted-foreground">
                    No events found.
                </div>
            )}

            {groupedEvents.map(event => {
                 const status = event.event_date ? (
                    new Date(event.event_date).toDateString() === new Date().toDateString() ? 'ongoing' :
                        new Date(event.event_date) > new Date() ? 'upcoming' : 'completed'
                ) : 'upcoming';

                const styles = {
                    ongoing: "bg-green-500/90 text-white border-green-500/20 shadow-green-500/20",
                    upcoming: "bg-blue-500/90 text-white border-blue-500/20 shadow-blue-500/20",
                    completed: "bg-slate-500/90 text-white border-slate-500/20 shadow-slate-500/20"
                };

                const isGroup = typeof event.is_group === 'string' ? event.is_group : (event.is_group ? 'GROUP' : 'SOLO');
                
                return (
                <Link
                    key={event.event_id}
                    to={`/events/${event.event_id}/schedules` as any}
                    className="group relative block bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-all active:scale-[0.99] shadow-sm overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-4">
                         <div className="flex gap-2">
                             <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${
                                isGroup === 'SOLO'
                                ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                            }`}>
                                {isGroup}
                            </span>
                             <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${styles[status]}`}>
                                {status}
                            </span>
                         </div>
                         <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
                    </div>
                    
                    <h3 className="text-lg font-bold text-card-foreground mb-2 leading-tight">{event.event_name}</h3>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 p-2 rounded-lg w-fit">
                        <Calendar size={14} />
                        <span>{formatDate(event.event_date)}</span>
                    </div>
                </Link>
            )})}
        </div>
    </div>
  )
}
