import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type UserProfile = {
  user_id: string;
  email: string;
  display_name: string | null;
};

type LinkedPlayerProfile = {
  id: string;
  full_name: string;
  approved: boolean;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  linkedPlayer: LinkedPlayerProfile | null;
  needsPlayerProfile: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [linkedPlayer, setLinkedPlayer] = useState<LinkedPlayerProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (activeUser: User | null) => {
    if (!activeUser) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("user_id, email, display_name")
      .eq("user_id", activeUser.id)
      .maybeSingle();

    if (error) {
      console.error("Error loading user profile:", error.message);
      return;
    }

    if (!data) {
      const { data: created, error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: activeUser.id,
          email: activeUser.email ?? "",
          display_name: activeUser.user_metadata?.display_name ?? null,
        })
        .select("user_id, email, display_name")
        .single();

      if (insertError) {
        console.error("Error creating user profile:", insertError.message);
        return;
      }

      setProfile(created);
      return;
    }

    setProfile(data);
  };

  const fetchLinkedPlayer = async (activeUser: User | null) => {
    if (!activeUser) {
      setLinkedPlayer(null);
      return;
    }

    const { data, error } = await supabase
      .from("players")
      .select("id, full_name, approved")
      .eq("user_id", activeUser.id)
      .maybeSingle();

    if (error) {
      setLinkedPlayer(null);
      console.error("Error loading linked player profile:", error.message);
      return;
    }

    if (!data) {
      setLinkedPlayer(null);
      return;
    }

    setLinkedPlayer({
      id: data.id,
      full_name: data.full_name,
      approved: Boolean(data.approved),
    });
  };

  const fetchAdminStatus = async (activeUser: User | null) => {
    if (!activeUser) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from("app_admins")
      .select("user_id")
      .eq("user_id", activeUser.id)
      .maybeSingle();

    if (error) {
      setIsAdmin(false);
      console.error("Error loading admin membership:", error.message);
      return;
    }

    setIsAdmin(Boolean(data));
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      if (mounted) setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await fetchProfile(data.session?.user ?? null);
      await fetchAdminStatus(data.session?.user ?? null);
      await fetchLinkedPlayer(data.session?.user ?? null);
      if (mounted) setLoading(false);
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const syncAuthState = async () => {
        if (mounted) setLoading(true);
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        await fetchProfile(nextSession?.user ?? null);
        await fetchAdminStatus(nextSession?.user ?? null);
        await fetchLinkedPlayer(nextSession?.user ?? null);
        if (mounted) setLoading(false);
      };
      void syncAuthState();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile(user);
    await fetchLinkedPlayer(user);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      profile,
      linkedPlayer,
      needsPlayerProfile: Boolean(user && !linkedPlayer),
      isAdmin,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [user, session, profile, linkedPlayer, isAdmin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
