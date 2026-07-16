import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, loginAdmin, logoutAdmin } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'admin_user';

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage to avoid login flash on page refresh
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const userData = await loginAdmin(email, password);
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    await logoutAdmin();
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
