
import { createContext } from 'react';
import { AuthContextType } from './types';
import { useAuthSession } from './useAuthSession';
import { useAuthActions } from './useAuthActions';
import { useSubscriptionStatus } from './useSubscriptionStatus';

// Create context with undefined initial value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { 
    session, 
    user, 
    appUser, 
    organization, 
    loading, 
    isAdmin,
    refetchUserData 
  } = useAuthSession();
  
  const { signIn, signUp, signOut } = useAuthActions();
  
  const { isBlocked, subscriptionExpiringSoon } = useSubscriptionStatus(organization);

  // Define the context value without using the AuthContextType directly here
  const contextValue = {
    session,
    user,
    appUser,
    organization,
    signIn,
    signUp,
    signOut,
    loading,
    isAdmin,
    isBlocked,
    subscriptionExpiringSoon,
    refetchUserData
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
