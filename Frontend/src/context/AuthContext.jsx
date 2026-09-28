import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            // Try applicant auth first
            const res = await authService.getMe();
            if (res.success) {
                setUser(res.data.user);
                setLoading(false);
                return;
            }
        } catch {
            // Not an applicant session
        }

        try {
            // Try admin auth
            const res = await authService.getAdminMe();
            if (res.success) {
                setUser(res.data.user);
                setLoading(false);
                return;
            }
        } catch {
            // Not an admin session either
        }

        setUser(null);
        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            if (user?.role === 'admin') {
                await authService.adminLogout();
            } else {
                await authService.logout();
            }
        } catch {
            // Ignore logout errors
        }
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isApplicant: user?.role === 'applicant',
        isAdmin: user?.role === 'admin',
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
