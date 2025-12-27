import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export function LoginComponent() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, isLoading } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await login(email, password)
            toast.success('Logged in successfully')
        } catch (error) {
            toast.error('Invalid credentials')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-2">Organizer Login</h2>
                <p className="text-zinc-400 mb-6">Enter your credentials to access the portal.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="dept@amrita.edu"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full bg-white text-black font-semibold py-2 px-4 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-900 rounded-full animate-spin" />
                                Logging in...
                            </div>
                        ) : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    )
}
