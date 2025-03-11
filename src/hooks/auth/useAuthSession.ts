
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
      const result = await fetchUserData(user.id);
      setAppUser(result.appUser);
      setOrganization(result.organization);
      setIsAdmin(result.isAdmin);
      return result;
    }
    return null;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id).then((result) => {
          setAppUser(result.appUser);
          setOrganization(result.organization);
          setIsAdmin(result.isAdmin);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id).then((result) => {
          setAppUser(result.appUser);
          setOrganization(result.organization);
          setIsAdmin(result.isAdmin);
        });
      } else {
        setAppUser(null);
        setOrganization(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
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
