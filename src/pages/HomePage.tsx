import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useListings } from '../hooks/useListings';
import { CATEGORIES } from '../types';
import type { Listing } from '../types';
import ListingCard from '../components/ListingCard';
import ListingModal from '../components/ListingModal';
import { SkeletonGrid, SkeletonCategories } from '../components/Skeleton';
import { EmptyListings } from '../components/EmptyState';

export default function HomePage() {
  const { listings, loading } = useListings();
  const [searchInput, setSearchInput] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const navigate = useNavigate();

  const featuredListings = listings.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    navigate(query ? `/anuncios?busca=${encodeURIComponent(query)}` : '/anuncios');
  };

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-sky-500 via-sky-400 to-purple-600 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <span className="inline-block text-sky-100 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full border border-sky-200/40 bg-white/10 backdrop-blur-sm mb-6">
            ✨ Exclusivo para quem mora no Condomínio Maayan
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5">
            Compre, venda e
            <br />
            <span className="text-sky-100">conecte-se</span> com a comunidade
          </h1>

          <p className="text-sky-100 text-lg sm:text-xl mb-10 max-w-lg mx-auto font-light">
            Classificados simples e confiáveis para quem mora aqui.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl shadow-sky-900/20 p-2">
              <Search className="absolute left-5 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="O que você está procurando?"
                className="flex-1 pl-12 pr-4 py-2.5 text-slate-800 placeholder-slate-400 bg-transparent outline-none text-base"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-sky-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex-shrink-0"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            {[
              { value: `${listings.length}+`, label: 'Anúncios ativos' },
              { value: `${CATEGORIES.length}`, label: 'Categorias' },
              { value: '100%', label: 'Gratuito' },
            ].map(({ value, label }, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
                <p className="text-sky-200 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 56"
            className="w-full text-slate-50 dark:text-slate-900"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,56 C360,0 720,56 1080,28 C1260,14 1380,0 1440,0 L1440,56 Z"
            />
          </svg>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            O que você procura?
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm">Navegue pelas categorias disponíveis</p>
        </div>

        {loading ? (
          <SkeletonCategories />
        ) : (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const count = listings.filter((l) => l.category === cat.value).length;
            return (
              <button
                key={cat.value}
                onClick={() => navigate(`/anuncios?categoria=${cat.value}`)}
                className="group flex flex-col items-center gap-1.5 sm:gap-3 p-3 sm:p-6 w-[30%] sm:w-36 lg:flex-1 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-slate-900/60 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 ease-out border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600"
              >
                <span className="text-xl sm:text-3xl group-hover:scale-110 transition-transform duration-300 ease-out">{cat.icon}</span>
                <span className="font-medium sm:font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-tight text-center group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {cat.label}
                </span>
                <span className="hidden sm:block text-xs text-slate-300 dark:text-slate-600">
                  {count} anúncio{count !== 1 ? 's' : ''}
                </span>
              </button>
            );
          })}
        </div>
        )}
      </section>

      {/* ─── Featured Listings ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              Anúncios recentes
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Os mais recentes do condomínio</p>
          </div>
          {!loading && featuredListings.length > 0 && (
            <Link
              to="/anuncios"
              className="flex items-center gap-1.5 text-sky-500 font-semibold text-sm hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Ver todos
              <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {loading ? (
          <SkeletonGrid count={6} />
        ) : featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {featuredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSelect={setSelectedListing}
              />
            ))}
          </div>
        ) : (
          <EmptyListings />
        )}
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-sky-500 to-purple-600 rounded-3xl overflow-hidden">
          <div className="px-8 py-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Tem algo para anunciar?
            </h2>
            <p className="text-sky-100 mb-7 text-sm sm:text-base">
              Publique grátis e alcance toda a comunidade do condomínio
            </p>
            <Link
              to="/publicar"
              className="inline-flex items-center gap-2 bg-white text-sky-600 font-bold px-8 py-3 rounded-full hover:bg-sky-50 transition-colors shadow-lg text-sm sm:text-base"
            >
              Publicar Anúncio Grátis
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedListing && (
        <ListingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </>
  );
}
