import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Pencil, Trash2, EyeOff, Eye, ImageOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchUserListings, deleteListing, deactivateListing, reactivateListing } from '../services/listingsService';
import { CATEGORIES } from '../types';
import type { Listing } from '../types';

function SkeletonRow() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100/60 dark:border-slate-700/40 overflow-hidden p-4 flex gap-4 animate-pulse">
      <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1 flex flex-col gap-2 py-1">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
      </div>
    </div>
  );
}

const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatPrice(listing: Listing) {
  if (listing.price === undefined) return null;
  return listing.category === 'servicos'
    ? `${priceFormatter.format(listing.price)}/h`
    : priceFormatter.format(listing.price);
}

/* ── Confirmation dialog ── */
interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed pt-1.5">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── My Listing Card ── */
interface MyListingCardProps {
  listing: Listing;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, current: 'active' | 'inactive') => void;
}
function MyListingCard({ listing, onDelete, onToggleStatus }: MyListingCardProps) {
  const category = CATEGORIES.find((c) => c.value === listing.category)!;
  const isActive = (listing as Listing & { status?: string }).status !== 'inactive';
  const price = formatPrice(listing);

  return (
    <article className={`bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden transition-all ${
      isActive
        ? 'border-slate-100/60 dark:border-slate-700/40 shadow-sm'
        : 'border-slate-200 dark:border-slate-700 opacity-60'
    }`}>
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
          {listing.images[0] ? (
            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff size={20} className="text-slate-300 dark:text-slate-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${category.badgeClass}`}>
              {category.icon} {category.label}
            </span>
            {!isActive && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                Inativo
              </span>
            )}
          </div>

          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2 mb-1">
            {listing.title}
          </h3>

          {price && (
            <p className="text-sky-600 dark:text-sky-400 font-bold text-sm mb-1">{price}</p>
          )}

          <p className="text-slate-400 dark:text-slate-500 text-xs">
            {formatDate(listing.createdAt)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 dark:border-slate-700/60 px-4 py-3 flex items-center gap-2">
        <Link
          to={`/editar/${listing.id}`}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 px-3 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors"
        >
          <Pencil size={13} />
          Editar
        </Link>

        <button
          onClick={() => onToggleStatus(listing.id, isActive ? 'active' : 'inactive')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            isActive
              ? 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
          }`}
        >
          {isActive ? <EyeOff size={13} /> : <Eye size={13} />}
          {isActive ? 'Desativar' : 'Reativar'}
        </button>

        <button
          onClick={() => onDelete(listing.id)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ml-auto"
        >
          <Trash2 size={13} />
          Excluir
        </button>
      </div>
    </article>
  );
}

/* ── Page ── */
export default function MyListingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [listings, setListings] = useState<(Listing & { status: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchUserListings(user.id);
      setListings(data as (Listing & { status: string })[]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao carregar anúncios', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      showToast('Anúncio excluído com sucesso');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao excluir', 'error');
    }
  };

  const handleToggleStatus = async (id: string, current: 'active' | 'inactive') => {
    try {
      if (current === 'active') {
        await deactivateListing(id);
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: 'inactive' } : l)),
        );
        showToast('Anúncio desativado');
      } else {
        await reactivateListing(id);
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: 'active' } : l)),
        );
        showToast('Anúncio reativado');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar status', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Meus anúncios</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            {!loading && `${listings.length} anúncio${listings.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          to="/publicar"
          className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-purple-600 text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          <PlusCircle size={15} />
          Publicar
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && listings.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageOff size={28} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Nenhum anúncio ainda
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">
            Publique seu primeiro anúncio para os vizinhos verem.
          </p>
          <Link
            to="/publicar"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <PlusCircle size={16} />
            Publicar anúncio
          </Link>
        </div>
      )}

      {/* Listing list */}
      {!loading && listings.length > 0 && (
        <div className="flex flex-col gap-4">
          {listings.map((listing) => (
            <MyListingCard
              key={listing.id}
              listing={listing}
              onDelete={(id) => setConfirmDeleteId(id)}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDeleteId && (
        <ConfirmDialog
          message="Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita."
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
