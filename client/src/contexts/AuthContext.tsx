import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '@/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Optionally fetch user data here
    }
  }, []);
  
  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};