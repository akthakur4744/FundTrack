'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged as onFirebaseAuthStateChanged } from 'firebase/auth';
import { auth } from '../config';
import { AuthUser, userToAuthUser } from '../auth';

export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to track Firebase authentication state
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(auth, (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(userToAuthUser(firebaseUser));
          setError(null);
        } else {
          setUser(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return { user, loading, error };
};
