"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimePickerProps {
    value: string
    onChange: (value: string) => void
    className?: string
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    // Parse current value (HH:MM)
    const [hours, minutes] = value.split(':').map(v => parseInt(v)) || [12, 0]

    // Generate options
    const hoursOptions = Array.from({ length: 24 }, (_, i) => i)
    const minutesOptions = Array.from({ length: 12 }, (_, i) => i * 5)

    const handleHourClick = (h: number) => {
        onChange(`${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
    }

    const handleMinuteClick = (m: number) => {
        onChange(`${hours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
        setIsOpen(false)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-[120px] justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {value || "Pick time"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0" align="start">
                <div className="flex h-64">
                    <div className="flex-1 border-r overflow-y-auto p-1 custom-scrollbar">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-center text-muted-foreground py-1">Hour</span>
                            {hoursOptions.map((h) => (
                                <Button
                                    key={h}
                                    variant={hours === h ? "default" : "ghost"}
                                    size="sm"
                                    className="w-full justify-center text-xs"
                                    onClick={() => handleHourClick(h)}
                                >
                                    {h.toString().padStart(2, '0')}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-center text-muted-foreground py-1">Min</span>
                            {minutesOptions.map((m) => (
                                <Button
                                    key={m}
                                    variant={minutes === m ? "default" : "ghost"}
                                    size="sm"
                                    className="w-full justify-center text-xs"
                                    onClick={() => handleMinuteClick(m)}
                                >
                                    {m.toString().padStart(2, '0')}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
