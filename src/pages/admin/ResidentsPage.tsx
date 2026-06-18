import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Clock,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Pencil,
  Save,
  Trash2
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  fetchAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  suspendResident,
  reactivateResident,
  updateResidentProfile,
  deleteTestResident,
  type ResidentEditableFields
} from "../../services/accessRequestsService";
import type { AccessRequest, RequestStatus } from "../../types";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext.tsx";

const STATUS_LABELS: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pendente",
    className:
      "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-400"
  },
  approved: {
    label: "Aprovado",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
  },
  rejected: {
    label: "Rejeitado",
    className:
      "bg-red-100    text-red-600    dark:bg-red-900/40    dark:text-red-400"
  },
  suspended: {
    label: "Suspenso",
    className:
      "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
  },
  inconsistent: {
    label: "Cadastro inconsistente",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
  }
};

const FILTER_OPTIONS: { value: RequestStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovadas" },
  { value: "rejected", label: "Rejeitadas" },
  { value: "suspended", label: "Suspensas" },
  { value: "inconsistent", label: "Inconsistentes" }
];

const MOBILE_STATUS_CARD_TONES: Record<RequestStatus, string> = {
  pending:
    "border-amber-200/80 bg-amber-50/70 dark:border-amber-800/50 dark:bg-amber-950/20",
  approved:
    "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-800/50 dark:bg-emerald-950/20",
  rejected:
    "border-red-200/80 bg-red-50/70 dark:border-red-800/50 dark:bg-red-950/20",
  suspended:
    "border-slate-300/80 bg-slate-100/70 dark:border-slate-700/70 dark:bg-slate-800/60",
  inconsistent:
    "border-orange-200/80 bg-orange-50/70 dark:border-orange-800/50 dark:bg-orange-950/20"
};

const DESKTOP_STATUS_CARD_TONES: Partial<
  Record<RequestStatus, { active: string; inactive: string }>
> = {
  rejected: {
    active:
      "border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/30",
    inactive:
      "border-transparent bg-red-50/70 dark:bg-red-950/15 hover:border-red-200 dark:hover:border-red-800/40"
  },
  inconsistent: {
    active:
      "border-orange-200 bg-orange-50 dark:border-orange-800/50 dark:bg-orange-950/30",
    inactive:
      "border-transparent bg-orange-50/70 dark:bg-orange-950/15 hover:border-orange-200 dark:hover:border-orange-800/40"
  }
};

function sanitizeWhatsAppInput(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";

  const withoutCountryCode =
    digitsOnly.length > 11 && digitsOnly.startsWith("55")
      ? digitsOnly.slice(2)
      : digitsOnly;

  return withoutCountryCode.slice(0, 11);
}

function getOperationalStatus(req: AccessRequest): RequestStatus {
  return req.operational_status ?? req.status;
}

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
    .split(" ")
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0C5A86]/20 to-[#1DAFD9]/20 dark:from-[#0C5A86]/30 dark:to-[#1DAFD9]/30 border border-[#0C5A86]/20 dark:border-sky-400/20 flex items-center justify-center flex-shrink-0">
      <span className="text-[#0C5A86] dark:text-sky-400 text-xs font-bold">
        {initials}
      </span>
    </div>
  );
}

