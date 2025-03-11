
import { Session, User } from '@supabase/supabase-js';
import { Organization, User as AppUser } from '@/types/organization';

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  appUser: AppUser | null;
  organization: Organization | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, orgName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  subscriptionExpiringSoon: boolean;
  refetchUserData: () => Promise<any>;
};
