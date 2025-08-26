import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data); // Debug log
      
      // Handle the actual backend response structure
      const newToken = response.data.token;
      
      // The user data is directly in the response, not nested under 'user'
      const userData = {
        userId: response.data.userId,
        username: response.data.username,
        role: response.data.role,
        email: response.data.email || '', // Optional fields
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        doctorId: response.data.doctorId || null,   // For doctors
        patientId: response.data.patientId || null, // For patients
        // Convenience property for role-based ID access
        id: response.data.role === 'DOCTOR' ? response.data.doctorId : 
            response.data.role === 'PATIENT' ? response.data.patientId : 
            response.data.userId
      };
      
      if (!newToken) {
        console.error('No token received in response');
        return { success: false, error: 'No authentication token received' };
      }
      
      console.log('Extracted token:', newToken);
      console.log('Extracted user data:', userData);
      
      setToken(newToken);
      setUser(userData);
      
      try {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
        // Continue without localStorage if there's an issue
      }
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  const registerAdmin = async (adminData) => {
    try {
      const response = await authAPI.registerAdmin(adminData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Admin registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const registerDoctor = async (doctorData) => {
    try {
      const response = await authAPI.registerDoctor(doctorData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Doctor registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const registerPatient = async (patientData) => {
    try {
      const response = await authAPI.registerPatient(patientData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Patient registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const isAuthenticated = () => {
    return token && user;
  };

  const hasRole = (requiredRole) => {
    return user && user.role === requiredRole;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    registerAdmin,
    registerDoctor,
    registerPatient,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
