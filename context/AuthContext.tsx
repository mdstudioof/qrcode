import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthResponse {
  success: boolean;
  error?: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<AuthResponse>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
      }
      setIsLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
        setError(null);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUser = (sbUser: SupabaseUser) => {
    setUser({
      id: sbUser.id,
      name: sbUser.user_metadata.full_name || sbUser.email?.split('@')[0] || 'Usuário',
      email: sbUser.email || '',
      avatar: sbUser.user_metadata.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${sbUser.email}`
    });
  };

  const loginWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw authError;
      }
      
      setIsLoading(false); // Stop loading on success
      return { success: true };
    } catch (err: any) {
      console.error('Error logging in with email:', err.message);
      const msg = err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message;
      setError(msg);
      setIsLoading(false);
      return { success: false, error: err };
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
          }
        }
      });

      if (authError) {
        throw authError;
      }
      
      setIsLoading(false); // Stop loading on success
      return { success: true };
    } catch (err: any) {
      console.error('Error registering:', err.message);
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Se der erro no signOut (ex: usuário já deletado no backend),
      // continuamos a limpeza local normalmente.
      console.warn("Erro ao fazer signOut no servidor:", error);
    } finally {
      // Garante limpeza local
      setUser(null);
      setError(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      error,
      loginWithEmail,
      registerWithEmail,
      logout,
      isAuthenticated: !!user,
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};