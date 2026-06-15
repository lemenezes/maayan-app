import { createClient } from "@supabase/supabase-js";

// @ts-ignore - Deno global is available at runtime
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
// @ts-ignore - Deno global is available at runtime
const SUPABASE_SERVICE_ROLE_KEY =
  // @ts-ignore - Deno global is available at runtime
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PROD_ORIGIN = "https://maayan.leandrom.com.br";
const ALLOWED_ORIGINS = new Set([
  PROD_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
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
  termsAcceptedAt?: string;
  privacyAcceptedAt?: string;
  termsVersion?: string;
  privacyVersion?: string;
}

function isMissingLegalColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { code?: string; message?: string };
  const message = (maybeError.message ?? "").toLowerCase();
  const code = (maybeError.code ?? "").toUpperCase();

  const mentionsLegalColumn =
    message.includes("terms_accepted_at") ||
    message.includes("privacy_accepted_at") ||
    message.includes("terms_version") ||
    message.includes("privacy_version");

  return (
    mentionsLegalColumn || code === "42703" || message.includes("schema cache")
  );
}

function resolveAllowedOrigin(req: Request): string | null {
  const origin = req.headers.get("origin");

  if (!origin) return null;
  if (ALLOWED_ORIGINS.has(origin)) return origin;

  return null;
}

function buildCorsHeaders(req: Request, extraHeaders?: HeadersInit): Headers {
  const headers = new Headers(extraHeaders);
  const allowedOrigin = resolveAllowedOrigin(req);

  if (allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "authorization, x-client-info, apikey, content-type"
    );
  }

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

