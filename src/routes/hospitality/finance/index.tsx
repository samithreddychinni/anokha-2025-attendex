'use client'

import { Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { Wallet, X } from 'lucide-react'
import { clearHospitalitySession } from '@/components/Login'

export const Route = createFileRoute('/hospitality/finance/')({
  component: FinanceLanding,
})

function FinanceLanding() {
  const handleLogout = () => {
    clearHospitalitySession()
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 relative">
      {/* X button at top right - logout */}
      <div className="absolute top-4 right-4">
        <Link
          to="/login"
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-6 w-6" />
        </Link>
      </div>

      <div className="max-w-md w-full space-y-8 text-center">
        {/* Greeting */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Welcome, Finance Team!</h1>
          <p className="text-muted-foreground text-lg">
            Payment Verification Counter
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <Link to="/hospitality/finance/scanner" className="block">
            <button className="w-full h-20 text-xl font-medium rounded-xl border-2 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-3">
              <Wallet className="h-7 w-7" />
              Verify Payment
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
