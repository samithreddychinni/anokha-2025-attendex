/**
 * In-memory mock database for hospitality system
 * Simulates a real database with automatic timestamp management
 */

import type {
  StudentProfile,
  StudentRecord,
  Hostel,
  HospitalityID,
  StudentType,
} from '@/types/hospitality'

// ============ Seed Data ============

const SEED_STUDENT_PROFILES: StudentProfile[] = [
  {
    student_id: 'STU001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    phone: '9876543210',
    college: 'VIT Chennai',
    student_type: 'EXTERNAL',
  },
  {
    student_id: 'STU002',
    name: 'Priya Krishnan',
    email: 'priya.k@gmail.com',
    phone: '9876543211',
    college: 'Amrita Coimbatore',
    student_type: 'AMRITA_SISTER',
  },
  {
    student_id: 'STU003',
    name: 'Arun Kumar',
    email: 'arun.kumar@gmail.com',
    phone: '9876543212',
    college: 'SRM Chennai',
    student_type: 'EXTERNAL',
  },
  {
    student_id: 'STU004',
    name: 'Deepa Menon',
    email: 'deepa.m@gmail.com',
    phone: '9876543213',
    college: 'Amrita Bangalore',
    student_type: 'AMRITA_SISTER',
  },
  {
    student_id: 'STU005',
    name: 'Vikram Reddy',
    email: 'vikram.r@gmail.com',
    phone: '9876543214',
    college: 'BITS Pilani',
    student_type: 'EXTERNAL',
  },
  {
    student_id: 'STU006',
    name: 'Ananya Nair',
    email: 'ananya.n@gmail.com',
    phone: '9876543215',
    college: 'NIT Trichy',
    student_type: 'EXTERNAL',
  },
  {
    student_id: 'STU007',
    name: 'Karthik Iyer',
    email: 'karthik.i@gmail.com',
    phone: '9876543216',
    college: 'Amrita Amritapuri',
    student_type: 'AMRITA_SISTER',
  },
  {
    student_id: 'STU008',
    name: 'Sneha Pillai',
    email: 'sneha.p@gmail.com',
    phone: '9876543217',
    college: 'PSG Tech',
    student_type: 'EXTERNAL',
  },
  {
    student_id: 'STU009',
    name: 'Arjun Das',
    email: 'arjun.d@gmail.com',
    phone: '9876543218',
    college: 'CEG Anna University',
    student_type: 'EXTERNAL',
  },
  {
    student_id: 'STU010',
    name: 'Meera Suresh',
    email: 'meera.s@gmail.com',
    phone: '9876543219',
    college: 'Amrita Kochi',
    student_type: 'AMRITA_SISTER',
  },
]

const SEED_HOSTELS: Hostel[] = [
  {
    id: 'H001',
    name: 'Vashista',
    sharing: 'Single Share',
    price: 2000,
    total_beds: 100,
    occupied_beds: 45,
    available_beds: 55,
  },
  {
    id: 'H002',
    name: 'Vashista',
    sharing: 'Dormitory',
    price: 1000,
    total_beds: 80,
    occupied_beds: 42,
    available_beds: 38,
  },
  {
    id: 'H003',
    name: 'Gangaaaaaaaaaaaaaa',
    sharing: 'Double Share',
    price: 1500,
    total_beds: 50,
    occupied_beds: 35,
    available_beds: 15,
  },
  {
    id: 'H004',
    name: 'Yamuna',
    sharing: 'Triple Share',
    price: 1200,
    total_beds: 120,
    occupied_beds: 90,
    available_beds: 30,
  },
]

// ============ Mock Database Class ============

class MockDatabase {
  private studentProfiles: Map<string, StudentProfile> = new Map()
  private studentRecords: Map<HospitalityID, StudentRecord> = new Map()
  private studentIdToHospId: Map<string, HospitalityID> = new Map()
  private usedHospitalityIDs: Set<HospitalityID> = new Set()
  private hostels: Hostel[] = []

  constructor() {
    this.initialize()
  }

  private initialize() {
    // Initialize student profiles
    for (const profile of SEED_STUDENT_PROFILES) {
      this.studentProfiles.set(profile.student_id, profile)
    }

    // Initialize hostels
    this.hostels = [...SEED_HOSTELS]
  }

  // ============ Student Profile Methods ============

  getStudentProfile(studentId: string): StudentProfile | undefined {
    return this.studentProfiles.get(studentId)
  }

  getAllStudentProfiles(): StudentProfile[] {
    return Array.from(this.studentProfiles.values())
  }

  // ============ Student Record Methods ============

  addStudentRecord(record: StudentRecord): void {
    this.studentRecords.set(record.hospitality_id, record)
    this.studentIdToHospId.set(record.student_id, record.hospitality_id)
    this.usedHospitalityIDs.add(record.hospitality_id)
  }

  getStudentRecord(hospId: HospitalityID): StudentRecord | undefined {
    return this.studentRecords.get(hospId)
  }

  getStudentRecordByStudentId(studentId: string): StudentRecord | undefined {
    const hospId = this.studentIdToHospId.get(studentId)
    if (!hospId) return undefined
    return this.studentRecords.get(hospId)
  }

  updateStudentRecord(hospId: HospitalityID, updates: Partial<StudentRecord>): void {
    const record = this.studentRecords.get(hospId)
    if (record) {
      this.studentRecords.set(hospId, {
        ...record,
        ...updates,
        updated_at: new Date().toISOString(),
      })
    }
  }

  getAllStudentRecords(): StudentRecord[] {
    return Array.from(this.studentRecords.values())
  }

  // ============ Hospitality ID Methods ============

  isHospitalityIDUsed(hospId: HospitalityID): boolean {
    return this.usedHospitalityIDs.has(hospId)
  }

  isStudentMapped(studentId: string): boolean {
    return this.studentIdToHospId.has(studentId)
  }

  getHospIdByStudentId(studentId: string): HospitalityID | undefined {
    return this.studentIdToHospId.get(studentId)
  }

  // ============ Hostel Methods ============

  getHostels(): Hostel[] {
    return [...this.hostels]
  }

  getHostelById(hostelId: string): Hostel | undefined {
    return this.hostels.find((h) => h.id === hostelId)
  }

  getHostelByName(hostelName: string): Hostel | undefined {
    return this.hostels.find((h) => h.name === hostelName)
  }

  updateHostelOccupancy(hostelId: string, delta: number): void {
    const hostel = this.hostels.find((h) => h.id === hostelId)
    if (hostel) {
      hostel.occupied_beds += delta
      hostel.available_beds = hostel.total_beds - hostel.occupied_beds
    }
  }

  // ============ Statistics Methods ============

  getStats() {
    const records = this.getAllStudentRecords()
    return {
      total_students: records.length,
      checked_in: records.filter((r) => r.accommodation_status === 'CHECKED_IN').length,
      awaiting_payment: records.filter((r) => r.accommodation_status === 'REQUESTED').length,
      awaiting_hostel_checkin: records.filter((r) => r.accommodation_status === 'PAID').length,
      checked_out: records.filter((r) => r.accommodation_status === 'CHECKED_OUT').length,
      daily_checkins: records.filter((r) => r.accommodation_status === 'NONE').length,
    }
  }

  // ============ Reset (for testing) ============

  reset(): void {
    this.studentRecords.clear()
    this.studentIdToHospId.clear()
    this.usedHospitalityIDs.clear()
    this.initialize()
  }
}

// Export singleton instance
export const mockDB = new MockDatabase()

// Export types for external use
export type { StudentProfile, StudentRecord, Hostel, StudentType }
