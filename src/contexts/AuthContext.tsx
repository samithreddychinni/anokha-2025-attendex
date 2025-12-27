import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { hashPassword } from '@/lib/utils';
import { useRouter } from '@tanstack/react-router';
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
        console.log('Hashed Password:', hashedPassword);
        const response = await api.post('/auth/organizer/login', { email, password: hashedPassword });
        console.log('Login Response Status:', response.status);
        console.log('Login Response Data:', response.data);
        
        const { data } = response;

        // Assuming login response returns user or we need to fetch session after
        // If response is just { message: "Success" }, fetch session immediately
        if (data.email) {
            setUser(data);
        } else {
            console.log('Data.email missing, fetching session...');
            // Fetch session to be sure
            const session = await api.get('/auth/organizer/session');
            console.log('Session fetch success:', session.data);
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
