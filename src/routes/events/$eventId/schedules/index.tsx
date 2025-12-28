import { useNavigate, createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import Loader from '@/components/Loader'
import { ScheduleCard } from '@/components/ScheduleCard'

export const Route = createFileRoute('/events/$eventId/schedules/')({
  component: ScheduleSelection,
})

// Shared Interface (should ideally be in a types file)
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
}

function ScheduleSelection() {
  const { eventId } = Route.useParams()
  const navigate = useNavigate()
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)

  // Fetch all schedules (cached from previous screen usually)
  const { data: rawSchedules, isLoading, error } = useQuery({
    queryKey: ['attendance', 'events-list'],
    queryFn: async () => {
      const res = await api.get('/attendance/list/event')
      console.log("Schedules List Response:", res.data); // DEBUG
      const data = res.data.events || res.data.data || res.data
      return (Array.isArray(data) ? data : []) as ScheduleItem[]
    }
  })

  // Filter for this event
  const schedules = (rawSchedules || []).filter(s => s.event_id === eventId)
  const eventDetails = schedules[0] // Get event metadata from first schedule

  // Handler
  const handlePreview = () => {
    if (selectedScheduleId) {
      navigate({ to: `/events/${eventId}/schedules/${selectedScheduleId}/preview` } as any)
    }
  }

  // Deduplicate schedules based on event_schedule_id
  const uniqueSchedules = Array.from(new Map(schedules.map(item => [item.event_schedule_id, item])).values());

  // Adapter for ScheduleCard component
  const getScheduleForCard = (s: ScheduleItem) => {
      const now = new Date();
      
      const createSafeDate = (dateStr: string, timeStr: string) => {
          try {
             // Check if timeStr contains a date
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
                 let [h, m, sec] = timePart.split(':').map(Number);
                 if (modifier.toLowerCase() === 'pm' && h < 12) h += 12;
                 if (modifier.toLowerCase() === 'am' && h === 12) h = 0;
                 hours = h; minutes = m; seconds = sec || 0;
            } else if (cleanTime) { 
                 [hours, minutes, seconds] = cleanTime.split(':').map(Number);
            }

            return new Date(year, month - 1, day, hours, minutes, seconds || 0);
          } catch (e) {
              console.error("Schedule Parse Error", e);
              return new Date(now.getTime() + 86400000); 
          }
      };

      const start = createSafeDate(s.event_date, s.start_time);
      const end = createSafeDate(s.event_date, s.end_time);
      
      // Calculate "Ongoing" window
      const ongoingStart = new Date(start.getTime() - 30 * 60000);

      let status: 'ongoing' | 'upcoming' | 'completed' = 'upcoming';

      if (now >= ongoingStart && now <= end) {
          status = 'ongoing';
      } else if (now > end) {
          status = 'completed';
      } else {
          status = 'upcoming'; 
      }

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
        {/* Header */}
        <div className="mb-6 pt-2">
           <Link to="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Events
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            {eventDetails?.event_name || 'Event Schedules'}
          </h1>
          <p className="text-muted-foreground text-sm">Select a time slot to manage.</p>
        </div>

        {/* List */}
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

         {/* Floating "Preview" Button */}
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
