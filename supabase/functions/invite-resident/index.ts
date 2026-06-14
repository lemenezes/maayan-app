import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";
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
const APPROVED_LOGIN_URL = "https://maayan.leandrom.com.br/entrar";

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
  auth_user_id: string | null;
  full_name: string;
  email: string;
  whatsapp: string | null;
  block: string;
  apartment: string;
  status: string;
}

function isAlreadyRegisteredError(message?: string): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes("already been registered");
}

async function findAuthUserIdByEmail(
  adminClient: any,
  email: string
): Promise<string | null> {
  let page = 1;
  const normalizedEmail = email.trim().toLowerCase();

  while (page <= 20) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 100
    });

    if (error) {
      console.error("listUsers error:", error);
      return null;
    }

    const users = data?.users ?? [];
    const match = users.find(
      (u: any) => (u.email ?? "").trim().toLowerCase() === normalizedEmail
    );

    if (match?.id) {
      return match.id;
    }

    if (users.length < 100) {
      break;
    }

    page += 1;
  }

  return null;
}

async function sendApprovalReleasedEmail(email: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping approval email");
    return;
  }

  const subject = "Seu acesso foi liberado";
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1e293b">
      <h1 style="font-size:20px;margin:0 0 12px;color:#0C5A86">Seu acesso foi liberado</h1>
      <p style="font-size:14px;line-height:1.5;margin:0 0 18px">
        Sua solicitacao foi aprovada. Agora voce ja pode entrar no Maayan com a senha cadastrada.
      </p>
      <a href="${APPROVED_LOGIN_URL}"
         style="display:inline-block;background:#0C5A86;color:#fff;text-decoration:none;font-weight:600;padding:12px 18px;border-radius:10px;font-size:14px">
        Entrar no Maayan
      </a>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject,
      html
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Resend approval email error:", errorBody);
  }
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

  // ── Novo fluxo: já existe auth user e senha criada no cadastro ───────────
  if (request.auth_user_id) {
    const { error: profileApproveError } = await adminClient
      .from("profiles")
      .upsert({
        id: request.auth_user_id,
        full_name: request.full_name,
        email: request.email,
        whatsapp: request.whatsapp,
        block: request.block,
        apartment: request.apartment,
        role: "resident",
        status: "approved"
      });

    if (profileApproveError) {
      console.error("Profile approve error:", profileApproveError);
      return new Response(
        JSON.stringify({ error: "Falha ao aprovar perfil do morador" }),
        {
          status: 500,
          headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
        }
      );
    }

    await adminClient
      .from("access_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq("id", requestId);

    await sendApprovalReleasedEmail(request.email);

    return new Response(
      JSON.stringify({
        success: true,
        userId: request.auth_user_id,
        invited: false,
        flow: "register-password"
      }),
      {
        status: 200,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  // ── Enviar convite via Supabase Auth ──────────────────────────────────────
  const { data: inviteData, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(request.email, {
      redirectTo: `${SITE_URL}/definir-senha`,
      data: {
        full_name: request.full_name,
        block: request.block,
        apartment: request.apartment
      }
    });

  const isExistingUser = isAlreadyRegisteredError(inviteError?.message);

  if (
    (inviteError && !isExistingUser) ||
    (!inviteData?.user && !isExistingUser)
  ) {
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

  let targetUserId = inviteData?.user?.id ?? null;

  if (isExistingUser && !targetUserId) {
    targetUserId = await findAuthUserIdByEmail(adminClient, request.email);
  }

  // ── Criar/atualizar perfil aprovado ───────────────────────────────────────
  let profileCreateError: unknown = null;

  if (targetUserId) {
    const result = await adminClient.from("profiles").upsert({
      id: targetUserId,
      full_name: request.full_name,
      email: request.email,
      whatsapp: request.whatsapp,
      block: request.block,
      apartment: request.apartment,
      role: "resident",
      status: "approved"
    });

    profileCreateError = result.error;
  } else {
    const result = await adminClient
      .from("profiles")
      .update({
        full_name: request.full_name,
        whatsapp: request.whatsapp,
        block: request.block,
        apartment: request.apartment,
        role: "resident",
        status: "approved"
      })
      .eq("email", request.email);

    profileCreateError = result.error;
    console.warn(
      "Usuário já registrado sem userId localizado; profile atualizado por email"
    );
  }

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

  if (isExistingUser) {
    await sendApprovalReleasedEmail(request.email);
  }

  return new Response(
    JSON.stringify({
      success: true,
      userId: targetUserId,
      invited: !isExistingUser
    }),
    {
      status: 200,
      headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
    }
  );
});
