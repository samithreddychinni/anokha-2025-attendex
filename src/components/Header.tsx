import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ModeToggle } from './mode-toggle'

export default function Header() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="px-4 py-3 flex items-center justify-between bg-background/80 backdrop-blur-md text-foreground border-b border-border shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <h1 className="text-lg font-bold tracking-tight flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Anokha Logo" className="h-8 w-auto" />
          <span>Anokha Organizer</span>
        </Link>
      </h1>

      <div className="flex items-center gap-2">
        <ModeToggle />
        {isAuthenticated && (
          <button
            onClick={() => logout()}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </header>
  )
}
