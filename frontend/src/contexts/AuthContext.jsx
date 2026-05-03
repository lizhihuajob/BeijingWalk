import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  refreshToken as apiRefreshToken,
  getCurrentUser as apiGetCurrentUser,
} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const TOKEN_KEY = 'beijingwalk_token';
const REFRESH_TOKEN_KEY = 'beijingwalk_refresh_token';
const USER_KEY = 'beijingwalk_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          const userData = await apiGetCurrentUser(savedToken);
          if (userData) {
            setUser(userData);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await apiLogin(identifier, password);
      
      const { access_token, refresh_token, user } = response;
      
      setToken(access_token);
      setUser(user);
      
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || '登录失败，请稍后重试' 
      };
    }
  };

  const register = async (username, email, password, nickname) => {
    try {
      const response = await apiRegister(username, email, password, nickname);
      
      const { access_token, refresh_token, user } = response;
      
      setToken(access_token);
      setUser(user);
      
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || '注册失败，请稍后重试' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem(USER_KEY, JSON.stringify(newUserData));
  };

  const refreshAuthToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const response = await apiRefreshToken(refreshToken);
      const { access_token, user } = response;
      
      setToken(access_token);
      setUser(user);
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  };

  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
