import { useEffect, useState } from 'react';
import { X, MessageCircle, MapPin, Calendar, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [activeImg, setActiveImg] = useState(0);
  const hasMultiple = listing.images.length > 1;

  const prevImg = () => setActiveImg((i) => (i - 1 + listing.images.length) % listing.images.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % listing.images.length);

  useEffect(() => {
    setActiveImg(0);
  }, [listing.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasMultiple) prevImg();
      if (e.key === 'ArrowRight' && hasMultiple) nextImg();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, hasMultiple]);

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={listing.title}
      onClick={onClose}
    >
      {/* Sheet/Dialog */}
      <div
        className="bg-white dark:bg-slate-800 w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gallery */}
        <div className="aspect-video relative bg-slate-100 dark:bg-slate-700 sm:rounded-t-3xl rounded-t-3xl overflow-hidden">
          {listing.images.length > 0 ? (
            <>
              <img
                key={activeImg}
                src={listing.images[activeImg]}
                alt={`${listing.title} ${activeImg + 1}`}
                className="w-full h-full object-cover animate-fade-in"
              />
              {hasMultiple && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImg(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImg(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight size={18} />
                  </button>
                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {listing.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? 'bg-white w-4' : 'bg-white/50'}`}
                        aria-label={`Foto ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
              <ImageOff className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              <span className="text-sm text-slate-300 dark:text-slate-600">Sem imagem</span>
            </div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-sm"
            aria-label="Fechar"
          >
            <X size={18} className="text-slate-700 dark:text-slate-200" />
          </button>

          {/* Category */}
          <span
            className={`absolute top-4 left-4 text-sm font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${category.badgeClass}`}
          >
            {category.icon} {category.label}
          </span>
        </div>

        {/* Thumbnail strip */}
        {hasMultiple && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none bg-slate-50 dark:bg-slate-900/40">
            {listing.images.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeImg
                    ? 'border-sky-400 opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-75'
                }`}
              >
                <img src={url} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-3">
            {listing.title}
          </h2>

          {listing.price !== undefined && (
            <p className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-5 tabular-nums">
              {formatPrice(listing.price)}
            </p>
          )}

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{listing.description}</p>

          <div className="border-t border-slate-100 dark:border-slate-700 mb-6" />

          {/* Author Info */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-purple-100 dark:from-sky-900/60 dark:to-purple-900/60 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                  {listing.authorName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{listing.authorName}</p>
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
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-semibold py-4 rounded-2xl text-base transition-all shadow-sm"
          >
            <MessageCircle size={20} />
            Entrar em contato via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
