import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://maayan.leandrom.com.br';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  block: string;
  apartment: string;
  status: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  // ── Verificar que o chamador está autenticado ─────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Client com a sessão do usuário chamador (anon key)
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // ── Client com service role (bypassa RLS) ─────────────────────────────────
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // ── Verificar que o chamador é admin ─────────────────────────────────────
  const { data: callerProfile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || callerProfile?.role !== 'admin') {
    return new Response('Forbidden — apenas admins podem convidar moradores', { status: 403 });
  }

  // ── Ler o requestId do body ───────────────────────────────────────────────
  let requestId: string | undefined;
  try {
    const body = await req.json() as { requestId?: string };
    requestId = body.requestId;
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  if (!requestId) {
    return new Response('Missing requestId', { status: 400 });
  }

  // ── Buscar a solicitação de acesso ────────────────────────────────────────
  const { data: request, error: reqError } = await adminClient
    .from('access_requests')
    .select('*')
    .eq('id', requestId)
    .single<AccessRequest>();

  if (reqError || !request) {
    return new Response('Solicitação não encontrada', { status: 404 });
  }

  if (request.status !== 'pending') {
    return new Response('Solicitação já foi processada', { status: 400 });
  }

  // ── Enviar convite via Supabase Auth ──────────────────────────────────────
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    request.email,
    {
      redirectTo: `${SITE_URL}/entrar`,
      data: {
        full_name: request.full_name,
        block: request.block,
        apartment: request.apartment,
      },
    },
  );

  if (inviteError || !inviteData?.user) {
    console.error('Invite error:', inviteError);
    return new Response(
      JSON.stringify({ error: inviteError?.message ?? 'Falha ao enviar convite' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ── Criar perfil aprovado ─────────────────────────────────────────────────
  const { error: profileCreateError } = await adminClient.from('profiles').upsert({
    id: inviteData.user.id,
    full_name: request.full_name,
    email: request.email,
    block: request.block,
    apartment: request.apartment,
    role: 'resident',
    status: 'approved',
  });

  if (profileCreateError) {
    // Não falha — o convite já foi enviado. Registra para correção manual.
    console.error('Profile upsert error:', profileCreateError);
  }

  // ── Marcar solicitação como aprovada ─────────────────────────────────────
  await adminClient
    .from('access_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', requestId);

  return new Response(
    JSON.stringify({ success: true, userId: inviteData.user.id }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
  );
});
