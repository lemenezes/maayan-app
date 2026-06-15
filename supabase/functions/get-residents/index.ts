import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function buildCorsHeaders(req: Request, extraHeaders?: HeadersInit): Headers {
  const headers = new Headers(extraHeaders);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "authorization, x-client-info, apikey, content-type"
  );
  return headers;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req) });
  }

  if (req.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: buildCorsHeaders(req)
    });
  }

  // ── Verificar autenticação ───────────────────────────────────────────────
  const authHeader =
    req.headers.get("Authorization") ?? req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid Authorization header" }),
      {
        status: 401,
        headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
      }
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing bearer token" }), {
      status: 401,
      headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  const bearerToken = `Bearer ${token}`;

  // Client com sessão do usuário
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: bearerToken } },
    auth: { persistSession: false }
  });

  const {
    data: { user },
    error: userError
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  // ── Client com service role ─────────────────────────────────────────────
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  // ── Verificar admin ──────────────────────────────────────────────────────
  const { data: callerProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    callerProfile?.role !== "admin" ||
    callerProfile?.status !== "approved"
  ) {
    return new Response("Forbidden", {
      status: 403,
      headers: buildCorsHeaders(req)
    });
  }

  // ── Buscar access_requests com profiles ──────────────────────────────────
  const { data: requests, error: reqError } = await adminClient
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (reqError) {
    console.error("access_requests query error:", reqError);
    return new Response(JSON.stringify({ error: "Failed to fetch requests" }), {
      status: 500,
      headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  // ── Buscar profiles por auth_user_id ─────────────────────────────────────
  const authUserIds = Array.from(
    new Set(
      (requests ?? [])
        .map((r: any) => r.auth_user_id)
        .filter((id: string | null): id is string => Boolean(id))
    )
  );

  const profileById = new Map<string, any>();

  if (authUserIds.length > 0) {
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, email, status")
      .in("id", authUserIds);

    if (profiles) {
      for (const p of profiles) {
        profileById.set(p.id, p);
      }
    }
  }

  // ── Buscar profiles por email ────────────────────────────────────────────
  const profileByEmail = new Map<string, any>();
  const emails = Array.from(
    new Set(
      (requests ?? [])
        .map((r: any) => r.email?.trim().toLowerCase())
        .filter((e: string | null): e is string => Boolean(e))
    )
  );

  if (emails.length > 0) {
    const { data: profilesByEmail } = await adminClient
      .from("profiles")
      .select("email, status")
      .in("email", emails);

    if (profilesByEmail) {
      for (const p of profilesByEmail) {
        if (p.email) {
          profileByEmail.set(p.email.trim().toLowerCase(), p);
        }
      }
    }
  }

  // ── Enriquecer access_requests com dados de profile ──────────────────────
  const enriched = (requests ?? []).map((req: any) => {
    const profileViaId = req.auth_user_id
      ? profileById.get(req.auth_user_id)
      : null;
    const profileViaEmail = profileByEmail.get(req.email?.trim().toLowerCase());
    const profile = profileViaId ?? profileViaEmail;

    let operational_status: string;
    if (profile?.status) {
      operational_status = profile.status;
    } else if (req.status === "approved") {
      operational_status = "inconsistent";
    } else {
      operational_status = req.status;
    }

    return {
      ...req,
      operational_status,
      has_profile: !!profile
    };
  });

  return new Response(JSON.stringify(enriched), {
    status: 200,
    headers: buildCorsHeaders(req, { "Content-Type": "application/json" })
  });
});
