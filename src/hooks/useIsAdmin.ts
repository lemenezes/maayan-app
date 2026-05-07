import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserRole } from '../services/listingsService';

/**
 * Returns whether the currently logged-in user has the 'admin' role.
 * Returns `null` while loading.
 */
export function useIsAdmin(): boolean | null {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setIsAdmin(false); return; }

    fetchUserRole(user.id).then((role) => setIsAdmin(role === 'admin'));
  }, [user, authLoading]);

  return isAdmin;
}
