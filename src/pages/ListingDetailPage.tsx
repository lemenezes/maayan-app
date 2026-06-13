import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MessageCircle, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { fetchListingById } from "../services/listingsService";
import ListingGallery from "../components/ListingGallery";
import { CATEGORIES } from "../types";
import type { Listing } from "../types";
import { buildWhatsAppUrl } from "../utils/whatsapp";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function formatPrice(listing: Listing) {
  if (listing.price === undefined) return null;
  return listing.category === "servicos"
    ? `${priceFormatter.format(listing.price)}/h`
    : priceFormatter.format(listing.price);
}

function SkeletonDetail() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
      <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-2xl mb-6" />
      <div className="flex flex-col gap-3">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-7 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-4/6 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-14 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl mt-4" />
      </div>
    </div>
  );
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchListingById(id)
      .then(data => {
        if (!data || data.status === "inactive") {
          setNotFound(true);
        } else {
          setListing(data);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetail />;

  if (notFound || !listing) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Loader2 size={24} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          Anúncio não encontrado
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">
          Este anúncio pode ter sido removido ou está inativo.
        </p>
        <Link
          to="/anuncios"
          className="inline-flex items-center gap-2 text-[#0C5A86] hover:text-[#0C5A86] font-medium text-sm">
          <ArrowLeft size={15} />
          Ver todos os anúncios
        </Link>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.value === listing.category)!;
  const whatsappLink = buildWhatsAppUrl(listing);
  const price = formatPrice(listing);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Back */}
      <Link
        to="/anuncios"
        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium mb-6 transition-colors">
        <ArrowLeft size={15} />
        Voltar aos anúncios
      </Link>

      {/* Gallery */}
      <div className="rounded-2xl overflow-hidden mb-6 shadow-sm">
        <ListingGallery
          images={listing.images}
          title={listing.title}
          rounded="page"
          overlay={
            <span
              className={`absolute top-4 left-4 text-sm font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm ${category.badgeClass}`}>
              {category.icon} {category.label}
            </span>
          }
        />
      </div>

      {/* Content card */}
      <div className="bg-white/80 backdrop-blur-md dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100/60 dark:border-slate-700/40 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-3">
          {listing.title}
        </h1>

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
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 text-sm font-medium">
            <Calendar size={14} />
            Publicado em {formatDate(listing.createdAt)}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-semibold py-4 rounded-2xl text-base transition-all shadow-sm">
          <MessageCircle size={20} />
          Entrar em contato via WhatsApp
        </a>
      </div>
    </div>
  );
}
