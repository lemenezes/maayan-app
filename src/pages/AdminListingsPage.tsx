import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, EyeOff, Trash2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import {
  fetchAllListingsAdmin,
  setListingStatus,
  deleteListing,
} from '../services/listingsService';
import type { Listing } from '../types';
import type { ListingStatus } from '../lib/database.types.ts';
import { CATEGORIES } from '../types';
import { useToast } from '../context/ToastContext';

type AdminListing = Listing & { status: string; userId: string };

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Pendente',  className: 'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-400'  },
  active:   { label: 'Ativo',     className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  inactive: { label: 'Inativo',   className: 'bg-slate-100  text-slate-500  dark:bg-slate-800     dark:text-slate-400'  },
  rejected: { label: 'Rejeitado', className: 'bg-red-100    text-red-600    dark:bg-red-900/40    dark:text-red-400'    },
};

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all',      label: 'Todos'     },
  { value: 'pending',  label: 'Pendentes' },
  { value: 'active',   label: 'Ativos'    },
  { value: 'inactive', label: 'Inativos'  },
  { value: 'rejected', label: 'Rejeitados'},
];

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
      <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
    </div>
  );
}

export default function AdminListingsPage() {
  const { showToast } = useToast();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllListingsAdmin();
      setListings(data);
    } catch {
      showToast('Erro ao carregar anúncios', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: ListingStatus) => {
    setBusy((s) => new Set(s).add(id));
    try {
      await setListingStatus(id, status);
      setListings((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
      const labels: Record<string, string> = {
        active: 'Anúncio aprovado', inactive: 'Anúncio desativado', rejected: 'Anúncio rejeitado',
      };
      showToast(labels[status] ?? 'Status atualizado', 'success');
    } catch {
      showToast('Erro ao atualizar status', 'error');
    } finally {
      setBusy((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  };

  const handleDelete = async (id: string) => {
    setBusy((s) => new Set(s).add(id));
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      showToast('Anúncio excluído', 'success');
    } catch {
      showToast('Erro ao excluir anúncio', 'error');
    } finally {
      setBusy((s) => { const n = new Set(s); n.delete(id); return n; });
      setConfirmDelete(null);
    }
  };

  const filtered = filter === 'all' ? listings : listings.filter((l) => l.status === filter);

  const counts = listings.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Moderação</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">
            {listings.length} anúncio{listings.length !== 1 ? 's' : ''} no total
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(['pending', 'active', 'inactive', 'rejected'] as const).map((s) => {
          const conf = STATUS_LABELS[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-2xl p-4 text-left border-2 transition-all ${
                filter === s
                  ? 'border-[#1DAFD9] bg-sky-50 dark:bg-sky-950/40'
                  : 'border-transparent bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <div className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${conf.className}`}>
                {conf.label}
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {counts[s] ?? 0}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {FILTER_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setFilter(o.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === o.value
                ? 'bg-[#0C5A86] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {o.label}{o.value !== 'all' && counts[o.value] ? ` (${counts[o.value]})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <AlertCircle size={32} className="text-slate-300 dark:text-slate-600" />
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              Nenhum anúncio {filter !== 'all' ? `com status "${STATUS_LABELS[filter]?.label.toLowerCase()}"` : ''}
            </p>
          </div>
        ) : (
          filtered.map((listing) => {
            const cat = CATEGORIES.find((c) => c.value === listing.category);
            const statusConf = STATUS_LABELS[listing.status] ?? STATUS_LABELS.inactive;
            const isBusy = busy.has(listing.id);

            return (
              <div
                key={listing.id}
                className="flex items-start gap-3 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                  {listing.images[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-xl">
                      {cat?.icon ?? '📦'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight truncate">
                      {listing.title}
                    </p>
                    <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusConf.className}`}>
                      {statusConf.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {cat?.label} · {listing.authorName}
                    {listing.apartment ? ` · Ap ${listing.apartment}` : ''}
                  </p>
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-0.5">
                    {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isBusy ? (
                    <Loader2 size={18} className="animate-spin text-[#0C5A86]" />
                  ) : (
                    <>
                      {listing.status !== 'active' && (
                        <button
                          onClick={() => setStatus(listing.id, 'active')}
                          title="Aprovar"
                          className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {listing.status !== 'rejected' && (
                        <button
                          onClick={() => setStatus(listing.id, 'rejected')}
                          title="Rejeitar"
                          className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                      {listing.status === 'active' && (
                        <button
                          onClick={() => setStatus(listing.id, 'inactive')}
                          title="Desativar"
                          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <EyeOff size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(listing.id)}
                        title="Excluir"
                        className="p-2 rounded-xl text-slate-300 dark:text-slate-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Excluir anúncio?</h2>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">
              Esta ação é permanente e não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
