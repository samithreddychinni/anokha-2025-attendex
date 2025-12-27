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
        return <div className="text-muted-foreground italic text-sm">No recent scans</div>
    }

    return (
        <div className="space-y-3">
            {history.slice(0, 10).map((scan) => (
                <div key={scan.id} className="flex items-center justify-between bg-card border border-border p-3 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                        {scan.status === 'PRESENT' ? (
                            <CheckCircle className="text-green-500" size={20} />
                        ) : (
                            <XCircle className="text-destructive" size={20} />
                        )}
                        <div>
                            <div className="font-semibold text-card-foreground">{scan.studentName || scan.studentId}</div>
                            <div className="text-xs text-muted-foreground">{scan.studentId}</div>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                        {formatTime(scan.timestamp)}
                    </div>
                </div>
            ))}
        </div>
    )
}
