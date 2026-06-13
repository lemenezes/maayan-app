import { useEffect } from "react";
import { X, MessageCircle, Calendar } from "lucide-react";
import { CATEGORIES } from "../types";
import type { Listing } from "../types";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import { formatListingPrice } from "../utils/pricing";
import ListingGallery from "./ListingGallery";

interface ListingModalProps {
  listing: Listing;
  onClose: () => void;
}

export default function ListingModal({ listing, onClose }: ListingModalProps) {
  const category = CATEGORIES.find(c => c.value === listing.category)!;
  const whatsappLink = buildWhatsAppUrl(listing);
  const price = formatListingPrice(listing);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={listing.title}
      onClick={onClose}>
      {/* Sheet/Dialog */}
      <div
        className="bg-white/80 backdrop-blur-md dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}>
        {/* Gallery */}
        <ListingGallery
          images={listing.images}
          title={listing.title}
          rounded="modal"
          overlay={
            <>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-sm"
                aria-label="Fechar">
                <X size={18} className="text-slate-700 dark:text-slate-200" />
              </button>
              <span
                className={`absolute top-4 left-4 text-sm font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${category.badgeClass}`}>
                {category.icon} {category.label}
              </span>
            </>
          }
        />

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-3">
            {listing.title}
          </h2>

          {price && (
            <p className="text-3xl font-bold text-[#0C5A86] dark:text-sky-400 mb-5 tabular-nums">
              {price}
            </p>
          )}

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {listing.description}
          </p>

          <div className="border-t border-slate-100 dark:border-slate-700 mb-6" />

          {/* Publication date */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center justify-between gap-4 text-slate-500 dark:text-slate-300 text-sm font-medium">
              <Calendar size={14} />
              <span className="flex-1">
                Publicado em {formatDate(listing.createdAt)}
              </span>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-auto flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm">
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
