import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  ImageOff,
  LayoutGrid,
  List,
  MessageCircle,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import CategoryFilter from "../components/CategoryFilter";
import EmptyState from "../components/EmptyState";
import ListingCard from "../components/ListingCard";
import ListingModal from "../components/ListingModal";
import { SkeletonGrid } from "../components/Skeleton";
import { useListings } from "../hooks/useListings";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import { formatListingPrice } from "../utils/pricing";
import { CATEGORIES } from "../types";
import type { Category, Listing } from "../types";

type ViewMode = "grid" | "list";

const VIEW_MODE_STORAGE_KEY = "maayan:listings:view-mode";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short"
  });
}

interface ListingListItemProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
}

function ListingListItem({ listing, onSelect }: ListingListItemProps) {
  const whatsappLink = buildWhatsAppUrl(listing);
  const price = formatListingPrice(listing);
  const category = CATEGORIES.find(c => c.value === listing.category)!;

  return (
    <article
      className="group rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/70 backdrop-blur-md shadow-[0_2px_12px_rgba(12,90,134,0.06)] hover:shadow-[0_12px_28px_rgba(12,90,134,0.16)] hover:-translate-y-0.5 transition-all cursor-pointer"
      onClick={() => onSelect(listing)}>
      <div className="grid grid-cols-[72px_minmax(0,1fr)] sm:grid-cols-[196px_minmax(0,1fr)_auto_20px] gap-2.5 sm:gap-4 p-2 sm:h-[108px] items-center">
        <div className="w-[72px] h-[72px] sm:w-[196px] sm:h-[100px] flex-shrink-0">
          <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
            {listing.images[0] ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                <ImageOff size={18} />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex flex-col justify-center">
          <h3 className="text-slate-800 dark:text-slate-100 font-semibold text-sm sm:text-base leading-snug line-clamp-2 min-w-0">
            {listing.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <p className="text-slate-500 dark:text-slate-300 text-[11px] sm:text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap">
              <Calendar size={12} />
              {formatDate(listing.createdAt)}
            </p>
            <span className="text-slate-300 dark:text-slate-600 text-[10px]">
              •
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${category.badgeClass}`}>
              <span>{category.icon}</span>
              {category.label}
            </span>
          </div>

          <div className="mt-2 flex w-full items-center justify-end gap-2 sm:hidden">
            {price && (
              <p className="text-sky-600 dark:text-teal-500 font-bold text-sm tabular-nums whitespace-nowrap text-right">
                {price}
              </p>
            )}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold px-2.5 py-1 rounded-full transition-all shadow-sm flex-shrink-0">
              <MessageCircle size={13} />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="hidden sm:flex items-center sm:items-end sm:flex-col gap-2 sm:gap-2 justify-self-start sm:justify-self-end">
          {price && (
            <p className="text-sky-600 dark:text-teal-500 font-bold text-sm sm:text-base tabular-nums whitespace-nowrap">
              {price}
            </p>
          )}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all shadow-sm flex-shrink-0">
            <MessageCircle size={13} />
            WhatsApp
          </a>
        </div>

        <div className="hidden sm:flex items-center justify-center text-slate-300 dark:text-slate-600 self-stretch">
          <ChevronRight size={18} />
        </div>
      </div>
    </article>
  );
}

export default function ListingsPage() {
  const { listings, loading } = useListings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    return localStorage.getItem(VIEW_MODE_STORAGE_KEY) === "list"
      ? "list"
      : "grid";
  });

  const searchText = searchParams.get("busca") ?? "";
  const activeCategory = (searchParams.get("categoria") as Category) || null;
  const [inputValue, setInputValue] = useState(searchText);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(searchText);
  }, [searchText]);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => updateParam("busca", value || null),
      300
    );
  };

  const filtered = useMemo(
    () =>
      listings.filter(l => {
        const matchCat = !activeCategory || l.category === activeCategory;
        const q = searchText.toLowerCase();
        const matchSearch =
          !q ||
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.authorName.toLowerCase().includes(q);
        return matchCat && matchSearch;
      }),
    [listings, activeCategory, searchText]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            Anúncios
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm truncate">
            {loading ? (
              <span className="inline-block w-32 h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <>
                {filtered.length} anúncio{filtered.length !== 1 ? "s" : ""}{" "}
                encontrado{filtered.length !== 1 ? "s" : ""}
              </>
            )}
          </p>
        </div>

        <div className="inline-flex items-center gap-1 select-none rounded-full border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/80 p-1 shadow-sm backdrop-blur-md lg:hidden">
          <button
            type="button"
            aria-label="Visualização em grade"
            aria-pressed={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
              viewMode === "grid"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            }`}>
            <LayoutGrid size={13} />
            Grid
          </button>
          <button
            type="button"
            aria-label="Visualização em lista"
            aria-pressed={viewMode === "list"}
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
              viewMode === "list"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            }`}>
            <List size={13} />
            Lista
          </button>
        </div>
      </div>

      <div className="sticky top-16 z-40 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-8 border-b border-slate-100 dark:border-slate-800">
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={inputValue}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Buscar anúncios..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 backdrop-blur-md dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 transition-all"
          />
          {searchText && (
            <button
              onClick={() => updateParam("busca", null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Limpar busca">
              <X size={15} className="text-slate-400" />
            </button>
          )}
        </div>

        <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <CategoryFilter
              active={activeCategory}
              onChange={cat => updateParam("categoria", cat)}
            />
          </div>

          <div className="hidden lg:inline-flex items-center gap-1 select-none rounded-full border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/80 p-1 shadow-sm backdrop-blur-md">
            <button
              type="button"
              aria-label="Visualização em grade"
              aria-pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
              }`}>
              <LayoutGrid size={13} />
              Grid
            </button>
            <button
              type="button"
              aria-label="Visualização em lista"
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
              }`}>
              <List size={13} />
              Lista
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : filtered.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSelect={setSelectedListing}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4 max-w-[1200px] mx-auto w-full">
            {filtered.map(listing => (
              <ListingListItem
                key={listing.id}
                listing={listing}
                onSelect={setSelectedListing}
              />
            ))}
          </div>
        )
      ) : (
        <div className="-mt-8 sm:-mt-10 lg:-mt-14">
          <EmptyState
            icon={
              <SlidersHorizontal className="w-7 h-7 text-slate-300 dark:text-slate-500" />
            }
            title="Nenhum anúncio encontrado"
            description="Tente outros termos ou limpe os filtros"
            actions={
              <>
                {searchText && (
                  <button
                    onClick={() => updateParam("busca", null)}
                    className="text-[#0C5A86] dark:text-sky-400 text-sm font-medium hover:text-[#0C5A86] transition-colors">
                    Limpar busca
                  </button>
                )}
                {activeCategory && (
                  <button
                    onClick={() => updateParam("categoria", null)}
                    className="text-[#0C5A86] dark:text-sky-400 text-sm font-medium hover:text-[#0C5A86] transition-colors">
                    Limpar filtro
                  </button>
                )}
                <Link
                  to="/publicar"
                  className="bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                  Publicar primeiro anúncio
                </Link>
              </>
            }
          />
        </div>
      )}

      {selectedListing && (
        <ListingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}
