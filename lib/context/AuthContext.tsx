"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  role_id: number;
  division_id: number;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from("users")
        .select("user_id, role_id, division_id")
        .eq("user_id", user.id)
        .single();

      setProfile(
        profileData
          ? {
              id: profileData.user_id,
              role_id: profileData.role_id,
              division_id: profileData.division_id,
            }
          : null,
      );
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
