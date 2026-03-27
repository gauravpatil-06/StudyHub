import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            
            if (token) {
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                        // If we have local data, we can stop the initial loading screen early
                        setIsLoading(false);
                        // Still refresh the user data in the background
                        fetchMe();
                    } catch (e) {
                        localStorage.removeItem('user');
                        await fetchMe();
                        setIsLoading(false);
                    }
                } else {
                    // Token exists but no profile info, must wait for fetchMe
                    await fetchMe();
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const fetchMe = async () => {
        try {
            const { data } = await api.get('/auth/me');
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            return data;
        } catch (error) {
            console.error('Failed to fetch user state', error);
            if (error.response?.status === 401) {
                logout();
            }
            throw error;
        }
    };

    const addStudyHours = async (hours, method, type = 'Study') => {
        try {
            const response = await api.put('/auth/study-hours', { hours, method, type });
            const updatedUser = { ...user, ...response.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Failed to update study hours', error);
        }
    };

    const login = async (email, password, isAdminLogin = false) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, ...userData } = response.data;

            if (isAdminLogin && userData.role !== 'admin') {
                throw new Error('Not authorized as an admin');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Login failed');
        }
    };

    const register = async (name, college, email, password) => {
        try {
            const response = await api.post('/auth/register', { name, college, email, password });
            const { token, isNewUser, ...userData } = response.data;
            if (isNewUser) localStorage.setItem('studyhub_welcome_new_signup', 'true');

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const googleLogin = async (credential, userProfile) => {
        try {
            const response = await api.post('/auth/google', { credential, userProfile });
            const { token: jwtToken, isNewUser, ...userData } = response.data;
            if (isNewUser) localStorage.setItem('studyhub_welcome_new_signup', 'true');

            localStorage.setItem('token', jwtToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Google login failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData);
            const { token, ...userData } = response.data;
            if (token) localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const value = {
        user,
        isSessionValid: !!user,
        isLoading,
        login,
        register,
        logout,
        fetchMe,
        addStudyHours,
        updateProfile,
        googleLogin
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
