import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

type LoginMode = 'organiser' | 'hospitality'
type HospitalityRole = 'HOSP_1' | 'FINANCE' | 'HOSP_2' | 'SECURITY'

// Store hospitality session in session storage
export const setHospitalitySession = (role: HospitalityRole, email: string) => {
  sessionStorage.setItem('hospitalityRole', role)
  sessionStorage.setItem('hospitalityEmail', email)
}

export const getHospitalityRole = (): HospitalityRole | null => {
  return sessionStorage.getItem('hospitalityRole') as HospitalityRole | null
}

export const getHospitalityEmail = (): string | null => {
  return sessionStorage.getItem('hospitalityEmail')
}

export const clearHospitalitySession = () => {
  sessionStorage.removeItem('hospitalityRole')
  sessionStorage.removeItem('hospitalityEmail')
}

export const isHospitalityLoggedIn = (): boolean => {
  return !!getHospitalityRole()
}

// Mock hospitality login - in production this would call real API
const mockHospitalityLogin = async (email: string, password: string): Promise<{ success: boolean; role?: HospitalityRole; error?: string }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock credentials - in production, backend validates and returns role
  const mockUsers: Record<string, { password: string; role: HospitalityRole }> = {
    'hosp1@anokha.com': { password: 'hosp1', role: 'HOSP_1' },
    'finance@anokha.com': { password: 'finance', role: 'FINANCE' },
    'hosp2@anokha.com': { password: 'hosp2', role: 'HOSP_2' },
    'security@anokha.com': { password: 'security', role: 'SECURITY' },
  }

  const user = mockUsers[email.toLowerCase()]
  if (user && user.password === password) {
    return { success: true, role: user.role }
  }

  return { success: false, error: 'Invalid credentials' }
}

export function LoginComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginMode, setLoginMode] = useState<LoginMode>('organiser')
  const { login, isLoading, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !isLoading) {
      navigate({ to: '/events', replace: true } as any)
    }
  }, [user, isLoading, navigate])

  // Check if already logged in as hospitality
  useEffect(() => {
    const role = getHospitalityRole()
    if (role && loginMode === 'hospitality') {
      navigateToRolePage(role)
    }
  }, [loginMode])

  const navigateToRolePage = (role: HospitalityRole) => {
    switch (role) {
      case 'HOSP_1':
        navigate({ to: '/hospitality/hosp1' } as any)
        break
      case 'FINANCE':
        navigate({ to: '/hospitality/finance' } as any)
        break
      case 'HOSP_2':
        navigate({ to: '/hospitality/hosp2' } as any)
        break
      case 'SECURITY':
        // Security goes directly to scanner
        navigate({ to: '/hospitality/security' } as any)
        break
    }
  }

  const handleOrganiserSubmit = async (e: React.FormEvent) => {
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

  const handleHospitalitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await mockHospitalityLogin(email, password)

      if (result.success && result.role) {
        setHospitalitySession(result.role, email)
        toast.success('Logged in successfully')
        navigateToRolePage(result.role)
      } else {
        toast.error(result.error || 'Invalid credentials')
      }
    } catch (error) {
      toast.error('Login failed')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 pointer-events-none flex items-center justify-center opacity-5 dark:opacity-10 bg-no-repeat bg-center transition-opacity duration-300"
        style={{
          backgroundImage: "url('/mascot-flag.webp')",
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      />

      {/* Floating Toggle */}
      <div className="w-full max-w-sm md:max-w-md mb-4 relative z-10">
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-full p-1 flex">
          <button
            type="button"
            onClick={() => setLoginMode('organiser')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              loginMode === 'organiser'
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Organiser
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('hospitality')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              loginMode === 'hospitality'
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Hospitality
          </button>
        </div>
      </div>

      <div className="w-full max-w-sm md:max-w-md bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6 md:p-8 shadow-2xl relative z-10 max-h-full overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <img src="/logo.png" alt="Anokha Logo" className="h-8 md:h-10 w-auto" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-card-foreground">
            {loginMode === 'organiser' ? 'Organizer Login' : 'Hospitality Login'}
          </h2>
          <p className="text-muted-foreground text-center mt-2 text-sm md:text-base">
            Enter your credentials to access the portal.
          </p>
        </div>

        <form onSubmit={loginMode === 'organiser' ? handleOrganiserSubmit : handleHospitalitySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm placeholder:text-muted-foreground/50"
              placeholder={loginMode === 'organiser' ? 'dept@amrita.edu' : 'hosp1@anokha.com'}
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