export default function ResidentsPage() {
  const [searchParams] = useSearchParams();
  const { session, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  // id da solicitação com o painel de rejeição aberto → string | null
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ResidentEditableFields | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const load = useCallback(async () => {
    if (!session?.access_token) {
      setRequests([]);
      setLoadError("Sessão indisponível. Faça login novamente.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAccessRequests(session.access_token);
      setRequests(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao carregar solicitações";
      setLoadError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, showToast]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!session?.access_token) {
      setLoading(false);
      setRequests([]);
      setLoadError("Sessão indisponível. Faça login novamente.");
      return;
    }

    void load();
  }, [authLoading, session?.access_token, load]);

  const filtered =
    filter === "all"
      ? requests
      : requests.filter(r => getOperationalStatus(r) === filter);
  const targetRequestId = searchParams.get("requestId");
  const pending = requests.filter(
    r => getOperationalStatus(r) === "pending"
  ).length;
  const counts = requests.reduce<Record<string, number>>((acc, r) => {
    const operationalStatus = getOperationalStatus(r);
    acc[operationalStatus] = (acc[operationalStatus] ?? 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    if (!targetRequestId) return;
    setFilter("all");
  }, [targetRequestId]);

  useEffect(() => {
    if (!targetRequestId || loading) return;
    const exists = requests.some(r => r.id === targetRequestId);
    if (!exists) return;

    setHighlightedId(targetRequestId);
    setPulsingId(targetRequestId);
    const element = document.getElementById(
      `access-request-${targetRequestId}`
    );
    element?.scrollIntoView({ behavior: "smooth", block: "center" });

    const pulseTimer = window.setTimeout(
      () =>
        setPulsingId(current => (current === targetRequestId ? null : current)),
      3000
    );

    const highlightTimer = window.setTimeout(
      () =>
        setHighlightedId(current =>
          current === targetRequestId ? null : current
        ),
      5500
    );

    return () => {
      window.clearTimeout(pulseTimer);
      window.clearTimeout(highlightTimer);
    };
  }, [targetRequestId, loading, requests]);

  const approve = async (req: AccessRequest) => {
    if (!session?.access_token) {
      showToast("Sessão expirada — faça login novamente", "error");
      return;
    }
    setBusy(s => new Set(s).add(req.id));
    try {
      await approveAccessRequest(req.id, session.access_token);
      setRequests(prev =>
        prev.map(r =>
          r.id === req.id
            ? { ...r, status: "approved", operational_status: "approved" }
            : r
        )
      );
      showToast(`Acesso liberado para ${req.email}`, "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao aprovar",
        "error"
      );
    } finally {
      setBusy(s => {
        const n = new Set(s);
        n.delete(req.id);
        return n;
      });
    }
  };

  const openReject = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectReason("");
  };

  const openEdit = (req: AccessRequest) => {
    setEditingId(req.id);
    setEditForm({
      full_name: req.full_name,
      email: req.email,
      whatsapp: req.whatsapp ?? "",
      block: req.block,
      apartment: req.apartment
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteConfirmText("");
  };

  const cancelDelete = () => {
    setDeletingId(null);
    setDeleteConfirmText("");
  };

  const confirmDelete = async (req: AccessRequest) => {
    if (!session?.access_token) {
      showToast("Sessão expirada — faça login novamente", "error");
      return;
    }

    setBusy(s => new Set(s).add(req.id));

    try {
      const result = await deleteTestResident(
        req.id,
        deleteConfirmText,
        session.access_token
      );
      setRequests(prev => prev.filter(r => r.id !== req.id));

      if (result.emailSent) {
        showToast("Cadastro removido e e-mail enviado", "success");
      } else {
        showToast(
          result.warning ??
            "Cadastro removido, mas e-mail ao morador/admin não foi enviado.",
          "error"
        );
      }

      cancelDelete();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao excluir registro",
        "error"
      );
    } finally {
      setBusy(s => {
        const n = new Set(s);
        n.delete(req.id);
        return n;
      });
    }
  };

  const saveEdit = async (req: AccessRequest) => {
    if (!session?.access_token) {
      showToast("Sessão expirada — faça login novamente", "error");
      return;
    }

    if (!editForm) return;

    const normalized: ResidentEditableFields = {
      full_name: editForm.full_name.trim(),
      email: editForm.email.trim().toLowerCase(),
      whatsapp: sanitizeWhatsAppInput(editForm.whatsapp),
      block: editForm.block.trim().toUpperCase(),
      apartment: editForm.apartment.replace(/\D/g, "").slice(0, 4)
    };

    if (
      !normalized.full_name ||
      !normalized.email ||
      !normalized.whatsapp ||
      !normalized.block ||
      !normalized.apartment
    ) {
      showToast("Preencha todos os campos para salvar", "error");
      return;
    }

    setBusy(s => new Set(s).add(req.id));
    try {
      await updateResidentProfile(req.id, normalized, session.access_token);
      setRequests(prev =>
        prev.map(r =>
          r.id === req.id
            ? {
                ...r,
                ...normalized
              }
            : r
        )
      );
      showToast("Dados do morador atualizados", "success");
      cancelEdit();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao salvar dados",
        "error"
      );
    } finally {
      setBusy(s => {
        const n = new Set(s);
        n.delete(req.id);
        return n;
      });
    }
  };

  const handleSuspend = async (req: AccessRequest) => {
    if (!session?.access_token) {
      showToast("Sessão expirada — faça login novamente", "error");
      return;
    }

    setBusy(s => new Set(s).add(req.id));
    try {
      await suspendResident(req.id, session.access_token);
      setRequests(prev =>
        prev.map(r =>
          r.id === req.id ? { ...r, operational_status: "suspended" } : r
        )
      );
      showToast(`Morador ${req.full_name} suspenso`, "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao suspender morador",
        "error"
      );
    } finally {
      setBusy(s => {
        const n = new Set(s);
        n.delete(req.id);
        return n;
      });
    }
  };

  const handleReactivate = async (req: AccessRequest) => {
    if (!session?.access_token) {
      showToast("Sessão expirada — faça login novamente", "error");
      return;
    }

    setBusy(s => new Set(s).add(req.id));
    try {
      await reactivateResident(req.id, session.access_token);
      setRequests(prev =>
        prev.map(r =>
          r.id === req.id ? { ...r, operational_status: "approved" } : r
        )
      );
      showToast(`Morador ${req.full_name} reativado`, "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao reativar morador",
        "error"
      );
    } finally {
      setBusy(s => {
        const n = new Set(s);
        n.delete(req.id);
        return n;
      });
    }
  };

  const confirmReject = async (req: AccessRequest) => {
    if (!session?.access_token) {
      showToast("Sessão expirada — faça login novamente", "error");
      return;
    }
    setBusy(s => new Set(s).add(req.id));
    setRejectingId(null);
    try {
      const result = await rejectAccessRequest(
        req.id,
        session.access_token,
        rejectReason || undefined
      );
      setRequests(prev =>
        prev.map(r =>
          r.id === req.id
            ? {
                ...r,
                status: "rejected",
                operational_status: "rejected",
                rejection_reason: rejectReason || null
              }
            : r
        )
      );
      if (result.emailSent) {
        showToast(
          "Solicitação rejeitada — e-mail enviado ao solicitante",
          "success"
        );
      } else {
        showToast(
          result.warning ??
            "Solicitação rejeitada, mas o e-mail ao solicitante não foi enviado.",
          "error"
        );
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao rejeitar",
        "error"
      );
    } finally {
      setBusy(s => {
        const n = new Set(s);
        n.delete(req.id);
        return n;
      });
      setRejectReason("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Moradores
          </h1>
          {pending > 0 ? (
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400">
                {pending} pendente{pending !== 1 && "s"}
              </span>
            </p>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">
              Solicitações de acesso
            </p>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading || authLoading || !session?.access_token}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Summary chips (mobile) */}
      <div className="md:hidden grid grid-cols-3 gap-2 mb-4">
        {(
          [
            "pending",
            "approved",
            "rejected",
            "suspended",
            "inconsistent"
          ] as const
        ).map(s => {
          const conf = STATUS_LABELS[s];
          const mobileLabel =
            s === "inconsistent" ? "Inconsistente" : conf.label;

          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl px-2.5 py-2 text-left border transition-all ${
                filter === s
                  ? "border-[#1DAFD9] bg-sky-50 dark:bg-sky-950/40"
                  : MOBILE_STATUS_CARD_TONES[s]
              }`}>
              <span
                className={`inline-flex max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded-full mb-1 ${conf.className}`}>
                {mobileLabel}
              </span>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight mt-0.5">
                {counts[s] ?? 0}
              </p>
            </button>
          );
        })}
      </div>

      {/* Summary cards (desktop) */}
      <div className="hidden md:grid md:grid-cols-5 gap-3 mb-6">
        {(
          [
            "pending",
            "approved",
            "rejected",
            "suspended",
            "inconsistent"
          ] as const
        ).map(s => {
          const conf = STATUS_LABELS[s];
          const desktopTone = DESKTOP_STATUS_CARD_TONES[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-2xl p-4 text-left border-2 transition-all ${
                filter === s
                  ? (desktopTone?.active ??
                    "border-[#1DAFD9] bg-sky-50 dark:bg-sky-950/40")
                  : (desktopTone?.inactive ??
                    "border-transparent bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700")
              }`}>
              <div
                className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${conf.className}`}>
                {conf.label}
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {counts[s] ?? 0}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-4">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === value
                ? "bg-[#0C5A86] text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}>
            {label}
            {value !== "all" && counts[value] ? ` (${counts[value]})` : ""}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#EEF2F7] dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-slate-700 dark:text-slate-200 text-sm font-medium">
              Não foi possível carregar os residentes.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-md">
              {loadError}
            </p>
            <button
              onClick={load}
              disabled={authLoading || !session?.access_token}
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-4">
            <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Nenhuma solicitação{" "}
              {filter !== "all"
                ? STATUS_LABELS[filter as RequestStatus]?.label.toLowerCase()
                : ""}
            </p>
          </div>
        ) : (
          filtered.map(req => {
            const isBusy = busy.has(req.id);
            const operationalStatus = getOperationalStatus(req);
            const hasProfile = req.has_profile === true;
            const { label, className } = STATUS_LABELS[operationalStatus];
            return (
              <div
                id={`access-request-${req.id}`}
                key={req.id}
                className={`flex items-start gap-4 p-5 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-all duration-300 ${
                  highlightedId === req.id
                    ? `bg-sky-100/80 dark:bg-sky-900/35 ring-2 ring-sky-500/80 dark:ring-sky-400/80 ring-inset ${
                        pulsingId === req.id ? "animate-pulse" : ""
                      }`
                    : ""
                }`}>
                <InitialAvatar name={req.full_name} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                        {req.full_name}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                        {req.email}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                        Bloco {req.block} · Apto {req.apartment}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${className}`}>
                      {label}
                    </span>
                  </div>

                  {req.message && (
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 italic bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                      "{req.message}"
                    </p>
                  )}

                  {operationalStatus === "rejected" && req.rejection_reason && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                      <strong>Motivo:</strong> {req.rejection_reason}
                    </p>
                  )}

                  <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-2">
                    {new Date(req.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>

                  {operationalStatus === "pending" && (
                    <div className="mt-3 space-y-2">
                      {rejectingId === req.id ? (
                        /* ── Painel de motivo de rejeição ── */
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 space-y-2">
                          <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                            Motivo da rejeição{" "}
                            <span className="font-normal">
                              (opcional — será enviado por e-mail)
                            </span>
                          </p>
                          <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Ex: apartamento não confirmado no cadastro do condomínio..."
                            rows={2}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-red-400 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmReject(req)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                              {isBusy ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              Confirmar rejeição
                            </button>
                            <button
                              onClick={cancelReject}
                              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => approve(req)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-50 transition-colors">
                            {isBusy ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            Aprovar e convidar
                          </button>
                          <button
                            onClick={() => openReject(req.id)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 transition-colors">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {(operationalStatus === "approved" ||
                    operationalStatus === "suspended") && (
                    <div className="mt-3 space-y-2">
                      {!hasProfile && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                          Perfil do morador não encontrado. Para moderar status,
                          aprove novamente ou atualize o vínculo deste cadastro.
                        </p>
                      )}
                      {editingId === req.id && editForm ? (
                        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-3">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Editar dados do morador
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              value={editForm.full_name}
                              onChange={e =>
                                setEditForm(prev =>
                                  prev
                                    ? { ...prev, full_name: e.target.value }
                                    : prev
                                )
                              }
                              placeholder="Nome completo"
                              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-[#1DAFD9]"
                            />
                            <input
                              value={editForm.email}
                              onChange={e =>
                                setEditForm(prev =>
                                  prev
                                    ? { ...prev, email: e.target.value }
                                    : prev
                                )
                              }
                              placeholder="E-mail"
                              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-[#1DAFD9]"
                            />
                            <input
                              value={editForm.whatsapp}
                              onChange={e =>
                                setEditForm(prev =>
                                  prev
                                    ? {
                                        ...prev,
                                        whatsapp: sanitizeWhatsAppInput(
                                          e.target.value
                                        )
                                      }
                                    : prev
                                )
                              }
                              placeholder="WhatsApp"
                              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-[#1DAFD9]"
                            />
                            <input
                              value={editForm.block}
                              onChange={e =>
                                setEditForm(prev =>
                                  prev
                                    ? {
                                        ...prev,
                                        block: e.target.value
                                          .toUpperCase()
                                          .slice(0, 2)
                                      }
                                    : prev
                                )
                              }
                              placeholder="Bloco"
                              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-[#1DAFD9]"
                            />
                            <input
                              value={editForm.apartment}
                              onChange={e =>
                                setEditForm(prev =>
                                  prev
                                    ? {
                                        ...prev,
                                        apartment: e.target.value
                                          .replace(/\D/g, "")
                                          .slice(0, 4)
                                      }
                                    : prev
                                )
                              }
                              placeholder="Apartamento"
                              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-[#1DAFD9]"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => saveEdit(req)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0C5A86] text-white hover:bg-[#09476B] disabled:opacity-50 transition-colors">
                              {isBusy ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              Salvar
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openEdit(req)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </button>

                          {hasProfile && operationalStatus === "approved" ? (
                            <button
                              onClick={() => handleSuspend(req)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 disabled:opacity-50 transition-colors">
                              {isBusy ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <PauseCircle className="w-3.5 h-3.5" />
                              )}
                              Suspender
                            </button>
                          ) : hasProfile ? (
                            <button
                              onClick={() => handleReactivate(req)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-50 transition-colors">
                              {isBusy ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <PlayCircle className="w-3.5 h-3.5" />
                              )}
                              Reativar
                            </button>
                          ) : null}

                          {operationalStatus !== "approved" && (
                            <button
                              onClick={() => openDelete(req.id)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/25 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 disabled:opacity-50 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                              Excluir cadastro
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {operationalStatus === "inconsistent" && (
                    <div className="mt-3">
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 leading-relaxed">
                        Este cadastro está incompleto (aprovado sem perfil
                        vinculado). Deve ser removido como limpeza de dados
                        órfãos.
                      </p>
                    </div>
                  )}

                  {operationalStatus !== "approved" && (
                    <div className="mt-3">
                      {deletingId === req.id && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3 space-y-2">
                          <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                            Excluir
                          </p>
                          <p className="text-[11px] text-rose-700/90 dark:text-rose-300/90 leading-relaxed">
                            Para confirmar, digite a frase{" "}
                            <span className="font-mono font-semibold">
                              excluir cadastro
                            </span>
                            .
                          </p>
                          <input
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                            placeholder="Digite a frase de confirmação"
                            className="w-full text-xs px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-rose-400"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => confirmDelete(req)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors">
                              {isBusy ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Remover cadastro
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              Cancelar
                            </button>
                          </div>
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
