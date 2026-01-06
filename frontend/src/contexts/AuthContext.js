import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

 const fetchUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // ✅ IMPORTANT

    if (error) {
      console.error('Profile fetch error:', error);
      setUser(null);
      return;
    }

    // data can be null if profile not created yet
    if (!data) {
      console.warn('Profile not found yet for user:', userId);
      setUser(null);
      return;
    }

    setUser(data);
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};


  const signup = async ({ name, email, password, role, categories, location }) => {
    try {
      // 1. Create auth user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: role || 'user'
          }
        }
      });

      if (authError) throw authError;

      // 2. Create user profile in database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name,
            email,
            role: role || 'user',
            categories: categories || [],
            location: location || '',
            is_approved: role === 'user' ? true : false, // Auto-approve users, artists need approval
            is_active: true,
            joined_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      setUser(profileData);
      return profileData;
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Fetch user profile
      await fetchUserProfile(data.user.id);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(data);
      return data;
    } catch (error) {
      console.error(error);
      throw Error;
    }
  };

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        login,
        signup,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
