import { createClient } from "@supabase/supabase-js";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "lemenezes@gmail.com";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://maayan.app";
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";

const AUTO_EMAIL_FOOTER = `
  <div style="margin-top:24px;padding-top:18px;border-top:1px solid #e2e8f0">
    <a href="${SITE_URL}"
       style="display:inline-block;background:#0C5A86;color:#fff;text-decoration:none;font-weight:600;padding:11px 18px;border-radius:10px;font-size:13px;margin-bottom:12px">
      Acessar Maayan Desapego
    </a>
    <p style="margin:0;font-size:11px;line-height:1.5;color:#94a3b8">
      Este é um e-mail automático do Maayan Desapego. Por favor, não responda esta mensagem.
      Para dúvidas ou informações, acesse o portal e utilize os canais de contato disponíveis no site.
    </p>
  </div>
`;

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Validate shared secret
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
    "old_status:",
    old_record?.status
  );

  if (!record) return new Response("No record", { status: 200 });

  const userId = record.user_id as string;
  const title = record.title as string;
  const listingId = record.id as string;
  const newStatus = record.status as string;
  const oldStatus = old_record?.status as string | undefined;

  // Determine which email to send
  const isBrandNew = type === "INSERT" && newStatus === "pending";
  const justApproved =
    type === "UPDATE" && newStatus === "active" && oldStatus !== "active";
  const justRejected =
    type === "UPDATE" && newStatus === "rejected" && oldStatus !== "rejected";

  if (!isBrandNew && !justApproved && !justRejected) {
    console.log("No email needed for this event");
    return new Response("No email needed", { status: 200 });
  }

  console.log(
    "Sending email to userId:",
    userId,
    "event:",
    isBrandNew ? "new" : justApproved ? "approved" : "rejected"
  );

  // Get user email from auth.users via service role
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const { data: userData, error: userError } =
    await supabase.auth.admin.getUserById(userId);
  if (userError || !userData?.user?.email) {
    console.error("Could not fetch user email:", userError);
    return new Response("User not found", { status: 200 });
  }

  const email = userData.user.email;
  const listingUrl = `${SITE_URL}/anuncios/${listingId}`;

  let subject: string;
  let html: string;

  if (isBrandNew) {
    subject = `Anúncio recebido: "${title}"`;
    html = `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1e293b">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700">Anúncio enviado com sucesso!</h2>
        <p style="margin:0 0 16px;color:#64748b">Seu anúncio <strong>"${title}"</strong> foi recebido e está aguardando aprovação do administrador do condomínio.</p>
        <p style="margin:0 0 24px;color:#64748b">Você receberá um novo e-mail assim que ele for revisado.</p>
        <div style="background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #e2e8f0;margin-bottom:24px">
          <p style="margin:0;font-size:13px;color:#94a3b8">🕐 Status atual: <strong style="color:#d97706">Aguardando aprovação</strong></p>
        </div>
        ${AUTO_EMAIL_FOOTER}
        <p style="margin:0;font-size:12px;color:#94a3b8">Desapega Maayan — Classificados do Condomínio</p>
      </div>
    `;
  } else if (justApproved) {
    subject = `Anúncio aprovado: "${title}" já está visível!`;
    html = `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1e293b">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700">Seu anúncio foi aprovado! 🎉</h2>
        <p style="margin:0 0 16px;color:#64748b">O anúncio <strong>"${title}"</strong> foi aprovado e já está visível para todos os moradores do condomínio.</p>
        <a href="${listingUrl}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#9333ea);color:#fff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:9999px;margin-bottom:24px">
          Ver meu anúncio
        </a>
        ${AUTO_EMAIL_FOOTER}
        <p style="margin:0;font-size:12px;color:#94a3b8">Desapega Maayan — Classificados do Condomínio</p>
      </div>
    `;
  } else {
    subject = `Anúncio não aprovado: "${title}"`;
    html = `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1e293b">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700">Anúncio não aprovado</h2>
        <p style="margin:0 0 16px;color:#64748b">O anúncio <strong>"${title}"</strong> não foi aprovado pelo administrador.</p>
        <p style="margin:0 0 24px;color:#64748b">Se tiver dúvidas, entre em contato com a administração do condomínio.</p>
        ${AUTO_EMAIL_FOOTER}
        <p style="margin:0;font-size:12px;color:#94a3b8">Desapega Maayan — Classificados do Condomínio</p>
      </div>
    `;
  }

  // Send via Resend
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `Maayan Desapego <${FROM_EMAIL}>`,
      to: [email],
      bcc: ADMIN_EMAIL,
      subject,
      html
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return new Response("Email failed", { status: 500 });
  }

  console.log("Email sent successfully to:", email);
  return new Response("OK", { status: 200 });
});
