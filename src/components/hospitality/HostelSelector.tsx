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
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[30%]">
                Hostel Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[25%]">
                Sharing
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-[20%]">
                Price
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground w-[25%]">
                Beds Left
              </th>
            </tr>
          </thead>
          <tbody>
            {hostels.map((hostel) => {
              const isSelected = selectedHostelId === hostel.id
              const isDisabled = hostel.available_beds <= 0

              return (
                <tr
                  key={hostel.id}
                  onClick={() => !isDisabled && !isLoading && onSelect(hostel)}
                  className={cn(
                    'group transition-colors border-b last:border-0',
                    isDisabled ? 'opacity-50 cursor-not-allowed bg-muted/30' : 'cursor-pointer hover:bg-muted/30',
                    isSelected && 'bg-primary/5 hover:bg-primary/10'
                  )}
                >
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {/* Optional: Add radio/checkbox indicator for clarity */}
                      <div className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/30",
                        isDisabled && "opacity-0"
                      )}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                      </div>
                      {hostel.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {hostel.sharing}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ₹{hostel.price}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border',
                        getAvailabilityColor(hostel.available_beds)
                      )}
                    >
                      {hostel.available_beds > 0 ? (
                        <>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full mr-1.5",
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