// @ts-ignore - Deno global is available at runtime
Deno.serve(async (req: Request) => {
  const allowedOrigin = resolveAllowedOrigin(req);

  if (req.method === "OPTIONS") {
    if (!allowedOrigin) {
      return new Response("Origin not allowed", {
        status: 403,
        headers: buildCorsHeaders(req)
      });
    }

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
  const termsAcceptedAt = (body.termsAcceptedAt ?? "").trim();
  const privacyAcceptedAt = (body.privacyAcceptedAt ?? "").trim();
  const termsVersion = (body.termsVersion ?? "").trim();
  const privacyVersion = (body.privacyVersion ?? "").trim();
  const hasAnyLegalField =
    Boolean(termsAcceptedAt) ||
    Boolean(privacyAcceptedAt) ||
    Boolean(termsVersion) ||
    Boolean(privacyVersion);
  const hasCompleteLegalFields =
    Boolean(termsAcceptedAt) &&
    Boolean(privacyAcceptedAt) &&
    Boolean(termsVersion) &&
    Boolean(privacyVersion);

  if (!fullName || !email || !whatsapp || !block || !apartment || !password) {
    return new Response(
      JSON.stringify({ error: "Dados obrigatórios ausentes." }),
      {
        status: 400,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  // Compatibilidade: aceitar payload antigo sem campos legais em rollout.
  if (hasAnyLegalField && !hasCompleteLegalFields) {
    return new Response(
      JSON.stringify({ error: "Aceite legal obrigatório não informado." }),
      {
        status: 400,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  if (hasCompleteLegalFields) {
    const parsedTermsAcceptedAt = new Date(termsAcceptedAt);
    const parsedPrivacyAcceptedAt = new Date(privacyAcceptedAt);

    if (
      Number.isNaN(parsedTermsAcceptedAt.getTime()) ||
      Number.isNaN(parsedPrivacyAcceptedAt.getTime())
    ) {
      return new Response(
        JSON.stringify({ error: "Data de aceite legal inválida." }),
        {
          status: 400,
          headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
        }
      );
    }
  }

  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: "E-mail inválido." }), {
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

  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id, status")
    .eq("email", email)
    .limit(1)
    .maybeSingle();

  // Bloquear recadastro de perfis suspensos sem depender de status da access_request.
  if (existingProfile?.status === "suspended") {
    return new Response(
      JSON.stringify({
        error:
          "Este cadastro está suspenso. Fale com a administração para reativação."
      }),
      {
        status: 409,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  // Verificar access_request existente (pending, approved ou rejected)
  const { data: existingRequest } = await adminClient
    .from("access_requests")
    .select("id, status, auth_user_id")
    .eq("email", email)
    .in("status", ["pending", "approved", "rejected"])
    .limit(1)
    .maybeSingle();

  // Bloquear se solicitação está em análise ou já aprovada.
  if (
    existingRequest &&
    ["pending", "approved"].includes(existingRequest.status)
  ) {
    const errorMessage =
      existingRequest.status === "pending"
        ? "Já existe uma solicitação pendente para este e-mail."
        : "Este e-mail já possui acesso ao portal. Faça login para continuar.";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 409,
      headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  // Se rejected, reutilizar auth_user_id; senão criar novo
  let authUserId: string;

  if (existingRequest?.status === "rejected" && existingRequest.auth_user_id) {
    authUserId = existingRequest.auth_user_id;
  } else {
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
        ? "Este e-mail já possui acesso ao portal. Faça login para continuar."
        : (createUserError?.message ?? "Não foi possível criar o usuário.");

      return new Response(JSON.stringify({ error: userFacingMessage }), {
        status: normalizedMessage.includes("already") ? 409 : 500,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      });
    }

    authUserId = createUserData.user.id;
  }

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
    // Se for novo usuário (não rejected), deletar
    if (existingRequest?.status !== "rejected") {
      await adminClient.auth.admin.deleteUser(authUserId);
    }
    return new Response(
      JSON.stringify({ error: "Falha ao preparar cadastro do morador." }),
      {
        status: 500,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  // Atualizar access_request rejected ou criar novo
  if (existingRequest?.status === "rejected") {
    const baseUpdate = {
      full_name: fullName,
      whatsapp,
      block,
      apartment,
      message,
      status: "pending"
    };

    const updateWithLegal = {
      ...baseUpdate,
      terms_accepted_at: termsAcceptedAt,
      privacy_accepted_at: privacyAcceptedAt,
      terms_version: termsVersion,
      privacy_version: privacyVersion
    };

    let { error: updateError } = await adminClient
      .from("access_requests")
      .update(hasCompleteLegalFields ? updateWithLegal : baseUpdate)
      .eq("id", existingRequest.id);

    if (
      updateError &&
      hasCompleteLegalFields &&
      isMissingLegalColumnError(updateError)
    ) {
      console.warn(
        "Legal columns missing in access_requests; retrying update without legal fields."
      );

      ({ error: updateError } = await adminClient
        .from("access_requests")
        .update(baseUpdate)
        .eq("id", existingRequest.id));
    }

    if (updateError) {
      console.error("Access request update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Falha ao atualizar solicitação de acesso." }),
        {
          status: 500,
          headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
        }
      );
    }
  } else {
    const baseInsert = {
      auth_user_id: authUserId,
      full_name: fullName,
      email,
      whatsapp,
      block,
      apartment,
      message,
      status: "pending"
    };

    const insertWithLegal = {
      ...baseInsert,
      terms_accepted_at: termsAcceptedAt,
      privacy_accepted_at: privacyAcceptedAt,
      terms_version: termsVersion,
      privacy_version: privacyVersion
    };

    let { error: requestError } = await adminClient
      .from("access_requests")
      .insert(hasCompleteLegalFields ? insertWithLegal : baseInsert);

    if (
      requestError &&
      hasCompleteLegalFields &&
      isMissingLegalColumnError(requestError)
    ) {
      console.warn(
        "Legal columns missing in access_requests; retrying insert without legal fields."
      );

      ({ error: requestError } = await adminClient
        .from("access_requests")
        .insert(baseInsert));
    }

    if (requestError) {
      console.error("Access request insert error:", requestError);
      await adminClient.auth.admin.deleteUser(authUserId);
      return new Response(
        JSON.stringify({ error: "Falha ao registrar solicitação de acesso." }),
        {
          status: 500,
          headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
        }
      );
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
  });
});
