'use client'

import { cn } from '@/lib/utils'
import type { Hostel } from '@/types/hospitality'

interface HostelSelectorProps {
  hostels: Hostel[]
  selectedHostelId?: string
  onSelect: (hostel: Hostel) => void
  isLoading?: boolean
}

function getAvailabilityColor(available: number) {
  if (available > 40) {
    return 'text-green-700 bg-green-50 border-green-200'
  }
  if (available > 20) {
    return 'text-yellow-700 bg-yellow-50 border-yellow-200'
  }
  return 'text-red-700 bg-red-50 border-red-200'
}

export function HostelSelector({
  hostels,
  selectedHostelId,
  onSelect,
  isLoading = false,
}: HostelSelectorProps) {
  return (
    <div className="border rounded-xl overflow-hidden bg-background">
      <div className="">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-2 sm:px-4 py-3 text-left font-medium text-muted-foreground">
                Hostel
              </th>
              <th className="px-2 sm:px-4 py-3 text-left font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-2 sm:px-4 py-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                Beds Left
              </th>
            </tr>
          </thead>
          <tbody>
            {hostels.map((hostel) => {
              const isSelected = selectedHostelId === hostel.id
              const isDisabled = hostel.available_beds <= 0

              const parts = hostel.name.split('-')
              const name = parts[0].trim()
              const sharing = parts.length > 1 ? parts.slice(1).join('-').trim() : undefined

              return (
                <tr
                  key={hostel.id}
                  onClick={() => !isDisabled && !isLoading && onSelect(hostel)}
                  className={cn(
                    'group transition-all duration-200 border-b last:border-0 relative',
                    isDisabled ? 'opacity-50 cursor-not-allowed bg-muted/30' : 'cursor-pointer hover:bg-muted/50',
                    isSelected && 'bg-primary/20 ring-2 ring-inset ring-primary z-10'
                  )}
                >
                  <td className="px-2 sm:px-4 py-3 font-medium">
                    {name}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-muted-foreground">
                    {sharing || 'Standard'}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-medium border whitespace-nowrap',
                        getAvailabilityColor(hostel.available_beds)
                      )}
                    >
                      {hostel.available_beds > 0 ? (
                        <>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full mr-1",
                            hostel.available_beds > 40 ? "bg-green-500" :
                              hostel.available_beds > 20 ? "bg-yellow-500" : "bg-red-500"
                          )} />
                          {hostel.available_beds}
                        </>
                      ) : (
                        'FULL'
                      )}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {hostels.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No hostels available
        </div>
      )}
    </div>
  )
}

export default HostelSelector
