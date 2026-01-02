'use client'

import { useState, useRef, useCallback } from 'react'
import type {
  ScannerState,
  AccommodationType,
  Hostel,
  ProfileQRData,
} from '@/types/hospitality'
import { isValidHospitalityID } from '@/types/hospitality'
import { hospitalityMockAPI } from '@/services/hospitality/mock-api'

const INITIAL_STATE: ScannerState = {
  step: 'PROFILE_QR',
  isProcessing: false,
}

export function useHospitalityScanner() {
  const [state, setState] = useState<ScannerState>(INITIAL_STATE)
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScannedRef = useRef<string | null>(null)
  const scanCooldownRef = useRef<NodeJS.Timeout | null>(null)
  const isShowingOverlayRef = useRef<boolean>(false)

  // Show visual feedback (success/error overlay)
  const showResultFeedback = useCallback((type: 'success' | 'error') => {
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? 200 : 500)
    }

    isShowingOverlayRef.current = true
    setState((prev) => ({ ...prev, scanResult: type }))

    if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current)
    resultTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, scanResult: undefined }))
      isShowingOverlayRef.current = false
    }, 2000)
  }, [])

  // Parse ProfileQR JSON and extract student_id
  const parseProfileQR = useCallback((rawText: string): ProfileQRData | null => {
    try {
      const parsed = JSON.parse(rawText)
      if (!parsed.student_id) {
        return null
      }
      return { student_id: parsed.student_id }
    } catch {
      return null
    }
  }, [])

  // Handle ProfileQR scan - fetch student profile
  // Returns: true = success, false = error (show toast), null = blocked (no toast)
  const handleProfileQRScan = useCallback(
    async (rawText: string): Promise<boolean | null> => {
      // Prevent duplicate scans and block during overlay - return null to skip toast
      if (rawText === lastScannedRef.current) return null
      if (state.isProcessing) return null
      if (isShowingOverlayRef.current) return null

      setState((prev) => ({ ...prev, isProcessing: true }))
      lastScannedRef.current = rawText

      // Set cooldown
      if (scanCooldownRef.current) clearTimeout(scanCooldownRef.current)
      scanCooldownRef.current = setTimeout(() => {
        lastScannedRef.current = null
      }, 3000)

      const profileQR = parseProfileQR(rawText)
      if (!profileQR) {
        showResultFeedback('error')
        setState((prev) => ({ ...prev, isProcessing: false }))
        return false
      }

      // Fetch student profile from mock API
      const response = await hospitalityMockAPI.getStudentProfileById(profileQR.student_id)

      if (!response.success || !response.data) {
        showResultFeedback('error')
        setState((prev) => ({ ...prev, isProcessing: false }))
        return false
      }

      showResultFeedback('success')

      // Delay step transition to show green screen for 1.5 seconds
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          step: 'HOSP_ID',
          scannedStudentId: profileQR.student_id,
          studentProfile: response.data,
          isProcessing: false,
        }))
      }, 1500)

      return true
    },
    [state.isProcessing, parseProfileQR, showResultFeedback]
  )

  // Handle HospitalityID scan - validate format
  // Returns: true = success, false = error (show toast), null = blocked (no toast)
  const handleHospIdScan = useCallback(
    async (rawText: string): Promise<boolean | null> => {
      // Prevent duplicate scans and block during overlay - return null to skip toast
      if (rawText === lastScannedRef.current) return null
      if (state.isProcessing) return null
      if (isShowingOverlayRef.current) return null

      setState((prev) => ({ ...prev, isProcessing: true }))
      lastScannedRef.current = rawText

      // Set cooldown
      if (scanCooldownRef.current) clearTimeout(scanCooldownRef.current)
      scanCooldownRef.current = setTimeout(() => {
        lastScannedRef.current = null
      }, 3000)

      const hospId = rawText.trim().toUpperCase()

      // Validate format
      if (!isValidHospitalityID(hospId)) {
        showResultFeedback('error')
        setState((prev) => ({ ...prev, isProcessing: false }))
        return false
      }

      // Check availability
      const response = await hospitalityMockAPI.checkHospIdAvailability(hospId)
      if (!response.success || !response.data?.available) {
        showResultFeedback('error')
        setState((prev) => ({ ...prev, isProcessing: false }))
        return false
      }

      showResultFeedback('success')

      // Delay step transition to show green screen for 1.5 seconds
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          step: 'ACCOMMODATION',
          scannedHospId: hospId,
          isProcessing: false,
        }))
      }, 1500)

      return true
    },
    [state.isProcessing, showResultFeedback]
  )

  // Set accommodation type
  const setAccommodationType = useCallback((type: AccommodationType) => {
    setState((prev) => ({ ...prev, accommodationType: type }))
  }, [])

  // Set selected hostel
  const setSelectedHostel = useCallback((hostel: Hostel | undefined) => {
    setState((prev) => ({ ...prev, selectedHostel: hostel }))
  }, [])

  // Move to confirm step
  const proceedToConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'CONFIRM' }))
  }, [])

  // Complete the flow
  const complete = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'COMPLETE' }))
  }, [])

  // Reset scanner to initial state
  const reset = useCallback(() => {
    lastScannedRef.current = null
    isShowingOverlayRef.current = false
    if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current)
    if (scanCooldownRef.current) clearTimeout(scanCooldownRef.current)
    setState(INITIAL_STATE)
  }, [])

  // Go back one step
  const goBack = useCallback(() => {
    setState((prev) => {
      switch (prev.step) {
        case 'HOSP_ID':
          return { ...INITIAL_STATE }
        case 'ACCOMMODATION':
          return { ...prev, step: 'HOSP_ID', scannedHospId: undefined }
        case 'CONFIRM':
          return { ...prev, step: 'ACCOMMODATION' }
        default:
          return prev
      }
    })
  }, [])

  return {
    state,
    handleProfileQRScan,
    handleHospIdScan,
    setAccommodationType,
    setSelectedHostel,
    proceedToConfirm,
    complete,
    reset,
    goBack,
    showResultFeedback,
  }
}

export default useHospitalityScanner
