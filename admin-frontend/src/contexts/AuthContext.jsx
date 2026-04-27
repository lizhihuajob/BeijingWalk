import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    setLoading(false);
  }, []);

  const verifyToken = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
      localStorage.setItem('admin_user', JSON.stringify(response.data));
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logout();
      } else {
        const savedUser = localStorage.getItem('admin_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            logout();
          }
        } else {
          logout();
        }
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    
    if (!token) {
      setLoading(false);
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }

    verifyToken();
  }, [verifyToken]);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const { access_token, admin } = response.data;
    
    localStorage.setItem('admin_token', access_token);
    localStorage.setItem('admin_user', JSON.stringify(admin));
    setUser(admin);
    setLoading(false);
    
    return response.data;
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
