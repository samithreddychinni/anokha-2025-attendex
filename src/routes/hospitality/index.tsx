'use client'

import { createFileRoute } from '@tanstack/react-router'
import { RoleCard } from '@/components/hospitality/RoleCard'
import { ClipboardList, Wallet, Building, Shield } from 'lucide-react'

export const Route = createFileRoute('/hospitality/')({
  component: HospitalityLanding,
})

function HospitalityLanding() {
  return (
    <div className="min-h-[calc(100vh-80px)] p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold">Event Check-in System</h1>
          <p className="text-muted-foreground mt-2">Select your role to continue</p>
        </div>

        <div className="space-y-3">
          <RoleCard
            role="HOSP_1"
            title="HOSP 1"
            description="Registration & Check-out"
            icon={<ClipboardList className="h-6 w-6" />}
            href="/hospitality/hosp1"
          />

          <RoleCard
            role="FINANCE"
            title="Finance"
            description="Payment Verification"
            icon={<Wallet className="h-6 w-6" />}
            href="/hospitality/finance"
          />

          <RoleCard
            role="HOSP_2"
            title="HOSP 2"
            description="Hostel Check-in"
            icon={<Building className="h-6 w-6" />}
            href="/hospitality/hosp2"
          />

          <RoleCard
            role="SECURITY"
            title="Security"
            description="Verification & Lookup"
            icon={<Shield className="h-6 w-6" />}
            href="/hospitality/security"
          />
        </div>
      </div>
    </div>
  )
}
