
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Organization, User as AppUser } from '@/types/organization';
import { fetchUserData } from './authUtils';

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refetchUserData = async () => {
    if (user) {
      setLoading(true);
      try {
        console.log("Refetching user data...");
        const result = await fetchUserData(user.id);
        
        if (result) {
          setAppUser(result.appUser);
          setOrganization(result.organization);
          setIsAdmin(result.isAdmin);
          console.log("User data refetched successfully:", result);
        } else {
          console.warn("No user data returned from refetch");
        }
        
        setLoading(false);
        return result;
      } catch (error) {
        console.error('Error refetching user data:', error);
        setLoading(false);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    // Flag to prevent setting state after unmount
    let isMounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const result = await fetchUserData(session.user.id);
            
            if (!isMounted) return;
            
            if (result) {
              setAppUser(result.appUser);
              setOrganization(result.organization);
              setIsAdmin(result.isAdmin);
              console.log("Initial user data loaded:", result);
            }
          } catch (error) {
            console.error("Error loading initial user data:", error);
          }
        }
      } catch (error) {
        console.error("Session fetching error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setLoading(true);
        try {
          const result = await fetchUserData(session.user.id);
          
          if (!isMounted) return;
          
          if (result) {
            setAppUser(result.appUser);
            setOrganization(result.organization);
            setIsAdmin(result.isAdmin);
            console.log("Auth state change user data loaded:", result);
          }
        } catch (error) {
          console.error("Error loading auth state change user data:", error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setAppUser(null);
          setOrganization(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    appUser,
    organization,
    loading,
    isAdmin,
    refetchUserData
  };
}
