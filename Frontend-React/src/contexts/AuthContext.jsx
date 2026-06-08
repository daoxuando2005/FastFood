import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Load auth data from local storage on mount
        const authData = localStorage.getItem('foodhub_auth');
        if (authData) {
            setUser(JSON.parse(authData));
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('foodhub_auth', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('foodhub_auth');
        setUser(null);
        alert("Đăng xuất thành công!");
        navigate('/');
    };

    const checkAuth = () => {
        if (!user || !user.token) {
            alert("Vui lòng đăng nhập để tiếp tục!");
            navigate('/login');
            return false;
        }
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
