import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import apiClient, {endpoints} from "../utils/apiClient";

axios.defaults.withCredentials = true;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchCurrentUser = async (token) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`);
      setCurrentUser(response.data.user);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to authenticate');
    }
  };

  const clearError = () => {
    setError(null);
  };
  const normalizeEmail = (email) => {
    if (email && email.includes('@gmail.com')) {
      const [localPart, domain] = email.split('@');
      return `${localPart.replace(/\./g, '')}@${domain}`.toLowerCase();
    }
    return email ? email.toLowerCase() : '';
  };
  
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Login attempt with:', { 
        original: email, 
        normalized: normalizeEmail(email) 
      });
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;

      localStorage.setItem('token', token);

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      setLoading(false);
      return user;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };
  const loginWithBiometric = async (email, password) => {
    setLoading(true);
    setError(null);
    password = "empty";
    try {
       const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/loginWithBiometric`, {
        email, password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Biometric authentication failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };
  
  const preRegister = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
    
      console.log('Pre-register attempt with:', { 
        original: email, 
        normalized: normalizeEmail(email) 
      });
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/pre-register`, {
        email,
        password
      });
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };
  
  const verifyEmail = async (email, code) => {
    try {
      console.log('Verify email attempt with:', { 
        original: email, 
        normalized: normalizeEmail(email),
        code
      });
      
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/verify-email`, {
        email: email.trim(),
        code: code.trim()
      });
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Verification failed');
      throw error;
    }
  };
  

  const resendVerificationCode = async (email) => {
    try {
      console.log('Resend verification attempt with:', { 
        original: email, 
        normalized: normalizeEmail(email) 
      });
      
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/resend-verification`, {
        email: email.trim()
      });
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to resend verification code');
      throw error;
    }
  };
  
  const completeRegistration = async (userData) => {
    try {
      console.log('Complete registration attempt with:', { 
        original: userData.email, 
        normalized: normalizeEmail(userData.email) 
      });
      
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/complete-registration`,
        userData
      );
      
      const { token, user } = response.data;

      localStorage.setItem('token', token);

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      setLoading(false);
      return user;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const isAuthorized = (role) => {
    if (!currentUser) return false;
    
    if (role && currentUser.role !== role) {
      return false;
    }
    
    return true;
  };
  const forgotPassword = async ({ email, verificationCode, newPassword }) => {
    try {
      setError(null);
      setLoading(true);

      const payload = { email };
      if (verificationCode && newPassword) {
        payload.verificationCode = verificationCode;
        payload.newPassword = newPassword;
      }

      const response = await apiClient.post(
          endpoints.auth.forgotPassword,
          payload
      );
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    preRegister,
    verifyEmail,
    resendVerificationCode,
    loginWithBiometric, 
    completeRegistration,
    isAuthorized,
    clearError,
    forgotPassword
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };