import { createFileRoute } from '@tanstack/react-router'
import { LoginComponent } from '../components/Login'

export const Route = createFileRoute('/')({
  component: LoginComponent,
})
