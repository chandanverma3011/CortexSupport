import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Ensure parsedUser is an object and has essential fields
                if (parsedUser && typeof parsedUser === 'object' && parsedUser.token) {
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem('user');
                }
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const register = async (userData) => {
        try {
            const data = await authService.register(userData);
            setUser(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const login = async (userData) => {
        try {
            const data = await authService.login(userData);
            setUser(data);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
