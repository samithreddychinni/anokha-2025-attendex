'use client'

import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
interface RoleCardProps {
  role?: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

export function RoleCard({ title, description, icon, href }: RoleCardProps) {
  return (
    <Link to={href as any}>
      <Card className="cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:shadow-md active:scale-[0.98]">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base">{title}</h3>
              <p className="text-sm text-muted-foreground truncate">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default RoleCard
