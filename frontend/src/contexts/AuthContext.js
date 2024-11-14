// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("AuthContext useEffect");
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
      api.get('/auth/me').then((res) => setUser(res.data));
    }
  }, []);

  const register = async (userInfo) => {
    try {
      // Register the user
      const response = await api.post('/auth/register', userInfo);
      
      // Store the token and user data after registration
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
