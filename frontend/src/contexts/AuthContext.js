import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------------------------------------------
   * AUTH STATE (SINGLE SOURCE OF TRUTH)
   * --------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const handleSession = async (session) => {
      if (!mounted) return;

      setSession(session);

      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        setUser(null);
      } else {
        setUser(data);
      }

      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      handleSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ---------------------------------------------
   * SIGNUP
   * --------------------------------------------- */
  const signup = async ({
    name,
    email,
    password,
    role = 'user',
    location,
    categories = [],
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (error) throw error;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        location,
        categories,
        is_approved: role === 'artist' ? false : true,
      })
      .eq('id', data.user.id);

    if (profileError) throw profileError;
  };

  /* ---------------------------------------------
   * LOGIN
   * --------------------------------------------- */
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  /* ---------------------------------------------
   * LOGOUT
   * --------------------------------------------- */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  /* ---------------------------------------------
   * UPDATE PROFILE
   * --------------------------------------------- */
  const updateProfile = async ({ name, location, categories }) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        location,
        categories,
      })
      .eq('id', user.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    setUser(data);
    return data;
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
