import { createClient } from "@supabase/supabase-js";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "lemenezes@gmail.com";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://maayan.app";
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
}

type ListingAction =
  | "created"
  | "edited"
  | "sold"
  | "archived"
  | "deleted"
  | "reactivated";

const ACTION_LABELS: Record<ListingAction, string> = {
  created: "✅ Novo anúncio publicado",
  edited: "✏️ Anúncio editado",
  sold: "🏷️ Anúncio marcado como vendido",
  archived: "📦 Anúncio arquivado/desativado",
  deleted: "🗑️ Anúncio excluído pelo morador",
  reactivated: "🔄 Anúncio reativado"
};

// ─── Detectar ação ────────────────────────────────────────────────────────────

function detectAction(
  type: "INSERT" | "UPDATE" | "DELETE",
  newStatus: string,
  oldStatus?: string
): ListingAction | null {
  if (type === "INSERT") return "created";

  if (type === "UPDATE") {
    if (newStatus === "deleted") return "deleted";
    if (newStatus === "sold" && oldStatus !== "sold") return "sold";
    if (newStatus === "archived" && oldStatus !== "archived") return "archived";
    // Reativação explícita (ex.: sold/archived -> active)
    if (
      newStatus === "active" &&
      oldStatus !== undefined &&
      oldStatus !== "active"
    )
      return "reactivated";
    // Qualquer outro UPDATE (edição de conteúdo, active→active, old_record ausente)
    return "edited";
  }

  return null;
}

// ─── Template do e-mail para admin ───────────────────────────────────────────

function buildAdminEmail(opts: {
  action: ListingAction;
  listingId: string;
  title: string;
  category: string;
  authorName: string;
  userEmail: string;
  userWhatsapp: string | null;
  userBlock: string | null;
  userApartment: string | null;
  referralName: string | null;
  referralWhatsapp: string | null;
  eventAt: string;
}): { subject: string; html: string } {
  const {
    action,
    listingId,
    title,
    category,
    authorName,
    userEmail,
    userWhatsapp,
    userBlock,
    userApartment,
    referralName,
    referralWhatsapp,
    eventAt
  } = opts;

  const listingUrl = `${SITE_URL}/anuncios/${listingId}`;
  const adminUrl = `${SITE_URL}/admin/anuncios`;
  const actionLabel = ACTION_LABELS[action];

  const dateFormatted = new Date(eventAt).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const categoryLabels: Record<string, string> = {
    venda: "Venda",
    servicos: "Serviços",
    indicacoes: "Indicações",
    doacao: "Doação",
    imoveis: "Imóveis"
  };
  const categoryLabel = categoryLabels[category] ?? category;

  const referralSection =
    category === "indicacoes" && (referralName || referralWhatsapp)
      ? `
        <tr>
          <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;padding-right:12px">Indicado:</td>
          <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500">${referralName ?? "—"}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;padding-right:12px">WhatsApp indicado:</td>
          <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500">${referralWhatsapp ?? "—"}</td>
        </tr>`
      : "";

  const locationText =
    userBlock && userApartment
      ? `Bloco ${userBlock}, Apto ${userApartment}`
      : userBlock
        ? `Bloco ${userBlock}`
        : userApartment
          ? `Apto ${userApartment}`
          : "—";

  const subject = `[Maayan] ${actionLabel} — "${title}"`;

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#1e293b">

      <div style="margin-bottom:24px">
        <h2 style="margin:0 0 4px;font-size:20px;font-weight:700">${actionLabel}</h2>
        <p style="margin:0;font-size:13px;color:#94a3b8">${dateFormatted}</p>
      </div>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:20px">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8">Anúncio</p>
        <table style="border-collapse:collapse;width:100%">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;padding-right:12px">Título:</td>
            <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:600">"${title}"</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;padding-right:12px">Categoria:</td>
            <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500">${categoryLabel}</td>
          </tr>
          ${referralSection}
        </table>
      </div>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:24px">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8">Morador</p>
        <table style="border-collapse:collapse;width:100%">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;padding-right:12px">Nome:</td>
            <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500">${authorName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;padding-right:12px">E-mail:</td>
            <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;padding-right:12px">WhatsApp:</td>
            <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500">${userWhatsapp ?? "—"}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;padding-right:12px">Bloco/Apto:</td>
            <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500">${locationText}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom:28px">
        <a href="${listingUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#9333ea);color:#fff;text-decoration:none;font-weight:600;padding:11px 20px;border-radius:10px;font-size:13px;margin-right:10px">
          Ver anúncio
        </a>
        <a href="${adminUrl}"
           style="display:inline-block;background:#0C5A86;color:#fff;text-decoration:none;font-weight:600;padding:11px 20px;border-radius:10px;font-size:13px">
          Painel admin
        </a>
      </div>

      <p style="margin:0;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px">
        E-mail automático de auditoria — Portal Maayan
      </p>
    </div>
  `;

  return { subject, html };
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Validar segredo compartilhado
  if (
    WEBHOOK_SECRET &&
    req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET
  ) {
    console.log("Unauthorized: invalid webhook secret");
    return new Response("Unauthorized", { status: 401 });
  }

  const payload: WebhookPayload = await req.json();
  const { type, record, old_record } = payload;

  console.log(
    "Webhook received:",
    type,
    "status:",
    record?.status,
    "old:",
    old_record?.status
  );

  if (!record) return new Response("No record", { status: 200 });

  const newStatus = record.status as string;
  const oldStatus = old_record?.status as string | undefined;

  const action = detectAction(type, newStatus, oldStatus);
  if (!action) {
    console.log("No admin notification needed for this event");
    return new Response("No notification needed", { status: 200 });
  }

  const userId = record.user_id as string;
  const listingId = record.id as string;
  const title = record.title as string;
  const category = record.category as string;
  const authorName = record.author_name as string;
  const referralName = (record.referral_name as string | null) ?? null;
  const referralWhatsapp = (record.referral_whatsapp as string | null) ?? null;
  const eventAt =
    (record.updated_at as string | null) ??
    (record.created_at as string) ??
    new Date().toISOString();

  // Buscar perfil do morador e e-mail via service role
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const [userResult, profileResult] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase
      .from("profiles")
      .select("whatsapp, block, apartment")
      .eq("id", userId)
      .single()
  ]);

  if (userResult.error || !userResult.data?.user?.email) {
    console.error("Could not fetch user email:", userResult.error);
    return new Response("User not found", { status: 200 });
  }

  const userEmail = userResult.data.user.email;
  const profile = profileResult.data;

  const { subject, html } = buildAdminEmail({
    action,
    listingId,
    title,
    category,
    authorName,
    userEmail,
    userWhatsapp: profile?.whatsapp ?? null,
    userBlock: profile?.block ?? null,
    userApartment: profile?.apartment ?? null,
    referralName,
    referralWhatsapp,
    eventAt
  });

  // Enviar para o admin via Resend
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `Portal Maayan <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject,
      html
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return new Response("Email failed", { status: 500 });
  }

  console.log(
    "Admin notification sent. Action:",
    action,
    "Listing:",
    listingId
  );
  return new Response("OK", { status: 200 });
});
