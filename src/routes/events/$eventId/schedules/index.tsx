import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ChevronRight, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import Loader from '@/components/Loader'
import { ScheduleCard } from '@/components/ScheduleCard'
import { LockedScheduleBar } from '@/components/LockedScheduleBar'
import { ConfirmationModal } from '@/components/ConfirmationModal'

// Define the route
export const Route = createFileRoute('/events/$eventId/schedules/')({
  component: ScheduleSelection,
})

// Types (adjust based on actual API response)
interface Schedule {
  id: string
  event_date: string
  start_time: string
  end_time: string
  venue: string
}

interface EventData {
  event_id: string
  event_name: string
  schedules?: Schedule[]
}

function ScheduleSelection() {
  const { eventId } = Route.useParams()
  const navigate = useNavigate()

  // State
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [lockedSchedule, setLockedSchedule] = useState<Schedule | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // // Fetch Data
  // const { data: event, isLoading, error } = useQuery({
  //   queryKey: ['events', eventId, 'schedules'],
  //   enabled: !!eventId,
  //   queryFn: async () => {
  //     const res = await api.get('/')
  //     console.log('Fetching schedules for event:', eventId, 'Response:', res.data) // Debug log

  //     const allEvents = (res.data.events || res.data || []) as EventData[]
  //     // Ensure strict string comparison to avoid type mismatches
  //     const foundEvent = allEvents.find(e => String(e.id) === String(eventId))

  //     if (!foundEvent) {
  //       console.error('Event not found in list. Available IDs:', allEvents.map(e => e.id))
  //       throw new Error('Event not found')
  //     }
  //     return foundEvent
  //   }
  // })

  const mockEventsResponse = {
    "events": [
      {
        "event_id": "ca12c02c-32ca-4568-8250-f63c516747e0",
        "event_name": "Chimay Grande Réserve 7",
        "is_group": false,
        "schedules": [
          {
            "end_time": "2025-07-21T12:00:00",
            "event_date": "2025-12-28",
            "id": "2a545486-1c4b-4531-919d-edfa74ff4e77",
            "start_time": "2025-07-21T10:00:00",
            "venue": "New Orleans"
          }
        ]
      },
      {
        "event_id": "449ac1f6-b4de-48d7-8287-6b22ec7c8e5b",
        "event_name": "St. Bernardus Abt 12 9",
        "is_group": false,
        "schedules": [
          {
            "end_time": "2025-07-21T12:00:00",
            "event_date": "2025-12-28",
            "id": "443a44d8-e1d0-4772-852f-829511bfe09f",
            "start_time": "2025-07-21T10:00:00",
            "venue": "Irvine"
          }
        ]
      },
      {
        "event_id": "842237b0-0e4e-4de4-9caf-35c738b80054",
        "event_name": "Tech Workshop",
        "is_group": false,
        "schedules": [
          {
            "end_time": "2025-07-21T12:00:00",
            "event_date": "2025-12-28",
            "id": "37967365-3d43-4fdf-bfa6-ae25fc364e89",
            "start_time": "2025-07-21T10:00:00",
            "venue": "Online Zoom Room"
          }
        ]
      },
      {
        "event_id": "d6f14e6d-6627-400d-8b97-593877aabf82",
        "event_name": "Ten FIDY 5",
        "is_group": true,
        "schedules": [
          {
            "end_time": "2025-07-21T12:00:00",
            "event_date": "2025-12-28",
            "id": "e275a2a7-b100-4c80-b1b2-5471e6afe4cb",
            "start_time": "2025-07-21T10:00:00",
            "venue": "Buffalo"
          }
        ]
      },
      {
        "event_id": "4418e0a0-7357-4f3a-8c85-4b5e5d948c4f",
        "event_name": "Two Hearted Ale 3",
        "is_group": true,
        "schedules": [
          {
            "end_time": "2025-07-21T12:00:00",
            "event_date": "2025-12-28",
            "id": "57df9c95-293b-472a-85a7-2b8c5e0f7896",
            "start_time": "2025-07-21T10:00:00",
            "venue": "Laredo"
          }
        ]
      }
    ],
    "message": "Events fetched successfully"
  }

  // Find the event matching the current eventId
  const event = (mockEventsResponse.events as unknown as EventData[]).find(e => e.event_id === eventId) || mockEventsResponse.events[0] as unknown as EventData

  const isLoading = false
  const error = null
  // Handlers
  const handleSelect = (scheduleId: string) => {
    if (lockedSchedule) return
    setSelectedScheduleId(scheduleId)
  }

  const handleLock = () => {
    if (!selectedScheduleId || !event?.schedules) return
    const schedule = event.schedules.find(s => s.id === selectedScheduleId)
    if (schedule) {
      setLockedSchedule(schedule)
    }
  }

  const handleChangeScheduleRequest = () => {
    setIsModalOpen(true)
  }

  const handleConfirmChange = () => {
    setLockedSchedule(null)
    setSelectedScheduleId(null)
    setIsModalOpen(false)
  }

  const handleProceed = () => {
    if (lockedSchedule) {
      // Navigate to attendance page or next step
      navigate({ to: `/events/${eventId}/schedules/${lockedSchedule.id}/attendance` } as any)
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  // Error State
  if (error || !event) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center text-center">
        <AlertCircle className="text-destructive w-12 h-12 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error Loading Schedules</h3>
        <p className="text-muted-foreground mb-6">Could not find the requested event.</p>
        <Link to="/dashboard" className="px-6 py-2 bg-secondary rounded-xl font-medium">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const schedules = event.schedules || []

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {/* Locked Bar */}
      {lockedSchedule && (
        <LockedScheduleBar
          eventName={event.event_name}
          scheduleDate={lockedSchedule.event_date}
          startTime={lockedSchedule.start_time}
          endTime={lockedSchedule.end_time}
          onChangeSchedule={handleChangeScheduleRequest}
        />
      )}

      <div className="p-4 pt-6">
        {/* Header (Only show if not locked to reduce clutter, or keep for context? Requirement says "Persistent schedule Bar" serves as context. Let's hide big header if locked to focus on task) */}
        {!lockedSchedule && (
          <div className="mb-6">
            <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ChevronRight className="rotate-180 mr-1" size={16} /> Back to Events
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{event.event_name}</h1>
            <p className="text-muted-foreground">Select a schedule to begin tracking attendance.</p>
          </div>
        )}

        {/* Schedules List */}
        <div className={`space-y-4 transition-opacity duration-300 ${lockedSchedule ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
          {schedules.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-2xl text-muted-foreground">
              No schedules found for this event.
            </div>
          ) : (
            schedules.map(schedule => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                isSelected={selectedScheduleId === schedule.id}
                onSelect={() => handleSelect(schedule.id)}
              />
            ))
          )}
        </div>

        {/* Floating "Lock & Continue" Button for selection phase */}
        {!lockedSchedule && selectedScheduleId && (
          <div className="fixed bottom-6 left-4 right-4 z-40 animate-in slide-in-from-bottom-4">
            <button
              onClick={handleLock}
              className="w-full bg-primary text-primary-foreground font-bold p-4 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Lock Schedule</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* "Proceed to Attendance" Button if Locked (or maybe we just show the attendance view? The prompt says "Locked schedule selection flow... ensures correct context before attendance begins". 
                     So after locking, we probably stay here or show the attendance UI. 
                     "No attendance allowed until schedule is locked". 
                     I will add a specific "Start Attendance" button after locking, or maybe the "Attendance" UI appears below. 
                     Let's add a "Start Attendance" button for now to navigate to the preview/attendance page.
                  */}
        {lockedSchedule && (
          <div className="fixed bottom-6 left-4 right-4 z-40 animate-in slide-in-from-bottom-4">
            <button
              onClick={handleProceed}
              className="w-full bg-green-600 text-white font-bold p-4 rounded-xl shadow-lg shadow-green-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Start Attendance</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmChange}
        title="Change Schedule?"
        description="Changing the schedule will reset your current selection. You will need to select and lock a schedule again."
      />
    </div>
  )
}
