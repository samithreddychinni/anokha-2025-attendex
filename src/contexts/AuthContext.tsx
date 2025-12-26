import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from '@tanstack/react-router';
import { hashPassword } from '@/lib/utils';

// Basic Type for Organizer based on expected response
interface Organizer {
    id: string;
    name: string;
    email: string;
    org_type: string;
}

interface AuthContextType {
    user: Organizer | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Organizer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Adjust endpoint if needed. Docs say GET /auth/organizer/session
                const { data } = await api.get('/auth/organizer/session');
                if (data && data.email) { // Validation depending on exact response shape
                    setUser(data);
                }
            } catch (error) {
                // Not logged in or session expired
                console.log("No active session");
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (email: string, password: string) => {
        // Docs say POST /auth/organizer/login
        const hashedPassword = await hashPassword(password);
        const { data } = await api.post('/auth/organizer/login', { email, password: hashedPassword });

        // Assuming login response returns user or we need to fetch session after
        // If response is just { message: "Success" }, fetch session immediately
        if (data.email) {
            setUser(data);
        } else {
            // Fetch session to be sure
            const session = await api.get('/auth/organizer/session');
            setUser(session.data);
        }
        router.navigate({ to: '/dashboard' });
    };

    const logout = async () => {
        try {
            await api.get('/auth/organizer/logout');
        } catch (e) {
            console.error("Logout failed", e);
        }
        setUser(null);
        router.navigate({ to: '/login' });
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
