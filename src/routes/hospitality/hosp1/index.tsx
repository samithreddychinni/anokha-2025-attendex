'use client'

import { Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { LogIn, LogOut } from 'lucide-react'

export const Route = createFileRoute('/hospitality/hosp1/')({
  component: Hosp1Landing,
})

function Hosp1Landing() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Greeting */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Welcome, HOSP Team!</h1>
          <p className="text-muted-foreground text-lg">
            Registration & Check-out Counter
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-8">
          <Link to="/hospitality/hosp1/checkin" className="block">
            <button className="w-full h-20 text-xl font-medium rounded-xl border-2 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-3">
              <LogIn className="h-7 w-7" />
              Check-in
            </button>
          </Link>

          <Link to="/hospitality/hosp1/checkout" className="block">
            <button className="w-full h-20 text-xl font-medium rounded-xl border-2 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-3">
              <LogOut className="h-7 w-7" />
              Check-out
            </button>
          </Link>
        </div>

        {/* Back link */}
        <div className="pt-8">
          <Link
            to="/hospitality"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Role Selection
          </Link>
        </div>
      </div>
    </div>
  )
}
