import { Calendar, Clock, ChevronRight, CheckCircle2 } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

interface ScheduleCardProps {
    schedule: {
        id: string
        event_date: string
        start_time: string
        end_time: string
        status: 'ongoing' | 'upcoming' | 'completed'
    }
    isSelected: boolean
    onSelect: () => void
}

export function ScheduleCard({ schedule, isSelected, onSelect }: ScheduleCardProps) {
    const styles = {
        ongoing: "bg-green-500/10 text-green-600 border-green-500/20",
        upcoming: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        completed: "bg-slate-500/10 text-slate-600 border-slate-500/20"
    };

    return (
        <button
            onClick={onSelect}
            className={`w-full group relative block border rounded-2xl p-5 transition-all text-left outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSelected
                    ? 'bg-primary/5 border-primary shadow-sm'
                    : 'bg-card backdrop-blur-md border-border hover:bg-muted/50 hover:border-ring active:scale-[0.98]'
                }`}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div
                            className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                                }`}
                        >
                            <Calendar size={18} />
                        </div>
                        <span className="font-semibold text-card-foreground text-lg">
                            {formatDate(schedule.event_date)}
                        </span>
                        
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${styles[schedule.status]}`}>
                            {schedule.status}
                        </span>
                    </div>

                    <div className="space-y-1.5 pl-1">
                        <div className="flex items-center gap-2.5 text-muted-foreground text-sm">
                            <Clock size={15} />
                            <span>
                                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </span>
                        </div>
                    </div>
                </div>

                {isSelected && (
                    <div className="scale-100 transition-transform bg-primary text-primary-foreground rounded-full p-1">
                        <CheckCircle2 size={20} />
                    </div>
                )}
            </div>

            <div className={`mt-5 pt-4 border-t flex justify-between items-center ${isSelected ? 'border-primary/20' : 'border-border'}`}>
                <span
                    className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        }`}
                >
                    {isSelected ? 'Selected' : 'Tap to Select'}
                </span>
                {!isSelected && (
                    <ChevronRight
                        size={16}
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                    />
                )}
            </div>
        </button>
    )
}
