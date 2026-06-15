import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PROD_ORIGIN = "https://maayan.leandrom.com.br";
const DEV_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5175",
  "http://127.0.0.1:5175"
]);

type ModerateAction = "suspend" | "reactivate" | "update-profile";

interface ModeratePayload {
  requestId?: string;
  action?: ModerateAction;
  fields?: {
    full_name?: string;
    email?: string;
    whatsapp?: string;
    block?: string;
    apartment?: string;
  };
}

interface AccessRequestRow {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  whatsapp: string | null;
  block: string;
  apartment: string;
  status: string;
}

interface ProfileRow {
  id: string;
  status: string;
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

function normalizeWhatsapp(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";

  const withoutCountryCode =
    digitsOnly.length > 11 && digitsOnly.startsWith("55")
      ? digitsOnly.slice(2)
      : digitsOnly;

  return withoutCountryCode.slice(0, 11);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/.test(value);
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

  let body: ModeratePayload;
  try {
    body = (await req.json()) as ModeratePayload;
  } catch {
    return new Response("Invalid JSON body", {
      status: 400,
      headers: buildCorsHeaders(req)
    });
  }

  const requestId = body.requestId;
  const action = body.action;

  if (!requestId || !action) {
    return new Response(
      JSON.stringify({ error: "requestId e action sao obrigatorios." }),
      {
        status: 400,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  const { data: request, error: requestError } = await adminClient
    .from("access_requests")
    .select(
      "id, auth_user_id, full_name, email, whatsapp, block, apartment, status"
    )
    .eq("id", requestId)
    .single<AccessRequestRow>();

  if (requestError || !request) {
    return new Response(JSON.stringify({ error: "Morador nao encontrado." }), {
      status: 404,
      headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  const updateProfileAndRequestFields = async (fields: {
    full_name: string;
    email: string;
    whatsapp: string;
    block: string;
    apartment: string;
  }) => {
    const requestUpdate = await adminClient
      .from("access_requests")
      .update({
        full_name: fields.full_name,
        email: fields.email,
        whatsapp: fields.whatsapp,
        block: fields.block,
        apartment: fields.apartment
      })
      .eq("id", requestId);

    if (requestUpdate.error) {
      throw new Error("Falha ao atualizar dados em access_requests.");
    }

    let profileUpdateError: string | null = null;

    if (request.auth_user_id) {
      const profileUpdate = await adminClient
        .from("profiles")
        .update({
          full_name: fields.full_name,
          email: fields.email,
          whatsapp: fields.whatsapp,
          block: fields.block,
          apartment: fields.apartment
        })
        .eq("id", request.auth_user_id);

      if (profileUpdate.error) {
        profileUpdateError = profileUpdate.error.message;
      }
    } else {
      const profileUpdate = await adminClient
        .from("profiles")
        .update({
          full_name: fields.full_name,
          email: fields.email,
          whatsapp: fields.whatsapp,
          block: fields.block,
          apartment: fields.apartment
        })
        .eq("email", request.email);

      if (profileUpdate.error) {
        profileUpdateError = profileUpdate.error.message;
      }
    }

    if (profileUpdateError) {
      throw new Error(profileUpdateError);
    }
  };

  if (action === "update-profile") {
    const fullName = (body.fields?.full_name ?? "").trim();
    const email = (body.fields?.email ?? "").trim().toLowerCase();
    const whatsapp = normalizeWhatsapp(body.fields?.whatsapp ?? "");
    const block = (body.fields?.block ?? "").trim().toUpperCase();
    const apartment = (body.fields?.apartment ?? "")
      .replace(/\D/g, "")
      .slice(0, 4);

    if (!fullName || !email || !whatsapp || !block || !apartment) {
      return new Response(
        JSON.stringify({ error: "Todos os campos devem ser preenchidos." }),
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

    try {
      await updateProfileAndRequestFields({
        full_name: fullName,
        email,
        whatsapp,
        block,
        apartment
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error:
            error instanceof Error
              ? error.message
              : "Falha ao atualizar dados do morador."
        }),
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
  }

  const targetProfileQuery = request.auth_user_id
    ? adminClient
        .from("profiles")
        .select("id, status")
        .eq("id", request.auth_user_id)
    : adminClient
        .from("profiles")
        .select("id, status")
        .eq("email", request.email);

  const { data: targetProfile, error: targetProfileError } =
    await targetProfileQuery.maybeSingle<ProfileRow>();

  if (targetProfileError) {
    return new Response(
      JSON.stringify({ error: "Falha ao verificar status do perfil." }),
      {
        status: 500,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  if (!targetProfile) {
    return new Response(
      JSON.stringify({ error: "Perfil do morador nao encontrado." }),
      {
        status: 404,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  if (action === "suspend") {
    if (request.status !== "approved" || targetProfile.status !== "approved") {
      return new Response(
        JSON.stringify({
          error: "Somente moradores aprovados podem ser suspensos."
        }),
        {
          status: 400,
          headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
        }
      );
    }
  }

  if (action === "reactivate") {
    if (request.status !== "approved" || targetProfile.status !== "suspended") {
      return new Response(
        JSON.stringify({
          error: "Somente moradores suspensos podem ser reativados."
        }),
        {
          status: 400,
          headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
        }
      );
    }
  }

  const nextStatus = action === "suspend" ? "suspended" : "approved";

  const profileUpdate = await adminClient
    .from("profiles")
    .update({ status: nextStatus })
    .eq("id", targetProfile.id);

  if (profileUpdate.error) {
    return new Response(
      JSON.stringify({ error: "Falha ao atualizar status do perfil." }),
      {
        status: 500,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  return new Response(JSON.stringify({ success: true, status: nextStatus }), {
    status: 200,
    headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
  });
});
