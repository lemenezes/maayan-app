import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useListings } from '../hooks/useListings';
import type { Category, Listing } from '../types';
import ListingCard from '../components/ListingCard';
import ListingModal from '../components/ListingModal';
import CategoryFilter from '../components/CategoryFilter';

export default function ListingsPage() {
  const { listings } = useListings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const searchText = searchParams.get('busca') ?? '';
  const activeCategory = (searchParams.get('categoria') as Category) || null;

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
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Anúncios</h1>
        <p className="text-slate-400 text-sm">
          {filtered.length} anúncio{filtered.length !== 1 ? 's' : ''} encontrado
          {filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Sticky search + filter */}
      <div className="sticky top-16 z-40 bg-slate-50/90 backdrop-blur-md -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-8 border-b border-slate-100">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => updateParam('busca', e.target.value || null)}
            placeholder="Buscar anúncios..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
          />
          {searchText && (
            <button
              onClick={() => updateParam('busca', null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 transition-colors"
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
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSelect={setSelectedListing}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SlidersHorizontal className="w-7 h-7 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            Nenhum anúncio encontrado
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Tente outros termos ou limpe os filtros
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {searchText && (
              <button
                onClick={() => updateParam('busca', null)}
                className="text-sky-500 text-sm font-medium hover:text-sky-600 transition-colors"
              >
                Limpar busca
              </button>
            )}
            {activeCategory && (
              <button
                onClick={() => updateParam('categoria', null)}
                className="text-sky-500 text-sm font-medium hover:text-sky-600 transition-colors"
              >
                Limpar filtro
              </button>
            )}
            <Link
              to="/publicar"
              className="bg-gradient-to-r from-sky-500 to-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Publicar primeiro anúncio
            </Link>
          </div>
        </div>
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
