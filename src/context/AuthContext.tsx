import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isSupabaseActive: boolean;
  loginDemo: (role?: 'admin' | 'organizer') => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_DEMO_USER: UserProfile = {
  uid: 'usr-organizer-01',
  email: 'organizer@quantix.dev',
  displayName: 'Lead Event Organizer',
  role: 'admin',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('quantix_auth_user');
    return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile: UserProfile = {
            uid: session.user.id,
            email: session.user.email ?? null,
            displayName: session.user.email?.split('@')[0] || 'Organizer',
            role: 'organizer',
            photoURL: null,
          };
          setUser(profile);
          localStorage.setItem('quantix_auth_user', JSON.stringify(profile));
        } else {
          setUser(DEFAULT_DEMO_USER);
          localStorage.removeItem('quantix_auth_user');
        }
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const loginDemo = (role: 'admin' | 'organizer' = 'admin') => {
    const demo: UserProfile = {
      uid: `demo-${Date.now()}`,
      email: role === 'admin' ? 'admin@quantix.dev' : 'coordinator@college.edu',
      displayName: role === 'admin' ? 'Lead Event Organizer' : 'Campus Coordinator',
      role,
    };
    setUser(demo);
    localStorage.setItem('quantix_auth_user', JSON.stringify(demo));
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } else {
      const demo: UserProfile = {
        uid: `usr-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        role: 'organizer',
      };
      setUser(demo);
      localStorage.setItem('quantix_auth_user', JSON.stringify(demo));
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({ email, password: pass });
      if (error) throw error;
    } else {
      await loginWithEmail(email, pass);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('quantix_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseActive: isSupabaseConfigured,
        loginDemo,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};