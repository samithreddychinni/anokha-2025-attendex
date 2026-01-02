'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Building } from 'lucide-react'
import type { Hostel } from '@/types/hospitality'
import { cn } from '@/lib/utils'

interface HostelSelectorProps {
  hostels: Hostel[]
  selectedHostelId?: string
  onSelect: (hostel: Hostel) => void
  isLoading?: boolean
}

function getAvailabilityColor(available: number): string {
  if (available > 20) return 'bg-green-500'
  if (available >= 5) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getAvailabilityTextColor(available: number): string {
  if (available > 20) return 'text-green-500'
  if (available >= 5) return 'text-yellow-500'
  return 'text-red-500'
}

export function HostelSelector({
  hostels,
  selectedHostelId,
  onSelect,
  isLoading = false,
}: HostelSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {hostels.map((hostel) => {
        const isSelected = selectedHostelId === hostel.id
        const isDisabled = hostel.available_beds <= 0

        return (
          <Card
            key={hostel.id}
            className={cn(
              'cursor-pointer transition-all duration-200',
              isSelected && 'ring-2 ring-primary bg-primary/5',
              isDisabled && 'opacity-50 cursor-not-allowed',
              !isSelected && !isDisabled && 'hover:bg-accent/50'
            )}
            onClick={() => !isDisabled && !isLoading && onSelect(hostel)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full',
                      getAvailabilityColor(hostel.available_beds)
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span className="font-medium">{hostel.name}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    'text-lg font-bold px-3 py-1 rounded-lg',
                    getAvailabilityTextColor(hostel.available_beds),
                    hostel.available_beds <= 0 ? 'bg-red-500/10' : 'bg-muted'
                  )}
                >
                  {hostel.available_beds > 0 ? `${hostel.available_beds} left` : 'FULL'}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default HostelSelector
