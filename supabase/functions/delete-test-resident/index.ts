import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "lemenezes@gmail.com";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://maayan.leandrom.com.br";
const PROD_ORIGIN = "https://maayan.leandrom.com.br";
const DEV_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5175",
  "http://127.0.0.1:5175"
]);
const REQUIRED_CONFIRMATION = "EXCLUIR CADASTRO";
const LEGACY_REQUIRED_CONFIRMATION = "EXCLUIR TESTE";

interface DeletePayload {
  requestId?: string;
  confirmationText?: string;
}

interface AccessRequestRow {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  message: string | null;
  status: string;
}

interface ProfileRow {
  id: string;
  status: string;
}

interface DeleteResidentResponse {
  success: boolean;
  removedAccessRequestId: string;
  deletedProfile: boolean;
  deletedAuthUser: boolean;
  emailSent: boolean;
  warning?: string;
}

function resolveAllowedOrigin(req: Request): string {
  const origin = req.headers.get("origin");

  if (origin === PROD_ORIGIN) return origin;
  if (origin && DEV_ORIGINS.has(origin)) return origin;

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

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", {
      status: 401,
      headers: buildCorsHeaders(req)
    });
  }

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

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const { data: callerProfile, error: callerError } = await adminClient
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (
    callerError ||
    callerProfile?.role !== "admin" ||
    callerProfile?.status !== "approved"
  ) {
    return new Response("Forbidden", {
      status: 403,
      headers: buildCorsHeaders(req)
    });
  }

  let body: DeletePayload;
  try {
    body = (await req.json()) as DeletePayload;
  } catch {
    return new Response("Invalid JSON body", {
      status: 400,
      headers: buildCorsHeaders(req)
    });
  }

  const requestId = body.requestId?.trim();
  const confirmationText = (body.confirmationText ?? "").trim().toUpperCase();

  if (!requestId) {
    return new Response(JSON.stringify({ error: "requestId é obrigatório." }), {
      status: 400,
      headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  const isConfirmationValid =
    confirmationText === REQUIRED_CONFIRMATION ||
    confirmationText === LEGACY_REQUIRED_CONFIRMATION;

  if (!isConfirmationValid) {
    return new Response(
      JSON.stringify({
        error: `Digite exatamente \"${REQUIRED_CONFIRMATION}\" para confirmar.`
      }),
      {
        status: 400,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  const { data: request, error: requestError } = await adminClient
    .from("access_requests")
    .select("id, auth_user_id, full_name, email, message, status")
    .eq("id", requestId)
    .single<AccessRequestRow>();

  if (requestError || !request) {
    return new Response(
      JSON.stringify({ error: "Solicitação não encontrada." }),
      {
        status: 404,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  const { data: linkedProfile } = request.auth_user_id
    ? await adminClient
        .from("profiles")
        .select("id, status")
        .eq("id", request.auth_user_id)
        .maybeSingle<ProfileRow>()
    : { data: null };

  let hasAuthUser = false;
  if (request.auth_user_id) {
    const { data: authData, error: authLookupError } =
      await adminClient.auth.admin.getUserById(request.auth_user_id);
    hasAuthUser = !authLookupError && Boolean(authData?.user?.id);
  }

  const isInconsistentOperationalState =
    request.status === "approved" && !linkedProfile && !hasAuthUser;

  const operationalStatus =
    linkedProfile?.status ??
    (isInconsistentOperationalState ? "inconsistent" : request.status);

  if (operationalStatus === "approved") {
    return new Response(
      JSON.stringify({
        error:
          "Este morador está aprovado. Para produção, prefira suspender em vez de excluir."
      }),
      {
        status: 409,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  const { data: deletedRows, error: deleteError } = await adminClient
    .from("access_requests")
    .delete()
    .eq("id", requestId)
    .select("id");

  if (deleteError) {
    return new Response(
      JSON.stringify({ error: "Falha ao excluir access_request." }),
      {
        status: 500,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  if (!deletedRows || deletedRows.length === 0) {
    return new Response(
      JSON.stringify({
        error:
          "Nenhuma linha foi removida em access_requests. Verifique políticas/RLS."
      }),
      {
        status: 409,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  let deletedProfile = false;
  let deletedAuthUser = false;

  if (
    request.auth_user_id &&
    linkedProfile &&
    linkedProfile.status !== "suspended"
  ) {
    const { data: removedProfiles, error: removeProfileError } =
      await adminClient
        .from("profiles")
        .delete()
        .eq("id", request.auth_user_id)
        .select("id");

    if (!removeProfileError) {
      deletedProfile = Boolean(removedProfiles?.length);

      if (deletedProfile) {
        const { error: authDeleteError } =
          await adminClient.auth.admin.deleteUser(request.auth_user_id);
        deletedAuthUser = !authDeleteError;
      }
    }
  }

  const jsonHeaders = buildCorsHeaders(req, {
    "Content-Type": "application/json"
  });
  const ok = (payload: DeleteResidentResponse) =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: jsonHeaders
    });

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping deletion email");
    return ok({
      success: true,
      removedAccessRequestId: requestId,
      deletedProfile,
      deletedAuthUser,
      emailSent: false,
      warning:
        "Cadastro excluído, mas o e-mail de confirmação não foi enviado (RESEND_API_KEY ausente)."
    });
  }

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1e293b">
      <div style="background:#0A3D62;border-radius:16px;padding:24px;margin-bottom:24px;text-align:center">
        <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff">Maayan · Condomínio Cidade Jardim</h1>
      </div>

      <h2 style="margin:0 0 12px;font-size:18px;font-weight:700">Cadastro removido</h2>

      <p style="margin:0 0 16px;color:#64748b">
        Olá, <strong>${request.full_name}</strong>. Seu cadastro/solicitação foi removido do portal Maayan.
      </p>

      <p style="margin:0 0 24px;color:#64748b;font-size:13px">
        Se isso ocorreu por engano ou você quiser solicitar acesso novamente, use o link abaixo.
      </p>

      <a href="${SITE_URL}/solicitar-acesso"
         style="display:inline-block;background:#f1f5f9;color:#0C5A86;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px;font-size:13px;margin-bottom:24px">
        Solicitar acesso novamente
      </a>

      <div style="margin-top:4px;padding-top:18px;border-top:1px solid #e2e8f0">
        <a href="${SITE_URL}"
           style="display:inline-block;background:#0C5A86;color:#fff;text-decoration:none;font-weight:600;padding:11px 18px;border-radius:10px;font-size:13px;margin-bottom:12px">
          Acessar Portal Maayan
        </a>
        <p style="margin:0;font-size:11px;line-height:1.5;color:#94a3b8">
          Este é um e-mail automático do Portal Maayan. Por favor, não responda esta mensagem.
        </p>
      </div>

      <p style="margin:0;font-size:11px;color:#94a3b8">Maayan · Condomínio Cidade Jardim</p>
    </div>
  `;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: `Portal Maayan <${FROM_EMAIL}>`,
      to: request.email,
      bcc: ADMIN_EMAIL,
      subject: "Confirmação de exclusão de cadastro no Maayan",
      html
    })
  });

  if (!resendRes.ok) {
    const body = await resendRes.text();
    console.error("Resend delete email error:", body);
    return ok({
      success: true,
      removedAccessRequestId: requestId,
      deletedProfile,
      deletedAuthUser,
      emailSent: false,
      warning:
        "Cadastro excluído, mas houve falha ao enviar e-mail para o morador e CCO para o admin."
    });
  }

  return ok({
    success: true,
    removedAccessRequestId: requestId,
    deletedProfile,
    deletedAuthUser,
    emailSent: true
  });
});
