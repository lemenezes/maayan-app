import { MessageCircle, ImageOff } from 'lucide-react';
import { CATEGORIES } from '../types';
import type { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
}

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function ListingCard({ listing, onSelect }: ListingCardProps) {
  const category = CATEGORIES.find((c) => c.value === listing.category)!;
  const whatsappLink = `https://wa.me/55${listing.whatsapp.replace(/\D/g, '')}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  const formatPrice = (price: number) =>
    listing.category === 'servicos'
      ? `${priceFormatter.format(price)}/h`
      : priceFormatter.format(price);

  return (
    <article
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group border border-slate-100/60"
      onClick={() => onSelect(listing)}
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
        {listing.images[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 gap-2">
            <ImageOff className="w-10 h-10 text-slate-300" />
            <span className="text-xs text-slate-300">Sem imagem</span>
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${category.badgeClass}`}
        >
          {category.icon} {category.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-1.5">
          {listing.title}
        </h3>
        <p className="text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed">
          {listing.description}
        </p>

        {listing.price !== undefined && (
          <p className="text-sky-600 font-bold text-lg mb-3 tabular-nums">
            {formatPrice(listing.price)}
          </p>
        )}

        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-slate-700 text-xs font-medium leading-tight truncate">
              {listing.authorName}
            </p>
            {listing.apartment && (
              <p className="text-slate-400 text-xs truncate">{listing.apartment}</p>
            )}
            <p className="text-slate-300 text-xs mt-0.5">{formatDate(listing.createdAt)}</p>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shadow-sm flex-shrink-0"
          >
            <MessageCircle size={13} />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
