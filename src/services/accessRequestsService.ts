import { supabase } from "../lib/supabase";
import type { AccessRequest } from "../types";

// ─── Submeter solicitação (cadastro com senha) ───────────────────────────────

export async function submitAccessRequest(data: {
  full_name: string;
  email: string;
  whatsapp: string;
  block: string;
  apartment: string;
  message?: string;
  password: string;
}): Promise<void> {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? "";
  const res = await fetch(`${supabaseUrl}/functions/v1/register-resident`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      full_name: data.full_name,
      email: data.email,
      whatsapp: data.whatsapp,
      block: data.block,
      apartment: data.apartment,
      message: data.message ?? null,
      password: data.password
    })
  });

  if (!res.ok) {
    const body: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ao enviar solicitacao (${res.status})`);
  }
}

// ─── Admin: listar todas as solicitações ─────────────────────────────────────

export async function fetchAccessRequests(): Promise<AccessRequest[]> {
  const { data, error } = await supabase
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as AccessRequest[];
}

// ─── Admin: rejeitar solicitação (via Edge Function) ────────────────────────

export async function rejectAccessRequest(
  id: string,
  accessToken: string,
  reason?: string
): Promise<void> {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? "";
  const res = await fetch(`${supabaseUrl}/functions/v1/reject-resident`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ requestId: id, reason })
  });

  if (!res.ok) {
    const body: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(
      body.error ?? `Erro ao rejeitar solicitação (${res.status})`
    );
  }
}

// ─── Admin: aprovar solicitação (via Edge Function) ───────────────────────────
// Novo fluxo: aprova profile/access_request quando auth_user_id existir.
// Fluxo legado: fallback com convite para requests antigas sem auth_user_id.

export async function approveAccessRequest(
  id: string,
  accessToken: string
): Promise<void> {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? "";
  const res = await fetch(`${supabaseUrl}/functions/v1/invite-resident`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ requestId: id })
  });

  if (!res.ok) {
    const body: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(
      body.error ?? `Erro ao aprovar solicitação (${res.status})`
    );
  }
}
