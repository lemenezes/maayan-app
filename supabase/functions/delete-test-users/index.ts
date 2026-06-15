import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

Deno.serve(async req => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const token = authHeader.slice(7);

    // Cliente com service role para verificar e executar
    const client = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: user, error: userError } = await client.auth.getUser(token);

    if (userError || !user?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar se é admin
    const { data: profiles } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.user.id)
      .single();

    if (!profiles || profiles.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: Must be admin" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "email must be provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Chamar função SQL via RPC
    const { data, error } = await client.rpc("delete_test_user_and_auth", {
      email_to_delete: email
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
