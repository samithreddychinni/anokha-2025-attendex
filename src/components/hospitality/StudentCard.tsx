'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, Building, GraduationCap, Edit } from 'lucide-react'
import type { StudentProfile, StudentRecord } from '@/types/hospitality'
import { getStatusLabel, getStatusColor } from '@/types/hospitality'

interface StudentCardProps {
  student: StudentProfile | StudentRecord
  showStatus?: boolean
  showEditButton?: boolean
  onEdit?: () => void
  compact?: boolean
}

function isStudentRecord(student: StudentProfile | StudentRecord): student is StudentRecord {
  return 'hospitality_id' in student
}

export function StudentCard({
  student,
  showStatus = false,
  showEditButton = false,
  onEdit,
  compact = false,
}: StudentCardProps) {
  const isRecord = isStudentRecord(student)

  return (
    <Card className={compact ? 'shadow-sm' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {student.name}
          </CardTitle>
          {showEditButton && onEdit && (
            <Button variant="ghost" size="icon-sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isRecord && showStatus && (
          <div className="flex gap-2 flex-wrap">
            <Badge variant={getStatusColor(student.accommodation_status)}>
              {getStatusLabel(student.accommodation_status)}
            </Badge>
            <Badge variant="outline">{student.student_type.replace('_', ' ')}</Badge>
            {student.hostel_name && (
              <Badge variant="secondary">{student.hostel_name}</Badge>
            )}
          </div>
        )}
        {!isRecord && (
          <Badge variant="outline">{student.student_type.replace('_', ' ')}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{student.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{student.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{student.college}</span>
          </div>
          {isRecord && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span className="font-mono font-medium">{student.hospitality_id}</span>
            </div>
          )}
        </div>

        {isRecord && !compact && (
          <div className="pt-3 border-t mt-3 space-y-1 text-xs text-muted-foreground">
            {student.check_in_date && (
              <p>Check-in: {new Date(student.check_in_date).toLocaleDateString()}</p>
            )}
            {student.payment_timestamp && (
              <p>Payment: {new Date(student.payment_timestamp).toLocaleString()}</p>
            )}
            {student.hostel_check_in_date && (
              <p>Hostel Check-in: {new Date(student.hostel_check_in_date).toLocaleString()}</p>
            )}
            {student.check_out_date && (
              <p>Check-out: {new Date(student.check_out_date).toLocaleString()}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StudentCard
