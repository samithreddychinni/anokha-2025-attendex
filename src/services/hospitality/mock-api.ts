/**
 * Mock API service with async methods simulating network delay
 * All methods return Promises to mimic real API behavior
 */

import type {
  StudentProfile,
  StudentRecord,
  HospitalityID,
  AccommodationStatus,
  ApiResponse,
  StudentListResponse,
  HostelListResponse,
  StatsResponse,
  CreateStudentMappingRequest,
  UpdateStudentRequest,
  DailyCheckIn,
} from '@/types/hospitality'
import { mockDB } from './mock-data'

// ============ Helper Functions ============

/** Simulate network delay */
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms))

/** Random delay between min and max ms */
const randomDelay = (min: number = 300, max: number = 700) =>
  delay(Math.floor(Math.random() * (max - min + 1)) + min)

// ============ Mock API Service ============

export const hospitalityMockAPI = {
  // ========== Profile Queries ==========

  /**
   * Get student profile by student_id (from ProfileQR scan)
   * Used by HOSP_1 to fetch student details after scanning ProfileQR
   */
  async getStudentProfileById(studentId: string): Promise<ApiResponse<StudentProfile>> {
    await randomDelay()

    const profile = mockDB.getStudentProfile(studentId)
    if (!profile) {
      return { success: false, error: 'Student not found in database' }
    }

    // Check if already mapped
    const existingRecord = mockDB.getStudentRecordByStudentId(studentId)
    if (existingRecord) {
      return {
        success: false,
        error: `Student already mapped to Hospitality ID: ${existingRecord.hospitality_id}`,
      }
    }

    return { success: true, data: profile }
  },

  /**
   * Get student record by HospitalityID
   * Used by all roles to fetch student details after scanning HospitalityQR
   */
  async getStudentByHospId(hospId: HospitalityID): Promise<ApiResponse<StudentRecord>> {
    await randomDelay()

    if (!/^[A-Z][0-9]{3}$/.test(hospId)) {
      return { success: false, error: 'Invalid Hospitality ID format (expected: A123)' }
    }

    const record = mockDB.getStudentRecord(hospId)
    if (!record) {
      return { success: false, error: 'No student mapped to this Hospitality ID' }
    }

    return { success: true, data: record }
  },

  // ========== HOSP_1 Operations ==========

  /**
   * Create student mapping (HOSP_1)
   * Maps a student_id to a HospitalityID with accommodation details
   */
  async createStudentMapping(req: CreateStudentMappingRequest): Promise<ApiResponse<StudentRecord>> {
    await randomDelay(500, 800)

    // Validate Hospitality ID format
    if (!/^[A-Z][0-9]{3}$/.test(req.hospitality_id)) {
      return { success: false, error: 'Invalid Hospitality ID format (expected: A123)' }
    }

    // Check if Hospitality ID already used
    if (mockDB.isHospitalityIDUsed(req.hospitality_id)) {
      return { success: false, error: 'Hospitality ID already in use' }
    }

    // Check if student already mapped
    if (mockDB.isStudentMapped(req.student_id)) {
      const existingHospId = mockDB.getHospIdByStudentId(req.student_id)
      return { success: false, error: `Student already mapped to: ${existingHospId}` }
    }

    // Get student profile
    const profile = mockDB.getStudentProfile(req.student_id)
    if (!profile) {
      return { success: false, error: 'Student profile not found' }
    }

    // Validate hostel selection if accommodation type is HOSTEL
    if (req.accommodation_type === 'HOSTEL' && !req.hostel_name) {
      return { success: false, error: 'Hostel name required for hostel accommodation' }
    }

    // Determine initial status based on student type and accommodation
    let initialStatus: AccommodationStatus = 'NONE'
    if (req.accommodation_type === 'HOSTEL') {
      if (profile.student_type === 'AMRITA_SISTER') {
        initialStatus = 'PAID' // Skip finance for Amrita students
      } else {
        initialStatus = 'REQUESTED' // External students need to pay
      }
    }

    const now = new Date().toISOString()
    const record: StudentRecord = {
      hospitality_id: req.hospitality_id,
      student_id: req.student_id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      college: profile.college,
      student_type: profile.student_type,
      accommodation_type: req.accommodation_type,
      accommodation_status: initialStatus,
      hostel_name: req.hostel_name,
      check_in_date: req.check_in_date || now,
      daily_check_ins: req.accommodation_type === 'NONE' ? [] : undefined,
      created_at: now,
      updated_at: now,
    }

    mockDB.addStudentRecord(record)

    let message = 'Student registered successfully'
    if (initialStatus === 'REQUESTED') {
      message = 'Student registered. Redirect to Finance for payment.'
    } else if (initialStatus === 'PAID') {
      message = 'Student registered. Redirect to HOSP_2 for hostel check-in.'
    }

    return { success: true, data: record, message }
  },

  /**
   * Update student metadata (HOSP_1)
   * Only check_in_date can be edited
   */
  async updateStudent(req: UpdateStudentRequest): Promise<ApiResponse<StudentRecord>> {
    await randomDelay()

    const record = mockDB.getStudentRecord(req.hospitality_id)
    if (!record) {
      return { success: false, error: 'Student not found' }
    }

    mockDB.updateStudentRecord(req.hospitality_id, {
      check_in_date: req.check_in_date,
    })

    const updated = mockDB.getStudentRecord(req.hospitality_id)!
    return { success: true, data: updated, message: 'Student updated successfully' }
  },

  /**
   * Daily check-in/out for NONE accommodation students (HOSP_1)
   */
  async dailyCheckInOut(
    hospId: HospitalityID,
    isCheckingOut: boolean
  ): Promise<ApiResponse<StudentRecord>> {
    await randomDelay()

    const record = mockDB.getStudentRecord(hospId)
    if (!record) {
      return { success: false, error: 'Student not found' }
    }

    if (record.accommodation_status !== 'NONE') {
      return {
        success: false,
        error: 'Daily check-in/out only available for students without hostel accommodation',
      }
    }

    const today = new Date().toISOString().split('T')[0]
    const dailyCheckIns = record.daily_check_ins || []
    const todayRecord = dailyCheckIns.find((d) => d.date === today)

    if (isCheckingOut) {
      if (!todayRecord || todayRecord.check_out_time) {
        return { success: false, error: 'No active check-in to close for today' }
      }
      todayRecord.check_out_time = new Date().toISOString()
    } else {
      if (todayRecord && !todayRecord.check_out_time) {
        return { success: false, error: 'Already checked in today' }
      }
      const newCheckIn: DailyCheckIn = {
        date: today,
        check_in_time: new Date().toISOString(),
      }
      dailyCheckIns.push(newCheckIn)
    }

    mockDB.updateStudentRecord(hospId, { daily_check_ins: dailyCheckIns })

    const updated = mockDB.getStudentRecord(hospId)!
    return {
      success: true,
      data: updated,
      message: isCheckingOut ? 'Daily check-out successful' : 'Daily check-in successful',
    }
  },

  /**
   * Final check-out for hostel students (HOSP_1)
   * Changes status from CHECKED_IN to CHECKED_OUT
   */
  async finalCheckOut(hospId: HospitalityID): Promise<ApiResponse<StudentRecord>> {
    await randomDelay()

    const record = mockDB.getStudentRecord(hospId)
    if (!record) {
      return { success: false, error: 'Student not found' }
    }

    if (record.accommodation_status !== 'CHECKED_IN') {
      return {
        success: false,
        error: `Cannot checkout. Current status: ${record.accommodation_status}`,
      }
    }

    mockDB.updateStudentRecord(hospId, {
      accommodation_status: 'CHECKED_OUT',
      check_out_date: new Date().toISOString(),
    })

    // Update hostel occupancy
    if (record.hostel_name) {
      const hostel = mockDB.getHostelByName(record.hostel_name)
      if (hostel) {
        mockDB.updateHostelOccupancy(hostel.id, -1)
      }
    }

    const updated = mockDB.getStudentRecord(hospId)!
    return { success: true, data: updated, message: 'Final check-out completed' }
  },

  // ========== FINANCE Operations ==========

  /**
   * Process payment (FINANCE)
   * Changes status from REQUESTED to PAID
   */
  async processPayment(hospId: HospitalityID): Promise<ApiResponse<StudentRecord>> {
    await randomDelay(600, 900)

    const record = mockDB.getStudentRecord(hospId)
    if (!record) {
      return { success: false, error: 'Student not found' }
    }

    if (record.accommodation_status !== 'REQUESTED') {
      return {
        success: false,
        error: `Cannot process payment. Current status: ${record.accommodation_status}`,
      }
    }

    mockDB.updateStudentRecord(hospId, {
      accommodation_status: 'PAID',
      payment_timestamp: new Date().toISOString(),
    })

    const updated = mockDB.getStudentRecord(hospId)!
    return {
      success: true,
      data: updated,
      message: 'Payment processed. Redirect student to HOSP_2 for hostel check-in.',
    }
  },

  // ========== HOSP_2 Operations ==========

  /**
   * Hostel check-in (HOSP_2)
   * Changes status from PAID to CHECKED_IN
   */
  async hostelCheckIn(hospId: HospitalityID): Promise<ApiResponse<StudentRecord>> {
    await randomDelay()

    const record = mockDB.getStudentRecord(hospId)
    if (!record) {
      return { success: false, error: 'Student not found' }
    }

    if (record.accommodation_status !== 'PAID') {
      if (record.accommodation_status === 'REQUESTED') {
        return { success: false, error: 'Payment not verified. Redirect to Finance first.' }
      }
      return {
        success: false,
        error: `Cannot check in. Current status: ${record.accommodation_status}`,
      }
    }

    if (!record.hostel_name) {
      return { success: false, error: 'No hostel assigned to this student' }
    }

    // Check hostel availability
    const hostel = mockDB.getHostelByName(record.hostel_name)
    if (!hostel || hostel.available_beds <= 0) {
      return { success: false, error: 'No beds available in assigned hostel' }
    }

    mockDB.updateStudentRecord(hospId, {
      accommodation_status: 'CHECKED_IN',
      hostel_check_in_date: new Date().toISOString(),
    })

    mockDB.updateHostelOccupancy(hostel.id, 1)

    const updated = mockDB.getStudentRecord(hospId)!
    return {
      success: true,
      data: updated,
      message: `Checked into ${record.hostel_name}`,
    }
  },

  // ========== Query Operations ==========

  /**
   * Get all student records
   */
  async getAllStudents(): Promise<ApiResponse<StudentListResponse>> {
    await randomDelay(300, 500)

    const students = mockDB.getAllStudentRecords()
    return {
      success: true,
      data: { students, total: students.length },
    }
  },

  /**
   * Get all hostels with availability
   */
  async getHostels(): Promise<ApiResponse<HostelListResponse>> {
    await randomDelay(200, 400)

    const hostels = mockDB.getHostels()
    return { success: true, data: { hostels } }
  },

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<ApiResponse<StatsResponse>> {
    await randomDelay(300, 500)

    const stats = mockDB.getStats()
    return { success: true, data: stats }
  },

  // ========== Utility Operations ==========

  /**
   * Check if a Hospitality ID is available
   */
  async checkHospIdAvailability(hospId: HospitalityID): Promise<ApiResponse<{ available: boolean }>> {
    await delay(200)

    if (!/^[A-Z][0-9]{3}$/.test(hospId)) {
      return { success: false, error: 'Invalid format' }
    }

    const available = !mockDB.isHospitalityIDUsed(hospId)
    return { success: true, data: { available } }
  },

  /**
   * Reset database (for testing)
   */
  async resetDatabase(): Promise<ApiResponse<void>> {
    await delay(100)
    mockDB.reset()
    return { success: true, message: 'Database reset' }
  },
}

export default hospitalityMockAPI
