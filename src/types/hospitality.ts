// ============ Core Types ============

/** Hospitality ID format: A123 (1 uppercase letter + 3 digits) */
export type HospitalityID = string // Regex: ^[A-Z][0-9]{3}$

export type UserRole = 'HOSP_1' | 'HOSP_2' | 'FINANCE' | 'SECURITY'

export type StudentType = 'EXTERNAL' | 'AMRITA_SISTER'

export type AccommodationStatus =
  | 'NONE' // No accommodation needed / daily check-in
  | 'REQUESTED' // External student selected hostel, awaiting payment
  | 'PAID' // Payment verified, awaiting hostel check-in
  | 'CHECKED_IN' // Checked into hostel
  | 'CHECKED_OUT' // Final check-out completed

export type AccommodationType = 'NONE' | 'HOSTEL'

// ============ ProfileQR Data ============

/** Data extracted from ProfileQR - only contains student_id */
export interface ProfileQRData {
  student_id: string
}

// ============ Student Profile ============

/** Student profile fetched from mock database using student_id */
export interface StudentProfile {
  student_id: string
  name: string
  email: string
  phone: string
  college: string
  student_type: StudentType
}

// ============ Student Record ============

/** Main student record after HospitalityID mapping */
export interface StudentRecord {
  // Identity
  hospitality_id: HospitalityID
  student_id: string

  // Profile Data (immutable after creation)
  name: string
  email: string
  phone: string
  college: string
  student_type: StudentType

  // Accommodation Details
  accommodation_type: AccommodationType
  accommodation_status: AccommodationStatus
  hostel_name?: string

  // Timestamps (all ISO strings)
  check_in_date?: string // Set by HOSP_1
  hostel_check_in_date?: string // Set by HOSP_2
  check_out_date?: string // Final check-out timestamp
  payment_timestamp?: string // Set by FINANCE

  // Daily Check-in/out (for NONE accommodation only)
  daily_check_ins?: DailyCheckIn[]

  // Metadata
  created_at: string
  updated_at: string
}

export interface DailyCheckIn {
  date: string // YYYY-MM-DD
  check_in_time: string // ISO timestamp
  check_out_time?: string // ISO timestamp (null if still checked in)
}

// ============ Hostel Configuration ============

export interface Hostel {
  id: string
  name: string
  total_beds: number
  occupied_beds: number
  available_beds: number
}

// ============ Scanner State ============

export type ScannerStep = 'PROFILE_QR' | 'HOSP_ID' | 'ACCOMMODATION' | 'CONFIRM' | 'COMPLETE'

export interface ScannerState {
  step: ScannerStep
  scannedStudentId?: string
  studentProfile?: StudentProfile
  scannedHospId?: HospitalityID
  accommodationType?: AccommodationType
  selectedHostel?: Hostel
  isProcessing: boolean
  scanResult?: 'success' | 'error'
}

// ============ API Request Types ============

export interface CreateStudentMappingRequest {
  student_id: string
  hospitality_id: HospitalityID
  accommodation_type: AccommodationType
  hostel_name?: string
  check_in_date?: string
}

export interface UpdateStudentRequest {
  hospitality_id: HospitalityID
  check_in_date?: string
}

export interface PaymentRequest {
  hospitality_id: HospitalityID
}

export interface HostelCheckInRequest {
  hospitality_id: HospitalityID
}

export interface DailyCheckInOutRequest {
  hospitality_id: HospitalityID
  is_checking_out: boolean
}

export interface FinalCheckOutRequest {
  hospitality_id: HospitalityID
}

// ============ API Response Types ============

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface StudentListResponse {
  students: StudentRecord[]
  total: number
}

export interface HostelListResponse {
  hostels: Hostel[]
}

export interface StatsResponse {
  total_students: number
  checked_in: number
  awaiting_payment: number
  awaiting_hostel_checkin: number
  checked_out: number
  daily_checkins: number
}

// ============ UI Component Props ============

export interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  isLoading?: boolean
}

export interface StudentCardProps {
  student: StudentProfile | StudentRecord
  showStatus?: boolean
  showEditButton?: boolean
  onEdit?: () => void
}

export interface HostelSelectorProps {
  hostels: Hostel[]
  selectedHostelId?: string
  onSelect: (hostel: Hostel) => void
  isLoading?: boolean
}

export interface RoleCardProps {
  role: UserRole
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

// ============ Utility Functions ============

/** Validate HospitalityID format (A123) */
export function isValidHospitalityID(id: string): id is HospitalityID {
  return /^[A-Z][0-9]{3}$/.test(id)
}

/** Get display label for accommodation status */
export function getStatusLabel(status: AccommodationStatus): string {
  const labels: Record<AccommodationStatus, string> = {
    NONE: 'No Accommodation',
    REQUESTED: 'Awaiting Payment',
    PAID: 'Payment Verified',
    CHECKED_IN: 'Checked In',
    CHECKED_OUT: 'Checked Out',
  }
  return labels[status]
}

/** Get status badge color */
export function getStatusColor(
  status: AccommodationStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const colors: Record<AccommodationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    NONE: 'secondary',
    REQUESTED: 'outline',
    PAID: 'default',
    CHECKED_IN: 'default',
    CHECKED_OUT: 'secondary',
  }
  return colors[status]
}
