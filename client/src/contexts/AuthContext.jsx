import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useApi from '../hooks/useApi';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { loading: loadingRegister, error: errorRegister, execute: executeRegister } = useApi(authService, 'register');
  const { loading: loadingLogin, error: errorLogin, execute: executeLogin } = useApi(authService, 'login');

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = authService.getCurrentUser();
    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const result = await executeRegister(userData);
      setUser(result.data.user);
      setIsAuthenticated(true);
      return result;
    } catch (error) {
      throw error;
    }
  }, [executeRegister]);

  const login = useCallback(async (credentials) => {
    try {
      const result = await executeLogin(credentials);
      setUser(result.data.user);
      setIsAuthenticated(true);
      return result;
    } catch (error) {
      throw error;
    }
  }, [executeLogin]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    loadingRegister,
    loadingLogin,
    errorRegister,
    errorLogin,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};