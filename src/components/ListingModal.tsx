import { useEffect } from 'react';
import { X, MessageCircle, MapPin, Calendar, ImageOff } from 'lucide-react';
import { CATEGORIES } from '../types';
import type { Listing } from '../types';

interface ListingModalProps {
  listing: Listing;
  onClose: () => void;
}

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function ListingModal({ listing, onClose }: ListingModalProps) {
  const category = CATEGORIES.find((c) => c.value === listing.category)!;
  const whatsappLink = `https://wa.me/55${listing.whatsapp.replace(/\D/g, '')}`;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const formatPrice = (price: number) =>
    listing.category === 'servicos'
      ? `${priceFormatter.format(price)}/h`
      : priceFormatter.format(price);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={listing.title}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="aspect-video relative bg-slate-100 sm:rounded-t-3xl rounded-t-3xl overflow-hidden">
          {listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200">
              <ImageOff className="w-12 h-12 text-slate-300" />
              <span className="text-sm text-slate-300">Sem imagem</span>
            </div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            aria-label="Fechar"
          >
            <X size={18} className="text-slate-700" />
          </button>

          {/* Category */}
          <span
            className={`absolute top-4 left-4 text-sm font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${category.badgeClass}`}
          >
            {category.icon} {category.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-3">
            {listing.title}
          </h2>

          {listing.price !== undefined && (
            <p className="text-3xl font-bold text-sky-600 mb-5 tabular-nums">
              {formatPrice(listing.price)}
            </p>
          )}

          <p className="text-slate-600 leading-relaxed mb-6">{listing.description}</p>

          <div className="border-t border-slate-100 mb-6" />

          {/* Author Info */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-sky-600">
                  {listing.authorName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{listing.authorName}</p>
                {listing.apartment && (
                  <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin size={11} />
                    {listing.apartment} · Condomínio Maayan
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Calendar size={14} />
              Publicado em {formatDate(listing.createdAt)}
            </div>
          </div>

          {/* CTA */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-2xl text-base transition-colors shadow-sm"
          >
            <MessageCircle size={20} />
            Entrar em contato via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
