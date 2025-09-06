import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  aadhaar: string;
  mobile?: string;
  role: 'pilgrim' | 'authority';
  bankAccount?: string;
}

interface AuthContextType {
  user: User | null;
  login: (aadhaar: string, name: string, role: 'pilgrim' | 'authority') => void;
  logout: () => void;
  isAuthenticated: boolean;
  language: 'en' | 'hi';
  toggleLanguage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const login = (aadhaar: string, name: string, role: 'pilgrim' | 'authority') => {
    // Mock authentication with Aadhaar validation
    const mockUser: User = {
      id: `user_${Date.now()}`,
      name: name,
      aadhaar: aadhaar,
      mobile: `9${Math.floor(Math.random() * 900000000) + 100000000}`, // Mock mobile
      role: role,
      bankAccount: `${aadhaar.replace(/\D/g, '').slice(-4)}XXXX` // Mock bank account
    };
    setUser(mockUser);
  };

  const logout = () => {
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