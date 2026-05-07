import { supabase } from '../lib/supabase';
import type { AccessRequest } from '../types';

// ─── Submeter solicitação (anônimo) ──────────────────────────────────────────

export async function submitAccessRequest(data: {
  full_name: string;
  email: string;
  block: string;
  apartment: string;
  message?: string;
}): Promise<void> {
  const { error } = await supabase.from('access_requests').insert({
    full_name: data.full_name,
    email: data.email,
    block: data.block,
    apartment: data.apartment,
    message: data.message ?? null,
  });
  if (error) throw new Error(error.message);
}

// ─── Admin: listar todas as solicitações ─────────────────────────────────────

export async function fetchAccessRequests(): Promise<AccessRequest[]> {
  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as AccessRequest[];
}

// ─── Admin: rejeitar solicitação (via Edge Function) ────────────────────────

export async function rejectAccessRequest(
  id: string,
  accessToken: string,
  reason?: string,
): Promise<void> {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
  const res = await fetch(`${supabaseUrl}/functions/v1/reject-resident`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ requestId: id, reason }),
  });

  if (!res.ok) {
    const body: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ao rejeitar solicitação (${res.status})`);
  }
}

// ─── Admin: aprovar solicitação (via Edge Function) ───────────────────────────
// A Edge Function usa a service role para criar o auth user e enviar o convite.

export async function approveAccessRequest(id: string, accessToken: string): Promise<void> {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
  const res = await fetch(`${supabaseUrl}/functions/v1/invite-resident`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ requestId: id }),
  });

  if (!res.ok) {
    const body: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ao aprovar solicitação (${res.status})`);
  }
}
