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
      const events = res.data.events || res.data.data || res.data
      const eventList = Array.isArray(events) ? events : []
      const flattenedSchedules: ScheduleItem[] = []
      eventList.forEach((event: any) => {
        const schedules = event.schedules || []
        schedules.forEach((schedule: any) => {
          flattenedSchedules.push({
            event_id: event.event_id,
            event_schedule_id: schedule.id,
            event_name: event.event_name,
            event_date: schedule.event_date,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            venue: schedule.venue,
            is_group: event.is_group,
            event_type: event.attendance_mode
          })
        })
      })
      
      return flattenedSchedules
    },
    staleTime: Infinity,
    gcTime: Infinity
  })

  const eventsMap = new Map<string, { info: ScheduleItem, schedules: ScheduleItem[] }>();

  (rawSchedules || []).forEach(item => {
    if (!eventsMap.has(item.event_id)) {
      eventsMap.set(item.event_id, { info: item, schedules: [] });
    }
    eventsMap.get(item.event_id)?.schedules.push(item);
  });

  const getEventStatus = (schedules: ScheduleItem[]) => {
    let hasOngoing = false;
    let hasUpcoming = false;
    const now = new Date();

    const createSafeDate = (dateStr: string, timeStr: string) => {
      try {
        if (timeStr && (timeStr.includes('T') || timeStr.includes('-'))) {
          const parsed = new Date(timeStr);
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        }
        
        let datePart = dateStr;
        if (datePart.includes('T')) {
          datePart = datePart.split('T')[0];
        }
        const [year, month, day] = datePart.split('-').map(Number);
        
        let cleanTime = timeStr ? timeStr.trim() : "00:00:00";
        
        if (cleanTime.includes('T')) {
          cleanTime = cleanTime.split('T')[1];
        }
        
        cleanTime = cleanTime.replace(/[Z]$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
        
        let hours = 0, minutes = 0, seconds = 0;
        
        if (cleanTime.toLowerCase().includes('m')) {
          const match = cleanTime.match(/(\d+):(\d+)(?::(\d+))?\s*(am|pm)/i);
          if (match) {
            let h = parseInt(match[1]);
            const m = parseInt(match[2]);
            const sec = match[3] ? parseInt(match[3]) : 0;
            const modifier = match[4].toLowerCase();
            if (modifier === 'pm' && h < 12) h += 12;
            if (modifier === 'am' && h === 12) h = 0;
            hours = h; minutes = m; seconds = sec;
          }
        } else if (cleanTime) {
          const timeParts = cleanTime.split(':').map(Number);
          hours = timeParts[0] || 0;
          minutes = timeParts[1] || 0;
          seconds = timeParts[2] || 0;
        }

        const d = new Date(year, month - 1, day, hours, minutes, seconds);
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
      } else if (now < start) {
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
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
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
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            All Events
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherEvents.map(event => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
