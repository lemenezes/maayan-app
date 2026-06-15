import { supabase } from "../lib/supabase";
import type { AccessRequest } from "../types";

export interface ResidentEditableFields {
  full_name: string;
  email: string;
  whatsapp: string;
  block: string;
  apartment: string;
}

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

// ─── Admin: listar todas as solicitações (via Edge Function com service role) ─

export async function fetchAccessRequests(): Promise<AccessRequest[]> {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? "";
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/get-residents`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      error.error ?? `Failed to fetch residents (${res.status})`
    );
  }

  return (await res.json()) as AccessRequest[];
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

type ResidentModerationAction = "suspend" | "reactivate" | "update-profile";

async function moderateResident(
  payload: {
    requestId: string;
    action: ResidentModerationAction;
    fields?: ResidentEditableFields;
  },
  accessToken: string
): Promise<void> {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? "";
  const res = await fetch(`${supabaseUrl}/functions/v1/moderate-resident`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const body: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro na moderação (${res.status})`);
  }
}

export async function suspendResident(
  requestId: string,
  accessToken: string
): Promise<void> {
  await moderateResident({ requestId, action: "suspend" }, accessToken);
}

export async function reactivateResident(
  requestId: string,
  accessToken: string
): Promise<void> {
  await moderateResident({ requestId, action: "reactivate" }, accessToken);
}

export async function updateResidentProfile(
  requestId: string,
  fields: ResidentEditableFields,
  accessToken: string
): Promise<void> {
  await moderateResident(
    {
      requestId,
      action: "update-profile",
      fields
    },
    accessToken
  );
}

export async function deleteTestResident(
  requestId: string,
  confirmationText: string,
  accessToken: string
): Promise<void> {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? "";
  const res = await fetch(`${supabaseUrl}/functions/v1/delete-test-resident`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ requestId, confirmationText })
  });

  if (!res.ok) {
    const body: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ao excluir registro (${res.status})`);
  }
}
