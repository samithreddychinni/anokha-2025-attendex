import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/events/$eventId/schedules/ScheduleCard')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/events/$eventId/schedules/ScheduleCard"!</div>
}
