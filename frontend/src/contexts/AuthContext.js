import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // profile
  const [session, setSession] = useState(null); // auth session
  const [isLoading, setIsLoading] = useState(true);

 /* ---------------------------------------------
 * INIT + AUTH STATE LISTENER (SINGLE SOURCE)
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

  // 1️⃣ Initial session load
  supabase.auth.getSession().then(({ data }) => {
    handleSession(data.session);
  });

  // 2️⃣ Auth state change listener
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
const signup = async ({
  name,
  email,
  password,
  role = 'user',
  location,
  categories = [],
}) => {
  // 1️⃣ Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },
    },
  });

  if (error) throw error;


  // user ALWAYS exists now
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name,
      location,
      categories,
      is_approved: role === 'artist' ? false : true,
    })
    .eq('id', data.user.id);

  if (profileError) throw profileError;

  return true;
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

  // auth listener will handle everything
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
const updateProfile = async ({ name, location, categories }) => {
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update({
      name,
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
        isAuthenticated: !!session,
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
