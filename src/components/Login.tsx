import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export function LoginComponent() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, isLoading, user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    // Redirect if already logged in
    useEffect(() => {
        if (user && !isLoading) {
            navigate({ to: '/events', replace: true } as any)
        }
    }, [user, isLoading, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await login(email, password)
            toast.success('Logged in successfully')
            navigate({ to: '/events', replace: true } as any)
        } catch (error) {
            toast.error('Invalid credentials')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="h-[100dvh] w-full flex items-center justify-center p-4 relative overflow-hidden">
             {/* Mascot Background */}
            <div
                className="absolute inset-0 -z-10 pointer-events-none flex items-center justify-center opacity-5 dark:opacity-10 bg-no-repeat bg-center transition-opacity duration-300"
                style={{
                    backgroundImage: "url('/mascot-flag.webp')",
                    backgroundSize: "contain", // contain ensures it doesn't overflow
                    backgroundPosition: "center",
                }}
            />
            
            <div className="w-full max-w-sm md:max-w-md bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6 md:p-8 shadow-2xl relative z-10 max-h-full overflow-y-auto">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <img src="/logo.png" alt="Anokha Logo" className="h-8 md:h-10 w-auto" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-card-foreground">Organizer Login</h2>
                    <p className="text-muted-foreground text-center mt-2 text-sm md:text-base">Enter your credentials to access the portal.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm placeholder:text-muted-foreground/50"
                            placeholder="dept@amrita.edu"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm placeholder:text-muted-foreground/50"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                                Logging in...
                            </div>
                        ) : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    )
}
