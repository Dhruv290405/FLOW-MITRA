import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, supabase } from '@/lib/supabase';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [language, setLanguage] = useState('hi');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple demo mode - skip complex auth for now
    setLoading(false);
  }, []);

  const login = async (aadhaar, name, role) => {
    // Simple demo login - bypassing Supabase for now
    const mockUser = {
      id: `demo-${aadhaar}`,
      name: name,
      aadhaar: aadhaar,
      mobile: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
      role: role,
      bankAccount: `${aadhaar.slice(-4)}XXXX`
    };
    
    setUser(mockUser);
    setLoading(false);
    return { success: true, user: mockUser };
  };

  const logout = async () => {
    setUser(null);
    setSession(null);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const isAuthenticated = user !== null;

  const value = {
    user,
    session,
    loading,
    login,
    logout,
    isAuthenticated,
    language,
    toggleLanguage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};