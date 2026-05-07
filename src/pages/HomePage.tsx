import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useListings } from '../hooks/useListings';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../types';
import type { Listing } from '../types';
import ListingCard from '../components/ListingCard';
import ListingModal from '../components/ListingModal';
import GuestWall from '../components/GuestWall';
import { SkeletonGrid, SkeletonCategories } from '../components/Skeleton';
import { EmptyListings } from '../components/EmptyState';

export default function HomePage() {
  const { user } = useAuth();
  const { listings, loading } = useListings({ skip: !user });
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
      <section className="relative bg-[#0A3D62] overflow-hidden">
        {/* Layered background — oceano premium */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A3D62] via-[#0C5A86] to-[#1DAFD9] opacity-90" />
          {/* Radial glow — reflexo de água */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#1DAFD9]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-[#0C5A86]/40 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <span className="inline-block text-white/70 text-xs sm:text-sm font-medium tracking-widest uppercase px-5 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-8 letter-spacing-wide">
            Condomínio Maayan · Cidade Jardim
          </span>

          <h1 data-testid="hero-title" className="font-['Cormorant_Garamond'] text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight mb-6">
            Compre, venda e<br/>
            <span className="text-[#7FD6E8] italic">conecte-se</span> com a comunidade
          </h1>

          <p className="text-white/60 text-base sm:text-lg mb-10 max-w-xl mx-auto font-light tracking-wide">
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
                className="bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex-shrink-0"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            {[
              { value: user ? `${listings.length}+` : '—', label: 'Anúncios ativos' },
              { value: `${CATEGORIES.length}`, label: 'Categorias' },
              { value: '100%', label: 'Gratuito' },
            ].map(({ value, label }, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
                <p className="text-white/50 text-xs mt-0.5 tracking-wider uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-[1px]">
          <svg viewBox="0 0 1440 56" className="w-full text-[#FCFCFB] dark:text-[#071a28]" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,56 C360,0 720,56 1080,28 C1260,14 1380,0 1440,0 L1440,56 Z" />
          </svg>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section data-testid="category-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="text-center mb-10">
          <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
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
                className="group flex flex-col items-center gap-1.5 sm:gap-3 p-3 sm:p-6 w-[30%] sm:w-36 lg:flex-1 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl hover:shadow-sky-100/80 dark:hover:shadow-slate-900/60 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 ease-out border border-slate-100 dark:border-slate-700/50 hover:border-sky-200 dark:hover:border-sky-800/50"
              >
                <span className="text-xl sm:text-3xl group-hover:scale-110 transition-transform duration-300 ease-out">{cat.icon}</span>
                <span className="font-medium sm:font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-tight text-center group-hover:text-[#0C5A86] dark:group-hover:text-sky-400 transition-colors">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-8">
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-4xl font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Anúncios recentes
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Os <span className="font-semibold text-slate-700 dark:text-slate-300">6</span> mais recentes do condomínio</p>
          </div>
          {user && !loading && featuredListings.length > 0 && (
            <Link
              to="/anuncios"
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-[#0C5A86] dark:text-sky-400 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-[#0C5A86]/25 dark:border-sky-400/20 hover:bg-[#0C5A86]/6 dark:hover:bg-sky-400/8 hover:border-[#0C5A86]/40 dark:hover:border-sky-400/35 transition-all duration-150 whitespace-nowrap"
            >
              Ver todos
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {!user ? (
          <GuestWall message="Entre para ver os anúncios da comunidade do condomínio." />
        ) : loading ? (
          <SkeletonGrid count={6} />
        ) : featuredListings.length > 0 ? (
          <div data-testid="listings-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
        <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-[#0A3558]">
          {/* gradient oceânico */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A3558] via-[#0F5C88] to-[#38B6D9]" />
          {/* glow radial sutil — reflexo de água */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_110%,rgba(29,175,217,0.18),transparent)]" />
          <div className="relative px-8 py-12 text-center">
            <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-semibold text-white mb-3">
              Tem algo para anunciar?
            </h2>
            <p className="text-white/60 mb-7 text-sm sm:text-base tracking-wide">
              Publique grátis e alcance toda a comunidade do condomínio
            </p>
            <Link
              data-testid="publish-cta"
              to="/publicar"
              className="inline-flex items-center gap-2 bg-white text-[#0C5A86] font-semibold px-8 py-3 rounded-xl hover:bg-[#f0f8ff] transition-colors shadow-lg text-sm sm:text-base"
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
