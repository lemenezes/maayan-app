/**
 * notify-access-request
 *
 * Chamada por Database Webhook quando há INSERT em public.access_requests.
 * Envia email ao admin informando a nova solicitação de acesso.
 *
 * Configuração do webhook no Supabase Dashboard:
 *   Database → Webhooks → Create new webhook
 *   Table: access_requests | Event: INSERT
 *   HTTP URL: https://<project>.supabase.co/functions/v1/notify-access-request
 *   Headers: { "x-webhook-secret": "<WEBHOOK_SECRET>" }
 */

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "lemenezes@gmail.com";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://maayan.leandrom.com.br";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, unknown> | null;
}

Deno.serve(async (req: Request) => {
  console.log("notify-access-request called", req.method);

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch (e) {
    console.error("Failed to parse JSON body:", e);
    return new Response("Invalid JSON", { status: 400 });
  }

  console.log(
    "Payload type:",
    payload.type,
    "record:",
    JSON.stringify(payload.record)?.slice(0, 100)
  );

  // Só processa novos INSERT com status pending
  if (payload.type !== "INSERT" || !payload.record) {
    console.log("Skipped — not an INSERT or no record");
    return new Response("Skipped", { status: 200 });
  }

  const r = payload.record;
  const requestId = r.id as string;
  const fullName = r.full_name as string;
  const email = r.email as string;
  const block = r.block as string;
  const apartment = r.apartment as string;
  const message = r.message as string | null;
  const adminUrl = `${SITE_URL}/admin/moradores?requestId=${encodeURIComponent(requestId)}`;

  const subject = `Nova solicitação de acesso — ${fullName}`;
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1e293b">
      <div style="background:#0A3D62;border-radius:16px;padding:24px;margin-bottom:24px;text-align:center">
        <h1 style="margin:0;font-size:20px;font-weight:700;color:#fff">Maayan · Nova solicitação de acesso</h1>
      </div>

      <h2 style="margin:0 0 16px;font-size:18px;font-weight:700">Detalhes da solicitação</h2>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr style="border-bottom:1px solid #e2e8f0">
          <td style="padding:10px 0;color:#64748b;font-size:13px;width:130px">Nome</td>
          <td style="padding:10px 0;font-weight:600;font-size:13px">${fullName}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0">
          <td style="padding:10px 0;color:#64748b;font-size:13px">E-mail</td>
          <td style="padding:10px 0;font-weight:600;font-size:13px">${email}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0">
          <td style="padding:10px 0;color:#64748b;font-size:13px">Bloco</td>
          <td style="padding:10px 0;font-weight:600;font-size:13px">${block}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0">
          <td style="padding:10px 0;color:#64748b;font-size:13px">Apartamento</td>
          <td style="padding:10px 0;font-weight:600;font-size:13px">${apartment}</td>
        </tr>
        ${
          message
            ? `<tr>
          <td style="padding:10px 0;color:#64748b;font-size:13px;vertical-align:top">Mensagem</td>
          <td style="padding:10px 0;font-size:13px;font-style:italic">"${message}"</td>
        </tr>`
            : ""
        }
      </table>

      <a href="${adminUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#0C5A86,#1DAFD9);color:#fff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:12px;font-size:14px;margin-bottom:24px">
        Revisar no painel →
      </a>

      <p style="margin:0;font-size:11px;color:#94a3b8">Maayan · Condomínio Cidade Jardim</p>
    </div>
  `;

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return new Response("Email skipped (no API key)", { status: 200 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: `Maayan Desapego <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject,
      html
    })
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend error:", body);
    return new Response("Email failed", { status: 500 });
  }

  return new Response("Email sent", { status: 200 });
});
