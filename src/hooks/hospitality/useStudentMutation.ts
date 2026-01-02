'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { hospitalityMockAPI } from '@/services/hospitality/mock-api'
import type {
  CreateStudentMappingRequest,
  UpdateStudentRequest,
  HospitalityID,
} from '@/types/hospitality'

// Query keys
export const hospitalityKeys = {
  all: ['hospitality'] as const,
  students: () => [...hospitalityKeys.all, 'students'] as const,
  student: (hospId: string) => [...hospitalityKeys.all, 'student', hospId] as const,
  profile: (studentId: string) => [...hospitalityKeys.all, 'profile', studentId] as const,
  hostels: () => [...hospitalityKeys.all, 'hostels'] as const,
  stats: () => [...hospitalityKeys.all, 'stats'] as const,
}

// ============ Query Hooks ============

export function useStudentProfile(studentId: string | undefined) {
  return useQuery({
    queryKey: hospitalityKeys.profile(studentId || ''),
    queryFn: () => hospitalityMockAPI.getStudentProfileById(studentId!),
    enabled: !!studentId,
  })
}

export function useStudentRecord(hospId: HospitalityID | undefined) {
  return useQuery({
    queryKey: hospitalityKeys.student(hospId || ''),
    queryFn: () => hospitalityMockAPI.getStudentByHospId(hospId!),
    enabled: !!hospId,
  })
}

export function useHostels() {
  return useQuery({
    queryKey: hospitalityKeys.hostels(),
    queryFn: () => hospitalityMockAPI.getHostels(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useHospitalityStats() {
  return useQuery({
    queryKey: hospitalityKeys.stats(),
    queryFn: () => hospitalityMockAPI.getStats(),
    refetchInterval: 1000 * 30, // 30 seconds
  })
}

export function useAllStudents() {
  return useQuery({
    queryKey: hospitalityKeys.students(),
    queryFn: () => hospitalityMockAPI.getAllStudents(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// ============ Mutation Hooks ============

export function useCreateStudentMapping() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (req: CreateStudentMappingRequest) => hospitalityMockAPI.createStudentMapping(req),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Success', { description: response.message, position: 'bottom-center' })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.students() })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.stats() })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.hostels() })
      } else {
        toast.error('Error', { description: response.error, position: 'bottom-center' })
      }
    },
    onError: () => {
      toast.error('Error', { description: 'Failed to create student mapping', position: 'bottom-center' })
    },
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (req: UpdateStudentRequest) => hospitalityMockAPI.updateStudent(req),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success('Updated', { description: response.message, position: 'bottom-center' })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.student(variables.hospitality_id) })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.students() })
      } else {
        toast.error('Error', { description: response.error, position: 'bottom-center' })
      }
    },
  })
}

export function useProcessPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (hospId: HospitalityID) => hospitalityMockAPI.processPayment(hospId),
    onSuccess: (response, hospId) => {
      if (response.success) {
        toast.success('Payment Processed', { description: response.message, position: 'bottom-center' })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.student(hospId) })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.students() })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.stats() })
      } else {
        toast.error('Payment Failed', { description: response.error, position: 'bottom-center' })
      }
    },
  })
}

export function useHostelCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (hospId: HospitalityID) => hospitalityMockAPI.hostelCheckIn(hospId),
    onSuccess: (response, hospId) => {
      if (response.success) {
        toast.success('Check-in Complete', { description: response.message, position: 'bottom-center' })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.student(hospId) })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.students() })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.hostels() })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.stats() })
      } else {
        toast.error('Check-in Failed', { description: response.error, position: 'bottom-center' })
      }
    },
  })
}

export function useDailyCheckInOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ hospId, isCheckingOut }: { hospId: HospitalityID; isCheckingOut: boolean }) =>
      hospitalityMockAPI.dailyCheckInOut(hospId, isCheckingOut),
    onSuccess: (response, { hospId }) => {
      if (response.success) {
        toast.success('Success', { description: response.message, position: 'bottom-center' })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.student(hospId) })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.students() })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.stats() })
      } else {
        toast.error('Failed', { description: response.error, position: 'bottom-center' })
      }
    },
  })
}

export function useFinalCheckOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (hospId: HospitalityID) => hospitalityMockAPI.finalCheckOut(hospId),
    onSuccess: (response, hospId) => {
      if (response.success) {
        toast.success('Check-out Complete', { description: response.message, position: 'bottom-center' })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.student(hospId) })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.students() })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.hostels() })
        queryClient.invalidateQueries({ queryKey: hospitalityKeys.stats() })
      } else {
        toast.error('Check-out Failed', { description: response.error, position: 'bottom-center' })
      }
    },
  })
}
