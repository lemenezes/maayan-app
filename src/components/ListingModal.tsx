import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, MessageCircle, MapPin, Calendar, ExternalLink } from "lucide-react";
import { CATEGORIES } from "../types";
import type { Listing } from "../types";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import ListingGallery from "./ListingGallery";

interface ListingModalProps {
  listing: Listing;
  onClose: () => void;
}

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export default function ListingModal({ listing, onClose }: ListingModalProps) {
  const category = CATEGORIES.find(c => c.value === listing.category)!;
  const whatsappLink = buildWhatsAppUrl(listing);

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

  const formatPrice = (price: number) =>
    listing.category === "servicos"
      ? `${priceFormatter.format(price)}/h`
      : priceFormatter.format(price);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={listing.title}
      onClick={onClose}>
      {/* Sheet/Dialog */}
      <div
        className="bg-white/80 backdrop-blur-md dark:bg-slate-800 w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-scale-in"
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

          {listing.price !== undefined && (
            <p className="text-3xl font-bold text-[#0C5A86] dark:text-sky-400 mb-5 tabular-nums">
              {formatPrice(listing.price)}
            </p>
          )}

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {listing.description}
          </p>

          <div className="border-t border-slate-100 dark:border-slate-700 mb-6" />

          {/* Author Info */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-sky-900/60 dark:to-cyan-900/60 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#0C5A86] dark:text-sky-400">
                  {listing.authorName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  {listing.authorName}
                </p>
                {listing.apartment && (
                  <p className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin size={11} />
                    {listing.apartment} · Condomínio Maayan
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
              <Calendar size={14} />
              Publicado em {formatDate(listing.createdAt)}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-semibold py-4 rounded-2xl text-base transition-all shadow-sm">
              <MessageCircle size={20} />
              Entrar em contato via WhatsApp
            </a>
            <Link
              to={`/anuncios/${listing.id}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium py-3 rounded-2xl text-sm transition-colors">
              <ExternalLink size={15} />
              Ver página do anúncio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
