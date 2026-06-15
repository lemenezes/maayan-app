import { supabase } from "../lib/supabase";
import type { AccessRequest } from "../types";

type ProfileOperationalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

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

// ─── Admin: listar todas as solicitações ─────────────────────────────────────

export async function fetchAccessRequests(): Promise<AccessRequest[]> {
  const { data, error } = await supabase
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const requests = (data ?? []) as AccessRequest[];
  const authUserIds = Array.from(
    new Set(
      requests
        .map(request => request.auth_user_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const profileStatusById = new Map<string, ProfileOperationalStatus>();
  const profileStatusByEmail = new Map<string, ProfileOperationalStatus>();

  if (authUserIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, status")
      .in("id", authUserIds);

    if (profilesError) throw new Error(profilesError.message);

    for (const profile of profiles ?? []) {
      profileStatusById.set(
        profile.id,
        profile.status as ProfileOperationalStatus
      );
    }
  }

  const emails = Array.from(
    new Set(
      requests
        .map(request => request.email?.trim().toLowerCase())
        .filter((email): email is string => Boolean(email))
    )
  );

  if (emails.length > 0) {
    const { data: profilesByEmail, error: profilesByEmailError } =
      await supabase
        .from("profiles")
        .select("email, status")
        .in("email", emails);

    if (profilesByEmailError) throw new Error(profilesByEmailError.message);

    for (const profile of profilesByEmail ?? []) {
      if (!profile.email) continue;
      profileStatusByEmail.set(
        profile.email.trim().toLowerCase(),
        profile.status as ProfileOperationalStatus
      );
    }
  }

  return requests.map(request => ({
    ...request,
    operational_status: (() => {
      const statusFromId = request.auth_user_id
        ? profileStatusById.get(request.auth_user_id)
        : undefined;
      const statusFromEmail = profileStatusByEmail.get(
        request.email.trim().toLowerCase()
      );
      const resolvedProfileStatus = statusFromId ?? statusFromEmail;

      if (resolvedProfileStatus) {
        return resolvedProfileStatus;
      }

      if (request.status === "approved") {
        return "inconsistent";
      }

      return request.status;
    })(),
    has_profile:
      Boolean(
        request.auth_user_id && profileStatusById.has(request.auth_user_id)
      ) || profileStatusByEmail.has(request.email.trim().toLowerCase())
  }));
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
