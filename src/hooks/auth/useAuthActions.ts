
import { useState } from 'react';
import { useSignIn } from './useSignIn';
import { useSignUp } from './useSignUp';
import { useSignOut } from './useSignOut';

export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { signOut } = useSignOut();

  return {
    signIn,
    signUp,
    signOut,
    loading,
  };
}
