import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // profile
  const [session, setSession] = useState(null); // auth session
  const [isLoading, setIsLoading] = useState(true);

  /* ---------------------------------------------
   * INIT + AUTH STATE LISTENER
   * --------------------------------------------- */
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session?.user) {
        await fetchUserProfile(data.session.user.id);
      } else {
        setIsLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------------------------------------------
   * FETCH PROFILE (SAFE)
   * --------------------------------------------- */
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        setUser(null);
        return;
      }

      // Can be null on first login → profile completion page
      setUser(data ?? null);
    } catch (err) {
      console.error('Unexpected profile error:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------
   * SIGNUP (AUTH ONLY — DB handled by trigger)
   * --------------------------------------------- */
  const signup = async ({ email, password, role = 'user' }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    // profile row is auto-created by DB trigger
    return data.user;
  };

  /* ---------------------------------------------
   * LOGIN
   * --------------------------------------------- */
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    await fetchUserProfile(data.user.id);
    return true;
  };

  /* ---------------------------------------------
   * LOGOUT
   * --------------------------------------------- */
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }

    setUser(null);
    setSession(null);
  };

  /* ---------------------------------------------
   * UPDATE PROFILE (ONLY EXISTING COLUMNS)
   * --------------------------------------------- */
  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');

    const allowedUpdates = {
      email: updates.email,
      role: updates.role,
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(allowedUpdates)
      .eq('id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Profile update error:', error);
      throw error;
    }

    setUser(data);
    return data;
  };

  /* ---------------------------------------------
   * TOKEN HELPER
   * --------------------------------------------- */
  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signup,
        login,
        logout,
        updateProfile,
        getAccessToken,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isArtist: user?.role === 'artist',
        isLeadChitrakar: user?.role === 'lead_chitrakar',
        isKalakar: user?.role === 'kalakar',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------------------------------------
 * HOOK
 * --------------------------------------------- */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
