import React, { createContext, useContext, useState } from 'react';
import { auth } from '@/lib/supabase';

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
  const [language, setLanguage] = useState('hi');

  const login = async (aadhaar, name, role) => {
    try {
      // For demo purposes, create a mock email from Aadhaar
      const email = `${aadhaar}@simhastha.gov.in`;
      const password = aadhaar; // In production, use proper password

      // Try to sign in first
      let result = await auth.signIn(email, password);
      
      // If sign in fails, create new user
      if (result.error) {
        result = await auth.signUp(email, password, {
          full_name: name,
          aadhaar_number: aadhaar,
          role: role
        });
      }

      if (result.data?.user) {
        const mockUser = {
          id: result.data.user.id,
          name: name,
          aadhaar: aadhaar,
          mobile: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
          role: role,
          bankAccount: `${aadhaar.slice(-4)}XXXX`
        };
        setUser(mockUser);
        return { success: true, user: mockUser };
      }
      
      return { success: false, error: result.error?.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const isAuthenticated = user !== null;

  const value = {
    user,
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