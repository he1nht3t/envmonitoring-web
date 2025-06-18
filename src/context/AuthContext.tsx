'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, getUserRole, checkProfilesTable } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRole: string;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');
  const [roleError, setRoleError] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Check if the profiles table exists on mount
    useEffect(() => {
      const checkTable = async () => {
        const tableExists = await checkProfilesTable();
        if (!tableExists) {
        setRoleError(true);
        toast({
          title: "Database Configuration Issue",
          description: "Unable to access user roles. Default permissions will be applied.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
    
    checkTable();
  }, [toast]);

  // Fetch user role when user changes
  useEffect(() => {
    async function fetchUserRole() {
      if (user) {
        try {
          const role = await getUserRole(user.id);
          setUserRole(role);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
          
          // Show toast notification for role error
          if (!roleError) {
            toast({
              title: "Role Assignment Issue",
              description: "Could not determine your role. Default user permissions applied.",
              variant: "destructive",
              duration: 5000,
            });
            setRoleError(true);
          }
        }
      } else {
        setUserRole('user');
      }
    }
    
    fetchUserRole();
  }, [user, roleError, toast]);

  useEffect(() => {
    // Get session on mount
    const getSession = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(data.session);
        setUser(data.session?.user || null);
      }
      
      setIsLoading(false);
    };

    getSession();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Redirect if accessing protected route and not authenticated
  useEffect(() => {
    if (!isLoading) {
      // Check if the current path is protected and user is not authenticated
      const protectedRoutes = ['/analytics', '/devices'];
      if (protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/')) && !session) {
        // Include the current path as a redirect parameter
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [pathname, session, isLoading, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    return { error };
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
    isAuthenticated: !!session,
    isAdmin: userRole === 'admin',
    userRole,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
