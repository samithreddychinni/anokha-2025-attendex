import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
    component: Dashboard,
})

function Dashboard() {
    // Redirect /dashboard -> /events as per new navigation flow
    return <Navigate to="/events" />
}
