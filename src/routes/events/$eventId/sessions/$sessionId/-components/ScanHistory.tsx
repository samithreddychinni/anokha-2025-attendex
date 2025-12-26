import { CheckCircle, XCircle } from 'lucide-react'
import { formatTime } from '@/lib/utils'

export interface ScanResult {
    id: string
    studentName: string
    studentId: string
    status: 'PRESENT' | 'ALREADY_SCANNED' | 'INVALID' | 'ERROR'
    timestamp: Date
}

interface ScanHistoryProps {
    history: ScanResult[]
}

export function ScanHistory({ history }: ScanHistoryProps) {
    if (history.length === 0) {
        return <div className="text-zinc-600 italic text-sm">No recent scans</div>
    }

    return (
        <div className="space-y-3">
            {history.slice(0, 10).map((scan) => (
                <div key={scan.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                        {scan.status === 'PRESENT' ? (
                            <CheckCircle className="text-green-500" size={20} />
                        ) : (
                            <XCircle className="text-red-500" size={20} />
                        )}
                        <div>
                            <div className="font-semibold text-white">{scan.studentName || scan.studentId}</div>
                            <div className="text-xs text-zinc-500">{scan.studentId}</div>
                        </div>
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                        {formatTime(scan.timestamp)}
                    </div>
                </div>
            ))}
        </div>
    )
}
