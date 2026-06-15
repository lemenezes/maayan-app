import { supabase } from "../lib/supabase";
import type { AccessRequest } from "../types";

export interface ResidentEditableFields {
  full_name: string;
  email: string;
  whatsapp: string;
  block: string;
  apartment: string;
}

async function resolveAccessToken(providedToken?: string): Promise<string> {
  const directToken = providedToken?.trim();
  if (directToken) return directToken;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return session.access_token;
  }

  const { data: refreshed, error: refreshError } =
    await supabase.auth.refreshSession();

  if (refreshed.session?.access_token) {
    return refreshed.session.access_token;
  }

  if (refreshError) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  throw new Error("Sessão não encontrada. Faça login novamente.");
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
  termsAcceptedAt: string;
  privacyAcceptedAt: string;
  termsVersion: string;
  privacyVersion: string;
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
      password: data.password,
      termsAcceptedAt: data.termsAcceptedAt,
      privacyAcceptedAt: data.privacyAcceptedAt,
      termsVersion: data.termsVersion,
      privacyVersion: data.privacyVersion
    })
  });

  if (!res.ok) {
    const body: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ao enviar solicitacao (${res.status})`);
  }
}

// ─── Admin: listar todas as solicitações (via Edge Function com service role) ─

export async function fetchAccessRequests(
  accessToken?: string
): Promise<AccessRequest[]> {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? "";
  const token = await resolveAccessToken(accessToken);

  const res = await fetch(`${supabaseUrl}/functions/v1/get-residents`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));

    if (res.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    if (res.status === 403) {
      throw new Error("Acesso permitido apenas para admin aprovado.");
    }

    throw new Error(error.error ?? `Failed to fetch residents (${res.status})`);
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

  const postDelete = async (phrase: string) => {
    const res = await fetch(
      `${supabaseUrl}/functions/v1/delete-test-resident`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ requestId, confirmationText: phrase })
      }
    );

    const body: { error?: string } = await res.json().catch(() => ({}));
    return { res, body };
  };

  const normalized = confirmationText.trim().toUpperCase();
  let phrase = confirmationText;
  let fallback: string | null = null;

  if (normalized === "EXCLUIR CADASTRO") {
    fallback = "EXCLUIR TESTE";
  } else if (normalized === "EXCLUIR TESTE") {
    fallback = "EXCLUIR CADASTRO";
  }

  let { res, body } = await postDelete(phrase);

  // Compatibilidade durante rollout entre frontend e edge function antiga.
  if (!res.ok && res.status === 400 && fallback) {
    const errorText = (body.error ?? "").toUpperCase();
    const asksForLegacy = errorText.includes("EXCLUIR TESTE");
    const asksForNew = errorText.includes("EXCLUIR CADASTRO");
    if (asksForLegacy || asksForNew) {
      ({ res, body } = await postDelete(fallback));
    }
  }

  if (!res.ok) {
    throw new Error(body.error ?? `Erro ao excluir registro (${res.status})`);
  }
}
