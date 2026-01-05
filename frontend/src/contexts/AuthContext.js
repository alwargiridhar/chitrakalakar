import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('chitrakalakar_user');
    const storedToken = localStorage.getItem('chitrakalakar_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to restore user:', error);
        localStorage.removeItem('chitrakalakar_user');
        localStorage.removeItem('chitrakalakar_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authAPI.login(email, password);
      setUser(data.user);
      localStorage.setItem('chitrakalakar_user', JSON.stringify(data.user));
      localStorage.setItem('chitrakalakar_token', data.token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (signupData) => {
    setIsLoading(true);
    try {
      const data = await authAPI.signup(signupData);
      setUser(data.user);
      localStorage.setItem('chitrakalakar_user', JSON.stringify(data.user));
      localStorage.setItem('chitrakalakar_token', data.token);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chitrakalakar_user');
    localStorage.removeItem('chitrakalakar_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isArtist: user?.role === 'artist',
        isLeadChitrakar: user?.role === 'lead_chitrakar',
        isKalakar: user?.role === 'kalakar',
      }}
    >
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
