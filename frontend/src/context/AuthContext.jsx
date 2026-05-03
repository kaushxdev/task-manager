import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Check token on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Get current user
  const fetchUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Signup
  const signup = async (name, email, password) => {
    const res = await api.post('/api/auth/register', {
      name,
      email,
      password,
    });

    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // ✅ Login
  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', {
      email,
      password,
    });

    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  return useContext(AuthContext);
};