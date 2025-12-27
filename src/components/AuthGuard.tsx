import { Navigate } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';
import logo from '../logo.svg';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <img
                    src={logo}
                    className="h-[20vmin] pointer-events-none animate-[spin_2s_linear_infinite]"
                    alt="loading"
                />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}
