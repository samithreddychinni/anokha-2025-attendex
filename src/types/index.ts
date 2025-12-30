export interface Organizer {
  id: string
  name: string
  email: string
  org_type: string
}

export interface AuthContextType {
  user: Organizer | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export interface Participant {
  attendance_id?: number
  student_id?: string
  student_name?: string
  student_email?: string
  check_in?: string | null
  check_out?: string | null
  id?: string
  name?: string
  email?: string
  status?: 'present' | 'absent'
}

export interface TeamResponse {
  team_name?: string
  students: Participant[]
}

export type RawParticipantData = Participant | TeamResponse

export interface ScheduleItem {
  event_id: string
  event_schedule_id: string
  event_name: string
  event_date: string
  start_time: string
  end_time: string
  venue: string
  is_group?: boolean | string
  event_type?: string
  poster_url?: string
}

export interface ScheduleCardProps {
  id: string
  event_date: string
  start_time: string
  end_time: string
  status: 'ongoing' | 'upcoming' | 'completed'
}

export interface ScanData {
  studentId: string
  eventId: string  // QR code contains eventId, not scheduleId
}
