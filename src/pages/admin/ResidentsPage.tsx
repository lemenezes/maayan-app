import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Loader2, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { fetchAccessRequests, approveAccessRequest, rejectAccessRequest } from '../../services/accessRequestsService';
import type { AccessRequest, RequestStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const STATUS_LABELS: Record<RequestStatus, { label: string; className: string }> = {
  pending:  { label: 'Pendente',  className: 'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-400'  },
  approved: { label: 'Aprovado',  className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  rejected: { label: 'Rejeitado', className: 'bg-red-100    text-red-600    dark:bg-red-900/40    dark:text-red-400'    },
};

const FILTER_OPTIONS: { value: RequestStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'Todas'     },
  { value: 'pending',  label: 'Pendentes' },
  { value: 'approved', label: 'Aprovadas' },
  { value: 'rejected', label: 'Rejeitadas' },
];

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-start gap-4 p-5 border-b border-slate-100 dark:border-slate-800">
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0C5A86]/20 to-[#1DAFD9]/20 dark:from-[#0C5A86]/30 dark:to-[#1DAFD9]/30 border border-[#0C5A86]/20 dark:border-sky-400/20 flex items-center justify-center flex-shrink-0">
      <span className="text-[#0C5A86] dark:text-sky-400 text-xs font-bold">{initials}</span>
    </div>
  );
}

export default function ResidentsPage() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('pending');
  const [busy, setBusy] = useState<Set<string>>(new Set());
  // id da solicitação com o painel de rejeição aberto → string | null
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAccessRequests();
      setRequests(data);
    } catch {
      showToast('Erro ao carregar solicitações', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);
  const pending = requests.filter((r) => r.status === 'pending').length;

  const approve = async (req: AccessRequest) => {
    if (!session?.access_token) {
      showToast('Sessão expirada — faça login novamente', 'error');
      return;
    }
    setBusy((s) => new Set(s).add(req.id));
    try {
      await approveAccessRequest(req.id, session.access_token);
      setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: 'approved' } : r));
      showToast(`Convite enviado para ${req.email}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao aprovar', 'error');
    } finally {
      setBusy((s) => { const n = new Set(s); n.delete(req.id); return n; });
    }
  };

  const openReject = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectReason('');
  };

  const confirmReject = async (req: AccessRequest) => {
    if (!session?.access_token) {
      showToast('Sessão expirada — faça login novamente', 'error');
      return;
    }
    setBusy((s) => new Set(s).add(req.id));
    setRejectingId(null);
    try {
      await rejectAccessRequest(req.id, session.access_token, rejectReason || undefined);
      setRequests((prev) => prev.map((r) =>
        r.id === req.id ? { ...r, status: 'rejected', rejection_reason: rejectReason || null } : r,
      ));
      showToast('Solicitação rejeitada — e-mail enviado ao solicitante', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao rejeitar', 'error');
    } finally {
      setBusy((s) => { const n = new Set(s); n.delete(req.id); return n; });
      setRejectReason('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-slate-800 dark:text-slate-100">
            Solicitações de acesso
          </h1>
          {pending > 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {pending} pendente{pending !== 1 && 's'}
            </p>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
          title="Atualizar"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === value
                ? 'bg-[#0C5A86] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {label}
            {value === 'pending' && pending > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                {pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#EEF2F7] dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-4">
            <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma solicitação {filter !== 'all' ? STATUS_LABELS[filter as RequestStatus]?.label.toLowerCase() : ''}</p>
          </div>
        ) : (
          filtered.map((req) => {
            const isBusy = busy.has(req.id);
            const { label, className } = STATUS_LABELS[req.status];
            return (
              <div key={req.id} className="flex items-start gap-4 p-5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <InitialAvatar name={req.full_name} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                        {req.full_name}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{req.email}</p>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                        Bloco {req.block} · Apto {req.apartment}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${className}`}>
                      {label}
                    </span>
                  </div>

                  {req.message && (
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 italic bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                      "{req.message}"
                    </p>
                  )}

                  {req.status === 'rejected' && req.rejection_reason && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                      <strong>Motivo:</strong> {req.rejection_reason}
                    </p>
                  )}

                  <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-2">
                    {new Date(req.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>

                  {req.status === 'pending' && (
                    <div className="mt-3 space-y-2">
                      {rejectingId === req.id ? (
                        /* ── Painel de motivo de rejeição ── */
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 space-y-2">
                          <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                            Motivo da rejeição <span className="font-normal">(opcional — será enviado por e-mail)</span>
                          </p>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Ex: apartamento não confirmado no cadastro do condomínio..."
                            rows={2}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-red-400 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmReject(req)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                              Confirmar rejeição
                            </button>
                            <button
                              onClick={cancelReject}
                              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approve(req)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-50 transition-colors"
                          >
                            {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Aprovar e convidar
                          </button>
                          <button
                            onClick={() => openReject(req.id)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
