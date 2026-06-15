import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = authHeader.slice(7);

    // Cliente anon para verificar se é admin
    const anonClient = createClient(supabaseUrl, authHeader.slice(7), {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: user, error: userError } = await anonClient.auth.getUser(
      token
    );

    if (userError || !user?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar se é admin
    const { data: profiles, error: profileError } = await anonClient
      .from("profiles")
      .select("role")
      .eq("id", user.user.id)
      .single();

    if (profileError || !profiles || profiles.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: Must be admin" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Cliente com service role para deletar usuários
    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Parse request body para pegar user IDs
    const { userIds } = await req.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "userIds must be a non-empty array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Deletar cada usuário
    const results = [];
    for (const userId of userIds) {
      try {
        const { error } = await serviceClient.auth.admin.deleteUser(userId);

        if (error) {
          results.push({
            userId,
            success: false,
            error: error.message,
          });
        } else {
          results.push({
            userId,
            success: true,
            message: "User deleted",
          });
        }
      } catch (e) {
        results.push({
          userId,
          success: false,
          error: String(e),
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
