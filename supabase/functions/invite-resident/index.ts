import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const APP_ENV = (Deno.env.get("APP_ENV") ?? "production").toLowerCase();
const DEFAULT_PROD_SITE_URL = "https://maayan.leandrom.com.br";
const DEFAULT_DEV_SITE_URL = "http://localhost:5175";
const PROD_ORIGIN = "https://maayan.leandrom.com.br";
const DEV_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5175",
  "http://127.0.0.1:5175"
]);

function resolveSiteUrl(): string {
  const configuredSiteUrl = Deno.env.get("SITE_URL")?.trim();
  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/$/, "");
  }

  if (APP_ENV === "development") {
    return DEFAULT_DEV_SITE_URL;
  }

  return DEFAULT_PROD_SITE_URL;
}

const SITE_URL = resolveSiteUrl();

function resolveAllowedOrigin(req: Request): string {
  const origin = req.headers.get("origin");

  if (origin === PROD_ORIGIN) {
    return origin;
  }

  if (APP_ENV === "development" && origin && DEV_ORIGINS.has(origin)) {
    return origin;
  }

  return PROD_ORIGIN;
}

function buildCorsHeaders(req: Request, extraHeaders?: HeadersInit): Headers {
  const headers = new Headers(extraHeaders);
  headers.set("Access-Control-Allow-Origin", resolveAllowedOrigin(req));
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "authorization, x-client-info, apikey, content-type"
  );
  headers.set("Vary", "Origin");
  return headers;
}

interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  block: string;
  apartment: string;
  status: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: buildCorsHeaders(req)
    });
  }

  // ── Verificar que o chamador está autenticado ─────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", {
      status: 401,
      headers: buildCorsHeaders(req)
    });
  }

  // Client com a sessão do usuário chamador (anon key)
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false }
  });

  const {
    data: { user },
    error: userError
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response("Unauthorized", {
      status: 401,
      headers: buildCorsHeaders(req)
    });
  }

  // ── Client com service role (bypassa RLS) ─────────────────────────────────
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  // ── Verificar que o chamador é admin ─────────────────────────────────────
  const { data: callerProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || callerProfile?.role !== "admin") {
    return new Response("Forbidden — apenas admins podem convidar moradores", {
      status: 403,
      headers: buildCorsHeaders(req)
    });
  }

  // ── Ler o requestId do body ───────────────────────────────────────────────
  let requestId: string | undefined;
  try {
    const body = (await req.json()) as { requestId?: string };
    requestId = body.requestId;
  } catch {
    return new Response("Invalid JSON body", {
      status: 400,
      headers: buildCorsHeaders(req)
    });
  }

  if (!requestId) {
    return new Response("Missing requestId", {
      status: 400,
      headers: buildCorsHeaders(req)
    });
  }

  // ── Buscar a solicitação de acesso ────────────────────────────────────────
  const { data: request, error: reqError } = await adminClient
    .from("access_requests")
    .select("*")
    .eq("id", requestId)
    .single<AccessRequest>();

  if (reqError || !request) {
    return new Response("Solicitação não encontrada", {
      status: 404,
      headers: buildCorsHeaders(req)
    });
  }

  if (request.status !== "pending") {
    return new Response("Solicitação já foi processada", {
      status: 400,
      headers: buildCorsHeaders(req)
    });
  }

  // ── Enviar convite via Supabase Auth ──────────────────────────────────────
  const { data: inviteData, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(request.email, {
      redirectTo: `${SITE_URL}/entrar`,
      data: {
        full_name: request.full_name,
        block: request.block,
        apartment: request.apartment
      }
    });

  if (inviteError || !inviteData?.user) {
    console.error("Invite error:", inviteError);
    return new Response(
      JSON.stringify({
        error: inviteError?.message ?? "Falha ao enviar convite"
      }),
      {
        status: 500,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  // ── Criar perfil aprovado ─────────────────────────────────────────────────
  const { error: profileCreateError } = await adminClient
    .from("profiles")
    .upsert({
      id: inviteData.user.id,
      full_name: request.full_name,
      email: request.email,
      block: request.block,
      apartment: request.apartment,
      role: "resident",
      status: "approved"
    });

  if (profileCreateError) {
    // Não falha — o convite já foi enviado. Registra para correção manual.
    console.error("Profile upsert error:", profileCreateError);
  }

  // ── Marcar solicitação como aprovada ─────────────────────────────────────
  await adminClient
    .from("access_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq("id", requestId);

  return new Response(
    JSON.stringify({ success: true, userId: inviteData.user.id }),
    {
      status: 200,
      headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
    }
  );
});
