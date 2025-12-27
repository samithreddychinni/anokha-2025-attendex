import { createFileRoute } from '@tanstack/react-router'
import { LoginComponent } from '../components/Login'

export const Route = createFileRoute('/login')({
    component: LoginComponent,
})
