import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { QrCode, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/components/AuthGuard'

// Components
import { Scanner } from './-components/Scanner'
import { ManualEntry } from './-components/ManualEntry'
import { ScanHistory, type ScanResult } from './-components/ScanHistory'

export const Route = createFileRoute('/events/$eventId/sessions/$sessionId/attendance')({
    component: AttendancePage,
})

function AttendancePage() {
    const { eventId, sessionId } = Route.useParams()
    const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan')
    const [history, setHistory] = useState<ScanResult[]>([])

    const handleScanResult = (result: ScanResult) => {
        setHistory(prev => [result, ...prev])
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background text-foreground pb-20">
                {/* Header Area */}
                <div className="p-4 border-b border-border bg-card sticky top-0 z-10">
                    <h2 className="font-bold text-lg">Mark Attendance</h2>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>Session ID: {sessionId.slice(0, 8)}...</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="p-4 grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                            activeTab === 'scan'
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                        )}
                    >
                        <QrCode size={24} className="mb-2" />
                        <span className="font-medium">Scan QR</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('manual')}
                        className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                            activeTab === 'manual'
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                        )}
                    >
                        <ClipboardList size={24} className="mb-2" />
                        <span className="font-medium">Manual Entry</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="px-4">
                    {activeTab === 'scan' ? (
                        <Scanner
                            sessionId={sessionId}
                            onScanResult={handleScanResult}
                            history={history}
                        />
                    ) : (
                        <ManualEntry
                            sessionId={sessionId}
                            onScanResult={handleScanResult}
                            />
                    )}
                </div>

                {/* History Area */}
                <div className="mt-8 px-4">
                    <h3 className="text-muted-foreground text-sm uppercase tracking-wider font-bold mb-4">Recent Scans</h3>
                    <ScanHistory history={history} />
                </div>
            </div>
        </AuthGuard>
    )
}
