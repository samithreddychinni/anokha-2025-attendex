import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="px-4 py-3 flex items-center justify-between bg-black text-white border-b border-zinc-800">
      <h1 className="text-lg font-bold tracking-tight">
        <Link to="/">Anokha Organizer</Link>
      </h1>

      {isAuthenticated && (
        <button
          onClick={() => logout()}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      )}
    </header>
  )
}
