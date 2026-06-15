import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "lemenezes@gmail.com";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://maayan.leandrom.com.br";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  status: string;
}

interface RejectResidentResponse {
  success: boolean;
  emailSent: boolean;
  warning?: string;
}

Deno.serve(async (req: Request) => {
  console.log("reject-resident called", req.method);

  // Responde ao preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: CORS_HEADERS
    });
  }

  // ── Autenticar chamador ───────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  console.log("Auth header present:", !!authHeader);
  if (!authHeader)
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false }
  });

  const {
    data: { user },
    error: userError
  } = await userClient.auth.getUser();
  console.log("User found:", !!user, "error:", userError?.message);
  if (userError || !user)
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });

  // ── Verificar que é admin ────────────────────────────────────────────────
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const { data: callerProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  console.log("Caller role:", callerProfile?.role);
  if (callerProfile?.role !== "admin") {
    return new Response("Forbidden", { status: 403, headers: CORS_HEADERS });
  }

  // ── Ler body ─────────────────────────────────────────────────────────────
  let requestId: string | undefined;
  let reason: string | undefined;
  try {
    const body = (await req.json()) as { requestId?: string; reason?: string };
    requestId = body.requestId;
    reason = body.reason?.trim() || undefined;
  } catch {
    return new Response("Invalid JSON body", {
      status: 400,
      headers: CORS_HEADERS
    });
  }

  if (!requestId)
    return new Response("Missing requestId", {
      status: 400,
      headers: CORS_HEADERS
    });

  // ── Buscar solicitação ────────────────────────────────────────────────────
  const { data: request, error: reqError } = await adminClient
    .from("access_requests")
    .select("id, full_name, email, status")
    .eq("id", requestId)
    .single<AccessRequest>();

  if (reqError || !request)
    return new Response("Solicitação não encontrada", {
      status: 404,
      headers: CORS_HEADERS
    });
  if (request.status !== "pending")
    return new Response("Solicitação já processada", {
      status: 400,
      headers: CORS_HEADERS
    });

  // ── Atualizar status no DB ────────────────────────────────────────────────
  const { error: updateError } = await adminClient
    .from("access_requests")
    .update({
      status: "rejected",
      rejection_reason: reason ?? null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq("id", requestId);

  if (updateError) {
    console.error("DB update error:", updateError);
    return new Response("Erro ao atualizar solicitação", {
      status: 500,
      headers: CORS_HEADERS
    });
  }

  const jsonHeaders = {
    "Content-Type": "application/json",
    ...CORS_HEADERS
  };

  const ok = (payload: RejectResidentResponse) =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: jsonHeaders
    });

  // ── Enviar email ao solicitante ───────────────────────────────────────────
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping rejection email");
    return ok({
      success: true,
      emailSent: false,
      warning:
        "Solicitação rejeitada, mas o e-mail não foi enviado (RESEND_API_KEY ausente)."
    });
  }

  const reasonBlock = reason
    ? `<div style="background:#fef2f2;border-radius:12px;padding:16px;border:1px solid #fecaca;margin-bottom:24px">
         <p style="margin:0;font-size:13px;color:#991b1b"><strong>Motivo:</strong> ${reason}</p>
       </div>`
    : "";

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1e293b">
      <div style="background:#0A3D62;border-radius:16px;padding:24px;margin-bottom:24px;text-align:center">
        <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff">Maayan · Condomínio Cidade Jardim</h1>
      </div>

      <h2 style="margin:0 0 12px;font-size:18px;font-weight:700">Solicitação de acesso não aprovada</h2>

      <p style="margin:0 0 16px;color:#64748b">
        Olá, <strong>${request.full_name}</strong>. Infelizmente sua solicitação de acesso ao Maayan
        não foi aprovada desta vez.
      </p>

      ${reasonBlock}

      <p style="margin:0 0 24px;color:#64748b;font-size:13px">
        Se acredita que houve um engano ou tem dúvidas, entre em contato diretamente com o administrador do portal.
      </p>

      <a href="${SITE_URL}/solicitar-acesso"
         style="display:inline-block;background:#f1f5f9;color:#0C5A86;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px;font-size:13px;margin-bottom:24px">
        Enviar nova solicitação
      </a>

      <div style="margin-top:4px;padding-top:18px;border-top:1px solid #e2e8f0">
        <a href="${SITE_URL}"
           style="display:inline-block;background:#0C5A86;color:#fff;text-decoration:none;font-weight:600;padding:11px 18px;border-radius:10px;font-size:13px;margin-bottom:12px">
          Acessar Portal Maayan
        </a>
        <p style="margin:0;font-size:11px;line-height:1.5;color:#94a3b8">
          Este é um e-mail automático do Portal Maayan. Por favor, não responda esta mensagem.
          Para dúvidas ou informações, acesse o portal e utilize os canais de contato disponíveis no site.
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
      subject: "Sua solicitação de acesso ao Maayan",
      html
    })
  });

  if (!resendRes.ok) {
    const body = await resendRes.text();
    console.error("Resend error:", body);
    return ok({
      success: true,
      emailSent: false,
      warning:
        "Solicitação rejeitada, mas houve falha no envio do e-mail ao solicitante."
    });
  }

  return ok({ success: true, emailSent: true });
});
