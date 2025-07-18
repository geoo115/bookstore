import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, LoginCredentials } from '../types';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiService.login(credentials);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const isAuthenticated = !!token;

  const value: AuthContextType = {
    token,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 