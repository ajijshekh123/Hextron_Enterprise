import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(api.getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Intercept 401s
    api.setOnUnauthorized(() => {
      setUser(null);
      setToken(null);
    });

    const initAuth = async () => {
      const storedToken = api.getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res?.data?.user) {
          setUser(res.data.user);
        } else {
          api.setToken(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Session verification notice:', err.message);
        api.setToken(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      api.setToken(receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true, user: receivedUser };
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout', {});
      }
    } catch (err) {
      // Proceed with local logout regardless of network error
    } finally {
      api.setToken(null);
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
