import { useState, useRef } from 'react'
// @ts-ignore
import QrReader from 'react-qr-scanner'
import { toast } from 'sonner'
import api from '@/lib/api'
import { ScanResult } from './ScanHistory'

interface ScannerProps {
    eventId: string
    sessionId: string
    onScanResult: (result: ScanResult) => void
    history: ScanResult[]
}

export function Scanner({ eventId, sessionId, onScanResult, history }: ScannerProps) {
    const [isProcessing, setIsProcessing] = useState(false)
    const lastScanRef = useRef<string | null>(null)
    const [cameraError, setCameraError] = useState(false)

    const handleScan = async (data: any) => {
        if (!data || !data.text) return

        const scannedText = data.text

        // Debounce immediate same-code scans
        if (lastScanRef.current === scannedText && isProcessing) return
        lastScanRef.current = scannedText

        // Check if already scanned in this session
        const isDuplicate = history.some(h => h.studentId === scannedText && h.status === 'PRESENT')
        if (isDuplicate) {
            if (!isProcessing) {
                toast.warning("Already Scanned!")
                // Optional: add a visual feedback for duplicate without API call
            }
            return
        }

        setIsProcessing(true)

        try {
            const studentId = scannedText.trim()
            const key = "default"

            await api.post(`/attendance/solo/mark/${key}/${studentId}/${sessionId}`)

            toast.success(`Marked: ${studentId}`)

            onScanResult({
                id: Math.random().toString(),
                studentName: 'Student ' + studentId,
                studentId: studentId,
                status: 'PRESENT',
                timestamp: new Date()
            })

        } catch (err: any) {
            console.error(err)
            toast.error('Scan Failed: ' + (err.response?.data?.message || 'Unknown error'))
            onScanResult({
                id: Math.random().toString(),
                studentName: 'Unknown',
                studentId: scannedText,
                status: 'ERROR',
                timestamp: new Date()
            })
        } finally {
            setTimeout(() => {
                setIsProcessing(false)
            }, 2000)
        }
    }

    const handleError = (err: any) => {
        console.error(err)
        if (err.name === 'NotAllowedError') {
            setCameraError(true)
            toast.error("Camera permission denied")
        }
    }

    if (cameraError) {
        return <div className="p-8 text-center text-red-400 bg-zinc-900 rounded-xl">Camera Access Denied</div>
    }

    return (
        <div className="relative rounded-xl overflow-hidden bg-black border border-zinc-800 aspect-square flex items-center justify-center">
            <QrReader
                delay={500}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                constraints={{
                    video: { facingMode: 'environment' }
                }}
            />

            <div className="absolute inset-0 border-2 border-white/20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-indigo-500 rounded-lg animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
            </div>

            {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold backdrop-blur-sm">
                    Processing...
                </div>
            )}
        </div>
    )
}
