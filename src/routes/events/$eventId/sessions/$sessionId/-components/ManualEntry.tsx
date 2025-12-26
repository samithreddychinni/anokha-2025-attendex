import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { ScanResult } from './ScanHistory'

interface ManualEntryProps {
    eventId: string
    sessionId: string
    onScanResult: (result: ScanResult) => void
}

export function ManualEntry({ eventId, sessionId, onScanResult }: ManualEntryProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [isMarking, setIsMarking] = useState(false)

    const handleMark = async () => {
        if (!searchTerm) return

        setIsMarking(true)
        try {
            const studentId = searchTerm.trim()
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
            setSearchTerm('')
        } catch (err: any) {
            toast.error('Failed: ' + (err.response?.data?.message || 'Error'))
        } finally {
            setIsMarking(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <label className="block text-sm text-zinc-400 mb-2">Student ID / Roll Number</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                            placeholder="CB.EN.U4..."
                        />
                    </div>
                    <button
                        onClick={handleMark}
                        disabled={!searchTerm || isMarking}
                        className="bg-indigo-600 text-white px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isMarking ? <Loader2 className="animate-spin" /> : 'Mark'}
                    </button>
                </div>
            </div>
        </div>
    )
}
