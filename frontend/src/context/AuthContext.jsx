import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync token to apiClient and storage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const getRoleDashboardPath = (role) => {
    switch (role?.toLowerCase()) {
      case 'student':
        return '/student/dashboard';
      case 'faculty':
        return '/faculty/dashboard';
      case 'alumni':
        return '/alumni/dashboard';
      case 'recruiter':
        return '/recruiter/dashboard';
      case 'admin':
        return '/faculty/hod-analytics';
      default:
        return '/student/dashboard';
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data?.success && response.data?.token) {
        const receivedToken = response.data.token;
        const receivedUser = response.data.user;

        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(receivedUser));

        setToken(receivedToken);
        setUser(receivedUser);

        return {
          success: true,
          token: receivedToken,
          user: receivedUser,
          redirectPath: getRoleDashboardPath(receivedUser.role),
        };
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Invalid email or password';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ name, email, password, role = 'student' }) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        role,
      });

      if (response.data?.success && response.data?.token) {
        const receivedToken = response.data.token;
        const receivedUser = response.data.user;

        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(receivedUser));

        setToken(receivedToken);
        setUser(receivedUser);

        return {
          success: true,
          token: receivedToken,
          user: receivedUser,
          redirectPath: getRoleDashboardPath(receivedUser.role),
        };
      } else {
        throw new Error(response.data?.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
    getRoleDashboardPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
