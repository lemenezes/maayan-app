import { useState, useEffect } from 'react';
import type { Listing } from '../types';
import { mockListings } from '../data/mockListings';

const STORAGE_KEY = 'maayan_listings';

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Short simulated load for perceived-performance skeleton
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: Listing[] = JSON.parse(stored);
          setListings(parsed.length > 0 ? parsed : mockListings);
        } else {
          setListings(mockListings);
        }
      } catch {
        setListings(mockListings);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const addListing = (data: Omit<Listing, 'id' | 'createdAt'>): Listing => {
    const listing: Listing = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [listing, ...listings];
    setListings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return listing;
  };

  return { listings, loading, addListing };
}
