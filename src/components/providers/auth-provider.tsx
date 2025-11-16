"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { getSupabaseClient } from "@/lib/supabase-client";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function ensureProfileExists(userId: string, fallbackName: string) {
  const supabase = getSupabaseClient();
  await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        display_name: fallbackName,
        avatar_url: null
      },
      { onConflict: "id" }
    );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(
    async (currentSession: Session | null) => {
      if (!currentSession?.user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, created_at")
        .eq("id", currentSession.user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }

      if (!data) {
        const fallbackName =
          (currentSession.user.user_metadata?.display_name as string | undefined) ??
          currentSession.user.email?.split("@")[0] ??
          "방명록 사용자";
        await ensureProfileExists(currentSession.user.id, fallbackName);
        await loadProfile(currentSession);
        return;
      }

      setProfile(data);
      setIsLoading(false);
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    await loadProfile(session);
  }, [loadProfile, session]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }
      if (!isMounted) return;
      setSession(data.session);
      await loadProfile(data.session);
    };

    init();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      loadProfile(newSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      refreshProfile
    }),
    [session, profile, isLoading, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}
