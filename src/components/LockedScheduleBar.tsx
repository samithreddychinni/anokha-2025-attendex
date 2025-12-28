import { X } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

interface LockedScheduleBarProps {
    eventName: string
    scheduleDate: string
    startTime: string
    endTime: string
    onChangeSchedule: () => void
}

export function LockedScheduleBar({
    eventName,
    scheduleDate,
    startTime,
    endTime,
    onChangeSchedule,
}: LockedScheduleBarProps) {
    return (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-500/20">
                            Schedule Locked
                        </span>
                        <h2 className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-md">
                            {eventName}
                        </h2>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="font-medium text-foreground">{formatDate(scheduleDate)}</span>
                        <span>•</span>
                        <span>
                            {formatTime(startTime)} - {formatTime(endTime)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onChangeSchedule}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive text-xs font-bold rounded-lg hover:bg-destructive/20 active:scale-95 transition-all"
                >
                    <X size={14} />
                    <span className="hidden sm:inline">Change</span>
                </button>
            </div>
        </div>
    )
}
