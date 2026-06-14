import { MessageCircle, ImageOff, Images } from "lucide-react";
import { CATEGORIES } from "../types";
import type { Listing } from "../types";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import { formatListingPrice } from "../utils/pricing";

interface ListingCardProps {
  listing: Listing;
  isSold?: boolean;
  soldAt?: string;
  onSelect: (listing: Listing) => void;
}

export default function ListingCard({
  listing,
  isSold = false,
  soldAt,
  onSelect
}: ListingCardProps) {
  const category = CATEGORIES.find(c => c.value === listing.category)!;
  const whatsappLink = buildWhatsAppUrl(listing);
  const price = formatListingPrice(listing);

  const formatDate = (dateStr: string) => {
    const parts = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).formatToParts(new Date(dateStr));

    const day = parts.find(p => p.type === "day")?.value ?? "";
    const month = parts.find(p => p.type === "month")?.value ?? "";
    const year = parts.find(p => p.type === "year")?.value ?? "";

    return `${day} ${month} ${year}`.trim();
  };

  const formatSoldDate = (dateStr: string) => {
    const parts = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).formatToParts(new Date(dateStr));

    const day = parts.find(p => p.type === "day")?.value ?? "";
    const month = parts.find(p => p.type === "month")?.value ?? "";
    const year = parts.find(p => p.type === "year")?.value ?? "";

    return `${day} ${month} ${year}`.trim();
  };

  return (
    <article
      className="flex flex-col bg-white/80 backdrop-blur-md dark:bg-slate-800/80 rounded-2xl shadow-[0_2px_12px_rgba(12,90,134,0.06)] hover:shadow-[0_8px_30px_rgba(12,90,134,0.14)] hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out overflow-hidden cursor-pointer group border border-[#EEF2F7] dark:border-slate-700/40 hover:border-[#1DAFD9]/30 dark:hover:border-sky-700/40"
      onClick={() => onSelect(listing)}>
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700 relative">
        {listing.images[0] ? (
          <>
            <img
              src={listing.images[0]}
              alt={listing.title}
              loading="lazy"
              className={`w-full h-full object-cover transition-all duration-500 ${
                isSold
                  ? "opacity-85 grayscale-[15%]"
                  : "group-hover:scale-105"
              }`}
            />
            {listing.images.length > 1 && (
              <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                <Images size={10} />
                {listing.images.length}
              </span>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 gap-2">
            <ImageOff className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            <span className="text-xs text-slate-300 dark:text-slate-600">
              Sem imagem
            </span>
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${category.badgeClass}`}>
          {category.icon} {category.label}
        </span>
        {isSold && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-700/85 text-white backdrop-blur-sm">
            Vendido
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2 mb-1">
          {listing.title}
        </h3>

        {price && (
          <p className="text-sky-600 dark:text-teal-500 font-bold text-base sm:text-lg mb-2 tabular-nums">
            {price}
          </p>
        )}

        <div className="flex items-end justify-between gap-2 mt-auto pt-2">
          <div className="min-w-0">
            <p className="text-slate-500 dark:text-slate-300 text-xs font-medium mt-0.5">
              {formatDate(listing.createdAt)}
            </p>
            {isSold && soldAt && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Vendido em {formatSoldDate(soldAt)}
              </p>
            )}
          </div>
          {!isSold && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold px-3 py-2 rounded-full transition-all shadow-sm flex-shrink-0">
              <MessageCircle size={13} />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
