// src/lib/authContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User, UserRole, UserStatus, Workspace } from "../types";
import { supabase } from "../config/supabase";

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  createWorkspace: (name: string, size: string) => Promise<void>;
  joinWorkspace: (code: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map Supabase user + DB profile to App User
const mapUser = (authUser: SupabaseUser, profile: any): User => ({
  id: authUser.id,
  name: `${profile.first_name || profile.full_name || ''} ${profile.last_name || ''}`.trim(),
  firstName: profile.first_name || profile.full_name || '',
  lastName: profile.last_name || '',
  email: authUser.email!,
  avatar:
    profile.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent((profile.first_name || '') + ' ' + (profile.last_name || ''))}&background=0073EA&color=fff`,
  role: profile.role as UserRole,
  status: profile.status as UserStatus,
  jobTitle: profile.job_title || '',
  department: profile.department || '',
  joinedAt: profile.created_at,
  workspaceId: profile.workspace_id,
  managerId: profile.manager_id,
  lastActiveAt: profile.updated_at,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      console.log(" fetchProfile called for userId:", userId);
      console.log(" About to query Supabase...");

      // Add timeout to the query
      const queryPromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Query timeout after 5 seconds")),
          5000,
        ),
      );

      const { data: profile, error } = await Promise.race([
        queryPromise,
        timeoutPromise,
      ]);

      console.log(" Supabase response:", { profile, error });

      if (error) {
        console.error(" Error fetching profile:", error);
        return null;
      }

      if (profile) {
        const authUser = (await supabase.auth.getUser()).data.user;
        if (!authUser) return null;

        const appUser = mapUser(authUser, profile);
        setUser(appUser);


        if (profile.workspace_id) {
          setWorkspace({
            id: profile.workspace_id,
            name: "Your Workspace",
            slug: "workspace",
            logoUrl: "",
            createdAt: new Date().toISOString(),
          });
        }

        return appUser;
      }
    } catch (e) {
      console.error("!! Profile fetch exception:", e);
      return null;
    }
    return null;
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check error:", error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setWorkspace(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) throw error;
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) throw error;
  };

  const createWorkspace = async (name: string, size: string) => {
    if (!user) throw new Error("No authenticated user");

    try {
      console.log(" Creating workspace with name:", name, "size:", size);

      // Insert workspace with ACTUAL columns only
      const { data: ws, error: wsError } = await supabase
        .from("workspaces")
        .insert({
          name,
          description: `Workspace for ${size}`,
          owner_id: user.id,
        })
        .select("id, name, description, owner_id, created_at, updated_at")
        .single();

      if (wsError) {
        console.error(" Workspace creation error:", wsError);
        throw wsError;
      }

      if (!ws) throw new Error("Failed to create workspace");

      console.log(" Workspace created:", ws);

      // Update user's workspace_id and promote to SUPER_ADMIN
      const { error: userError } = await supabase
        .from("profiles")
        .update({
          workspace_id: ws.id,
          role: UserRole.SUPER_ADMIN,
        })
        .eq("id", user.id);

      if (userError) {
        console.error(" User update error:", userError);
        throw userError;
      }

      console.log(" User promoted to SUPER_ADMIN");

      //  Set workspace directly from created data
      setWorkspace({
        id: ws.id,
        name: ws.name,
        slug: ws.name?.toLowerCase().replace(/\s+/g, "-") || "workspace",
        logoUrl: "",
        createdAt: ws.created_at,
      });

      // Update user state with new workspace_id and role
      if (user) {
        setUser({
          ...user,
          workspaceId: ws.id,
          role: UserRole.SUPER_ADMIN,
        });
      }

      console.log(" Workspace setup complete!");
    } catch (error) {
      console.error(" Error in createWorkspace:", error);
      throw error;
    }
  };

  const joinWorkspace = async (code: string) => {
    throw new Error("Join workspace not implemented yet");
  };

  const verifyEmail = async () => {
    // Supabase handles this automatically
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setWorkspace(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("No authenticated user");

    const dbUpdates: any = {};
    if (data.firstName) dbUpdates.first_name = data.firstName;
    if (data.lastName) dbUpdates.last_name = data.lastName;
    if (data.jobTitle) dbUpdates.job_title = data.jobTitle;
    if (data.department) dbUpdates.department = data.department;

    const { error } = await supabase
      .from("profiles")
      .update(dbUpdates)
      .eq("id", user.id);

    if (error) throw error;

    setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        createWorkspace,
        joinWorkspace,
        verifyEmail,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
