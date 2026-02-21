import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
    sub: string; // Email
    role?: string;
    companyId?: string;
    slug?: string;
    companyName?: string;
    exp?: number;
    iat?: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    companyId: string | null;
    slug: string | null;
    companyName: string | null;
    login: (token: string, companyId: string, slug?: string, companyName?: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [companyId, setCompanyId] = useState<string | null>(localStorage.getItem('companyId'));
    const [slug, setSlug] = useState<string | null>(localStorage.getItem('slug'));
    const [companyName, setCompanyName] = useState<string | null>(localStorage.getItem('companyName'));

    useEffect(() => {
        if (token) {
            try {
                const decodedUser = jwtDecode<User>(token);
                if (decodedUser.exp && decodedUser.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    // Inject missing context into user if needed
                    setUser({ ...decodedUser, slug: slug || decodedUser.slug, companyName: companyName || decodedUser.companyName });
                }
            } catch (error) {
                console.error("Failed to decode token", error);
                logout();
            }
        }
    }, [token, slug, companyName]);

    const login = (newToken: string, newCompanyId: string, newSlug?: string, newCompanyName?: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('companyId', newCompanyId);
        if (newSlug) localStorage.setItem('slug', newSlug);
        if (newCompanyName) localStorage.setItem('companyName', newCompanyName);

        setToken(newToken);
        setCompanyId(newCompanyId);
        setSlug(newSlug || null);
        setCompanyName(newCompanyName || null);

        try {
            const decodedUser = jwtDecode<User>(newToken);
            setUser({ ...decodedUser, slug: newSlug, companyName: newCompanyName });
        } catch (error) {
            console.error("Failed to decode token", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('companyId');
        localStorage.removeItem('slug');
        localStorage.removeItem('companyName');
        setToken(null);
        setCompanyId(null);
        setSlug(null);
        setCompanyName(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, companyId, slug, companyName, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
