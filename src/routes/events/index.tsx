import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Calendar, AlertCircle, Clock } from 'lucide-react'
import api from '@/lib/api'
import Loader from '@/components/Loader'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { ScheduleItem } from '@/types'

export const Route = createFileRoute('/events/')({
  component: EventsList,
})

function EventsList() {
  const navigate = useNavigate()
  const { data: rawSchedules, isLoading, error } = useQuery({
    queryKey: ['attendance', 'events-list'],
    queryFn: async () => {
      const res = await api.get('/attendance/list/event')
      const data = res.data.events || res.data.data || res.data
      return (Array.isArray(data) ? data : []) as ScheduleItem[]
    }
  })

  const eventsMap = new Map<string, { info: ScheduleItem, schedules: ScheduleItem[] }>();

  (rawSchedules || []).forEach(item => {
    if (!eventsMap.has(item.event_id)) {
      eventsMap.set(item.event_id, { info: item, schedules: [] });
    }
    eventsMap.get(item.event_id)?.schedules.push(item);
  });

  const now = new Date();

  const getEventStatus = (schedules: ScheduleItem[]) => {
    let hasOngoing = false;
    let hasUpcoming = false;
    const now = new Date();

    const createSafeDate = (dateStr: string, timeStr: string) => {
      try {
        const hasDateInTime = timeStr && timeStr.includes('-');
        
        let dString = dateStr;
        let tString = timeStr;

        if (hasDateInTime) {
          const separator = timeStr.includes('T') ? 'T' : ' ';
          const parts = timeStr.split(separator);
          if (parts.length >= 2) {
            dString = parts[0];
            tString = parts[1];
            if (parts.length > 2) tString = parts.slice(1).join(separator);
          } else {
            dString = timeStr;
            tString = "00:00:00"; 
          }
        } else if (tString && tString.includes('T')) {
          tString = tString.split('T')[1];
        }

        const [year, month, day] = dString.split('T')[0].split('-').map(Number);

        let hours = 0, minutes = 0, seconds = 0;
        let cleanTime = tString ? tString.trim() : "";
        
        if (cleanTime.toLowerCase().includes('m')) {
          const [timePart, modifier] = cleanTime.split(' ');
          let [h, m, s] = timePart.split(':').map(Number);
          if (modifier.toLowerCase() === 'pm' && h < 12) h += 12;
          if (modifier.toLowerCase() === 'am' && h === 12) h = 0;
          hours = h; minutes = m; seconds = s || 0;
        } else if (cleanTime) {
          [hours, minutes, seconds] = cleanTime.split(':').map(Number);
        }

        const d = new Date(year, month - 1, day, hours, minutes, seconds || 0);
        if (isNaN(d.getTime())) {
          return new Date(now.getTime() + 86400000); 
        }
        return d;
      } catch {
        return new Date(now.getTime() + 86400000);
      }
    };

    for (const s of schedules) {
      const start = createSafeDate(s.event_date, s.start_time);
      const end = createSafeDate(s.event_date, s.end_time);
      
      const ongoingStart = new Date(start.getTime() - 30 * 60000);

      if (now >= ongoingStart && now <= end) {
        hasOngoing = true;
      } else if (now <= start) {
        hasUpcoming = true;
      }
    }

    if (hasOngoing) return 'ongoing';
    if (hasUpcoming) return 'upcoming'; 
    return 'completed';
  };

  const processedEvents = Array.from(eventsMap.values()).map(e => ({
    ...e.info,
    status: getEventStatus(e.schedules),
    allSchedules: e.schedules
  }));

  const ongoingEvents = processedEvents.filter(e => e.status === 'ongoing');
  const otherEvents = processedEvents.filter(e => e.status !== 'ongoing');

  otherEvents.sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return -1;
    if (a.status !== 'completed' && b.status === 'completed') return 1;
    return 0;
  });

  const handleEventClick = (e: React.MouseEvent, event: typeof processedEvents[0]) => {
    e.preventDefault();
    
    if (event.status === 'upcoming') {
      toast.message('Event is Upcoming', {
        description: 'Attendance tracking is not yet available for this event.',
        icon: <Clock className="w-4 h-4 text-orange-500" />
      });
      return;
    }
    
    navigate({ to: `/events/${event.event_id}/schedules` as any });
  };

  const EventCard = ({ event }: { event: typeof processedEvents[0] }) => {
    const styles = {
      ongoing: "bg-green-500/90 text-white border-green-500/20 shadow-green-500/20",
      upcoming: "bg-blue-500/90 text-white border-blue-500/20 shadow-blue-500/20",
      completed: "bg-slate-500/90 text-white border-slate-500/20 shadow-slate-500/20"
    };
    
    const isGroup = (event.is_group === true || event.is_group === 'true' || event.is_group === 'GROUP') ? 'TEAM' : 'SOLO';

    return (
      <a 
        href={`/events/${event.event_id}/schedules`}
        onClick={(e) => handleEventClick(e, event)}
        className={`group relative block bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-all active:scale-[0.99] shadow-sm overflow-hidden ${event.status === 'upcoming' ? 'opacity-75 grayscale-[0.3]' : ''}`}
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
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${(styles as any)[event.status]}`}>
              {event.status}
            </span>
          </div>
          {event.status !== 'upcoming' && (
            <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
          )}
          {event.status === 'upcoming' && (
            <Clock className="text-muted-foreground" size={20} />
          )}
        </div>
        
        <h3 className="text-lg font-bold text-card-foreground mb-2 leading-tight">{event.event_name}</h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 p-2 rounded-lg w-fit">
          <Calendar size={14} />
          <span>{formatDate(event.event_date)}</span>
        </div>
      </a>
    )
  }

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
    <div className="min-h-screen pb-24 p-4">
      <header className="mb-8 pt-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Select Event</h1>
        <p className="text-muted-foreground">Choose an event to manage attendance.</p>
      </header>

      {(ongoingEvents.length === 0 && otherEvents.length === 0) && (
        <div className="text-center p-8 border border-dashed rounded-2xl text-muted-foreground">
          No events found.
        </div>
      )}

      {ongoingEvents.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Ongoing Events
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ongoingEvents.map(event => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        </div>
      )}

      {otherEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">All Events</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-80 hover:opacity-100 transition-opacity">
            {otherEvents.map(event => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
