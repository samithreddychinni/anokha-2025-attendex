'use client'

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  X,
  XCircle,
  Shield,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStudentRecord } from '@/hooks/hospitality/useStudentMutation'
import { getStatusLabel, getStatusColor, type HospitalityID } from '@/types/hospitality'

export const Route = createFileRoute('/hospitality/security/$hospId')({
  component: SecurityStudentDetails,
})

function SecurityStudentDetails() {
  const { hospId } = Route.useParams() as { hospId: HospitalityID }

  const { data: studentResponse, isLoading: isLoadingStudent } = useStudentRecord(hospId)

  const student = studentResponse?.success ? studentResponse.data : null

  const formatDateTime = (isoString: string | undefined) => {
    if (!isoString) return 'N/A'
    return new Date(isoString).toLocaleString()
  }

  // Loading state
  if (isLoadingStudent) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading student details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (studentResponse && !studentResponse.success) {
    return (
      <div className="min-h-[calc(100vh-80px)] p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header with X button on right */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Security</h1>
              <p className="text-sm text-muted-foreground">Student not found</p>
            </div>
            <Link
              to="/hospitality/security"
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-6 w-6" />
            </Link>
          </div>

          <div className="text-center p-8 bg-destructive/10 rounded-lg">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="font-medium text-destructive">Student Not Found</p>
            <p className="text-sm text-muted-foreground mt-2">{studentResponse.error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Student details view
  if (student) {
    return (
      <div className="min-h-[calc(100vh-80px)] p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Header with X button on right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <h1 className="text-xl font-bold">Security Verification</h1>
            </div>
            <Link
              to="/hospitality/security"
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-6 w-6" />
            </Link>
          </div>

          {/* Hospitality ID Badge */}
          <div className="text-center py-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Hospitality ID</p>
            <p className="text-3xl font-mono font-bold text-primary">
              {student.hospitality_id}
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant={getStatusColor(student.accommodation_status)} className="text-sm">
              {getStatusLabel(student.accommodation_status)}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {student.student_type.replace('_', ' ')}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {student.accommodation_type === 'HOSTEL' ? 'Hostel' : 'Day Scholar'}
            </Badge>
          </div>

          {/* Profile Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{student.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{student.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{student.college}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{student.student_id}</span>
              </div>
            </CardContent>
          </Card>

          {/* Accommodation Info */}
          {student.accommodation_type === 'HOSTEL' && student.hostel_name && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Accommodation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{student.hostel_name}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Check-in: {formatDateTime(student.check_in_date)}</span>
              </div>
              {student.payment_timestamp && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Payment: {formatDateTime(student.payment_timestamp)}</span>
                </div>
              )}
              {student.hostel_check_in_date && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Hostel Check-in: {formatDateTime(student.hostel_check_in_date)}</span>
                </div>
              )}
              {student.check_out_date && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Check-out: {formatDateTime(student.check_out_date)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Check-ins */}
          {student.daily_check_ins && student.daily_check_ins.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Daily Check-ins ({student.daily_check_ins.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm max-h-32 overflow-y-auto">
                {student.daily_check_ins.map((entry, idx) => (
                  <div key={idx} className="flex justify-between text-xs border-b pb-1">
                    <span>{entry.date}</span>
                    <span>
                      In: {new Date(entry.check_in_time).toLocaleTimeString()}
                      {entry.check_out_time &&
                        ` | Out: ${new Date(entry.check_out_time).toLocaleTimeString()}`}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return null
}
