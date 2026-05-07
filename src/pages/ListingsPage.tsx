import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useListings } from '../hooks/useListings';
import type { Category, Listing } from '../types';
import ListingCard from '../components/ListingCard';
import ListingModal from '../components/ListingModal';
import CategoryFilter from '../components/CategoryFilter';
import { SkeletonGrid } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { SlidersHorizontal } from 'lucide-react';

export default function ListingsPage() {
  const { listings, loading } = useListings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const searchText = searchParams.get('busca') ?? '';
  const activeCategory = (searchParams.get('categoria') as Category) || null;

  // Local state keeps the raw input value so dead keys / IME composition work correctly.
  // The URL is updated with a debounce to avoid cutting off accented characters mid-composition.
  const [inputValue, setInputValue] = useState(searchText);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync back when URL param is cleared externally (e.g. clicking the X button)
  useEffect(() => {
    setInputValue(searchText);
  }, [searchText]);

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam('busca', value || null), 300);
  };

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params, { replace: true });
  };

  const filtered = useMemo(
    () =>
      listings.filter((l) => {
        const matchCat = !activeCategory || l.category === activeCategory;
        const q = searchText.toLowerCase();
        const matchSearch =
          !q ||
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.authorName.toLowerCase().includes(q);
        return matchCat && matchSearch;
      }),
    [listings, activeCategory, searchText],
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">Anúncios</h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          {loading ? (
            <span className="inline-block w-32 h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ) : (
            <>{filtered.length} anúncio{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</>
          )}
        </p>
      </div>

      {/* Sticky search + filter */}
      <div className="sticky top-16 z-40 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-8 border-b border-slate-100 dark:border-slate-800">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar anúncios..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 transition-all"
          />
          {searchText && (
            <button
              onClick={() => updateParam('busca', null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Limpar busca"
            >
              <X size={15} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <CategoryFilter
          active={activeCategory}
          onChange={(cat) => updateParam('categoria', cat)}
        />
      </div>

      {/* Listings grid */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSelect={setSelectedListing}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<SlidersHorizontal className="w-7 h-7 text-slate-300 dark:text-slate-500" />}
          title="Nenhum anúncio encontrado"
          description="Tente outros termos ou limpe os filtros"
          actions={
            <>
              {searchText && (
                <button
                  onClick={() => updateParam('busca', null)}
                  className="text-sky-500 dark:text-sky-400 text-sm font-medium hover:text-sky-600 transition-colors"
                >
                  Limpar busca
                </button>
              )}
              {activeCategory && (
                <button
                  onClick={() => updateParam('categoria', null)}
                  className="text-sky-500 dark:text-sky-400 text-sm font-medium hover:text-sky-600 transition-colors"
                >
                  Limpar filtro
                </button>
              )}
              <Link
                to="/publicar"
                className="bg-gradient-to-r from-sky-500 to-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Publicar primeiro anúncio
              </Link>
            </>
          }
        />
      )}

      {/* Detail modal */}
      {selectedListing && (
        <ListingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}
