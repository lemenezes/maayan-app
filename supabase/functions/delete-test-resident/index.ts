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
const REQUIRED_CONFIRMATION = "EXCLUIR TESTE";

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

function isLikelyTestData(request: AccessRequestRow): boolean {
  const text = `${request.full_name} ${request.email} ${request.message ?? ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const hints = [
    "teste",
    "test",
    "qa",
    "sandbox",
    "demo",
    "exemplo",
    "example",
    "fake",
    "dummy",
    "temp"
  ];

  return hints.some(hint => text.includes(hint));
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

  if (confirmationText !== REQUIRED_CONFIRMATION) {
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

  if (!isLikelyTestData(request)) {
    return new Response(
      JSON.stringify({
        error:
          "Exclusão permitida apenas para dados de teste. Registro não parece ser de teste."
      }),
      {
        status: 403,
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

  return new Response(
    JSON.stringify({
      success: true,
      removedAccessRequestId: requestId,
      deletedProfile,
      deletedAuthUser
    }),
    {
      status: 200,
      headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
    }
  );
});
