import { useNavigate, createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import Loader from '@/components/Loader'
import { ScheduleCard } from '@/components/ScheduleCard'
import type { ScheduleItem } from '@/types'

export const Route = createFileRoute('/events/$eventId/schedules/')({
  component: ScheduleSelection,
})

function ScheduleSelection() {
  const { eventId } = Route.useParams()
  const navigate = useNavigate()
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)

  const { data: rawSchedules, isLoading, error } = useQuery({
    queryKey: ['attendance', 'events-list'],
    queryFn: async () => {
      const res = await api.get('/attendance/list/event')
      const events = res.data.events || res.data.data || res.data
      const eventList = Array.isArray(events) ? events : []
      
      // Flatten the nested structure: each event has a schedules array
      const flattenedSchedules: ScheduleItem[] = []
      eventList.forEach((event: any) => {
        const schedules = event.schedules || []
        schedules.forEach((schedule: any) => {
          flattenedSchedules.push({
            event_id: event.event_id,
            event_schedule_id: schedule.id, // API uses 'id', we need 'event_schedule_id'
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
    }
  })

  const schedules = (rawSchedules || []).filter(s => s.event_id === eventId)
  const eventDetails = schedules[0]

  const handlePreview = () => {
    if (selectedScheduleId) {
      navigate({ to: `/events/${eventId}/schedules/${selectedScheduleId}/preview` } as any)
    }
  }

  const uniqueSchedules = Array.from(new Map(schedules.map(item => [item.event_schedule_id, item])).values());

  const getScheduleForCard = (s: ScheduleItem) => {
    const now = new Date();
    
    const createSafeDate = (dateStr: string, timeStr: string) => {
      try {
        // First try: if timeStr is a full ISO string, parse it directly
        if (timeStr && (timeStr.includes('T') || timeStr.includes('-'))) {
          const parsed = new Date(timeStr);
          if (!isNaN(parsed.getTime())) {
            console.log(`[DEBUG] Parsed full datetime: ${timeStr} -> ${parsed}`);
            return parsed;
          }
        }
        
        // Extract date components from dateStr
        let datePart = dateStr;
        if (datePart.includes('T')) {
          datePart = datePart.split('T')[0];
        }
        const [year, month, day] = datePart.split('-').map(Number);
        
        // Extract time components
        let cleanTime = timeStr ? timeStr.trim() : "00:00:00";
        
        // If time contains 'T', extract just the time part
        if (cleanTime.includes('T')) {
          cleanTime = cleanTime.split('T')[1];
        }
        
        // Remove timezone info if present (e.g., +05:30 or Z)
        cleanTime = cleanTime.replace(/[Z]$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
        
        let hours = 0, minutes = 0, seconds = 0;
        
        if (cleanTime.toLowerCase().includes('m')) { 
          // Handle AM/PM format
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
          // Handle 24-hour format (HH:MM:SS or HH:MM)
          const timeParts = cleanTime.split(':').map(Number);
          hours = timeParts[0] || 0;
          minutes = timeParts[1] || 0;
          seconds = timeParts[2] || 0;
        }

        const result = new Date(year, month - 1, day, hours, minutes, seconds);
        console.log(`[DEBUG] Created date from parts: date=${datePart}, time=${timeStr} -> ${result}`);
        return result;
      } catch (e) {
        console.error(`[DEBUG] Failed to parse date: ${dateStr}, ${timeStr}`, e);
        return new Date(now.getTime() + 86400000); 
      }
    };

    const start = createSafeDate(s.event_date, s.start_time);
    const end = createSafeDate(s.event_date, s.end_time);
    
    // Start scanning 30 minutes before
    const ongoingStart = new Date(start.getTime() - 30 * 60000);

    console.log(`[DEBUG] Schedule ${s.event_schedule_id}: now=${now.toISOString()}, ongoingStart=${ongoingStart.toISOString()}, start=${start.toISOString()}, end=${end.toISOString()}`);

    let status: 'ongoing' | 'upcoming' | 'completed' = 'upcoming';

    if (now >= ongoingStart && now <= end) {
      status = 'ongoing';
    } else if (now > end) {
      status = 'completed';
    }
    
    console.log(`[DEBUG] Schedule ${s.event_schedule_id} status: ${status}`);

    return {
      id: s.event_schedule_id, 
      event_date: s.event_date,
      start_time: s.start_time,
      end_time: s.end_time,
      status
    }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>

  if (error || schedules.length === 0) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center text-center">
        <AlertCircle className="text-destructive w-12 h-12 mb-4" />
        <h3 className="text-xl font-bold mb-2">No Schedules Found</h3>
        <p className="text-muted-foreground mb-6">Could not find schedules for this event ID.</p>
        <Link to="/events" className="px-6 py-2 bg-secondary rounded-xl font-medium">Back to Events</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 relative p-4">
      <div className="mb-6 pt-2">
        <Link to="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Events
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          {eventDetails?.event_name || 'Event Schedules'}
        </h1>
        <p className="text-muted-foreground text-sm">Select a time slot to manage.</p>
      </div>

      <div className="space-y-3">
        {uniqueSchedules.map(schedule => (
          <ScheduleCard
            key={schedule.event_schedule_id}
            schedule={getScheduleForCard(schedule)}
            isSelected={selectedScheduleId === schedule.event_schedule_id}
            onSelect={() => setSelectedScheduleId(schedule.event_schedule_id)}
          />
        ))}
      </div>

      {selectedScheduleId && (
        <div className="fixed bottom-6 left-4 right-4 z-40 animate-in slide-in-from-bottom-4">
          <button
            onClick={handlePreview}
            className="w-full bg-primary text-primary-foreground font-bold p-4 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Preview Registrations</span>
            <ChevronRight size={20} />
          </button>
          <p className="text-center text-[10px] text-muted-foreground mt-2 bg-background/80 backdrop-blur py-1 rounded-full">
            Proceed to see participants and start scanning
          </p>
        </div>
      )}
    </div>
  )
}
