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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // Create mock user data if authenticated
          const mockUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || 'Test User',
            aadhaar: session.user.user_metadata?.aadhaar_number || '123456789012',
            mobile: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
            role: session.user.user_metadata?.role || 'pilgrim',
            bankAccount: `${(session.user.user_metadata?.aadhaar_number || '123456789012').slice(-4)}XXXX`
          };
          setUser(mockUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const mockUser = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || 'Test User',
          aadhaar: session.user.user_metadata?.aadhaar_number || '123456789012',
          mobile: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
          role: session.user.user_metadata?.role || 'pilgrim',
          bankAccount: `${(session.user.user_metadata?.aadhaar_number || '123456789012').slice(-4)}XXXX`
        };
        setUser(mockUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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