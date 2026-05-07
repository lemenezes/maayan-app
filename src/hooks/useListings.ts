import { useState, useEffect, useCallback } from 'react';
import type { Listing } from '../types';
import { fetchListings } from '../services/listingsService';
import { isSupabaseConfigured } from '../lib/supabase';
import { mockListings } from '../data/mockListings';

const SUPABASE_CONFIGURED = isSupabaseConfigured && import.meta.env.VITE_USE_MOCK !== 'true';

interface UseListingsOptions {
  /** Quando true, não busca dados (ex: usuário não autenticado) */
  skip?: boolean;
}

export function useListings(options: UseListingsOptions = {}) {
  const { skip = false } = options;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (skip) {
      setListings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    if (!SUPABASE_CONFIGURED) {
      // Dev fallback: use mock data
      await new Promise((r) => setTimeout(r, 400));
      setListings(mockListings);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchListings();
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar anúncios');
      setListings(mockListings); // graceful fallback
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => {
    load();
  }, [load]);

  return { listings, loading, error, reload: load };
}
