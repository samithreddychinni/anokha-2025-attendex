export interface Participant {
  id: string;
  name: string;
  college: string;
  category: 'EXTERNAL_NO_ACCO' | 'EXTERNAL_WITH_ACCO' | 'SISTER_CAMPUS' | 'SISTER_CAMPUS_HOSTELLER';
  day_scholar: boolean;
  req_accommodation: boolean;
  profile_qr: string;
  hospitality_qr: string | null;
  hostel_assigned: string | null;
  status: 'SCANNED' | 'MAPPED' | 'PAYMENT_PENDING' | 'PAYMENT_DONE' | 'CHECKED_IN' | 'CHECKED_OUT';
  payment_required: boolean;
}

export const MOCK_PARTICIPANTS: Participant[] = [
  {
    id: '1',
    name: 'Arjun R',
    college: 'Amrita School of Engineering, Bengaluru',
    category: 'SISTER_CAMPUS',
    day_scholar: false,
    req_accommodation: true,
    profile_qr: 'PROF-001',
    hospitality_qr: null,
    hostel_assigned: null,
    status: 'SCANNED',
    payment_required: true,
  },
  {
    id: '2',
    name: 'Sneha P',
    college: 'External College XYZ',
    category: 'EXTERNAL_WITH_ACCO',
    day_scholar: false,
    req_accommodation: true,
    profile_qr: 'PROF-002',
    hospitality_qr: 'HOSP-102',
    hostel_assigned: null,
    status: 'MAPPED',
    payment_required: true,
  },
  {
    id: '3',
    name: 'Rahul K',
    college: 'Amrita Coimbatore',
    category: 'SISTER_CAMPUS_HOSTELLER',
    day_scholar: true,
    req_accommodation: false,
    profile_qr: 'PROF-003',
    hospitality_qr: null,
    hostel_assigned: null,
    status: 'SCANNED',
    payment_required: false,
  },
];

export const HOSTELS = [
  'Vasishta',
  'Gargi',
  'Maitreyi',
  'Vyasa',
  'Agastya',
];

// Helper to simulate API delay
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getParticipantByQR = async (qrCode: string): Promise<Participant | null> => {
  await delay(800);
  const p = MOCK_PARTICIPANTS.find((p) => p.profile_qr === qrCode);
  if (p) return { ...p }; // Return copy
  return null;
};

export const updateParticipantMock = async (participant: Participant): Promise<boolean> => {
  await delay(500);
  console.log('Updated Participant:', participant);
  return true;
};
