import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const APP_ENV = (Deno.env.get("APP_ENV") ?? "production").toLowerCase();
const PROD_ORIGIN = "https://maayan.leandrom.com.br";
const DEV_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5175",
  "http://127.0.0.1:5175"
]);

interface RegisterResidentPayload {
  full_name?: string;
  email?: string;
  whatsapp?: string;
  block?: string;
  apartment?: string;
  message?: string;
  password?: string;
}

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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/.test(value);
}

function normalizeWhatsapp(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";

  const withoutCountryCode =
    digitsOnly.length > 11 && digitsOnly.startsWith("55")
      ? digitsOnly.slice(2)
      : digitsOnly;

  return withoutCountryCode.slice(0, 11);
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

  let body: RegisterResidentPayload;
  try {
    body = (await req.json()) as RegisterResidentPayload;
  } catch {
    return new Response("Invalid JSON body", {
      status: 400,
      headers: buildCorsHeaders(req)
    });
  }

  const fullName = (body.full_name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const whatsapp = normalizeWhatsapp(body.whatsapp ?? "");
  const block = (body.block ?? "").trim();
  const apartment = (body.apartment ?? "").trim();
  const message = (body.message ?? "").trim() || null;
  const password = body.password ?? "";

  if (!fullName || !email || !whatsapp || !block || !apartment || !password) {
    return new Response(
      JSON.stringify({ error: "Dados obrigatorios ausentes." }),
      {
        status: 400,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: "E-mail invalido." }), {
      status: 400,
      headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  if (password.length < 6) {
    return new Response(
      JSON.stringify({ error: "A senha precisa ter pelo menos 6 caracteres." }),
      {
        status: 400,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const { data: pendingRequest } = await adminClient
    .from("access_requests")
    .select("id")
    .eq("email", email)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  if (pendingRequest?.id) {
    return new Response(
      JSON.stringify({
        error: "Ja existe uma solicitacao pendente para este e-mail."
      }),
      {
        status: 409,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  const { data: createUserData, error: createUserError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        block,
        apartment
      }
    });

  if (createUserError || !createUserData.user?.id) {
    const normalizedMessage = (createUserError?.message ?? "").toLowerCase();
    const userFacingMessage = normalizedMessage.includes("already")
      ? "Este e-mail ja esta cadastrado. Tente entrar no portal."
      : (createUserError?.message ?? "Nao foi possivel criar o usuario.");

    return new Response(JSON.stringify({ error: userFacingMessage }), {
      status: normalizedMessage.includes("already") ? 409 : 500,
      headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  const authUserId = createUserData.user.id;

  const { error: profileError } = await adminClient.from("profiles").upsert({
    id: authUserId,
    full_name: fullName,
    email,
    whatsapp,
    block,
    apartment,
    role: "resident",
    status: "pending"
  });

  if (profileError) {
    console.error("Profile upsert error:", profileError);
    await adminClient.auth.admin.deleteUser(authUserId);
    return new Response(
      JSON.stringify({ error: "Falha ao preparar cadastro do morador." }),
      {
        status: 500,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  const { error: requestError } = await adminClient
    .from("access_requests")
    .insert({
      auth_user_id: authUserId,
      full_name: fullName,
      email,
      whatsapp,
      block,
      apartment,
      message,
      status: "pending"
    });

  if (requestError) {
    console.error("Access request insert error:", requestError);
    await adminClient.auth.admin.deleteUser(authUserId);
    return new Response(
      JSON.stringify({ error: "Falha ao registrar solicitacao de acesso." }),
      {
        status: 500,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
  });
});
