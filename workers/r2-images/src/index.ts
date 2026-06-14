interface Env {
  MAAYAN_LISTINGS_BUCKET: R2Bucket;
  UPLOAD_SECRET: string;
  APP_ORIGIN?: string;
  CDN_PUBLIC_URL?: string;
}

const DEFAULT_APP_ORIGIN = "https://maayan.leandrom.com.br";
const DEFAULT_CDN_URL = "https://cdn.maayan.leandrom.com.br";
const SECRET_HEADER = "x-upload-secret";

function buildCorsHeaders(origin: string, env: Env): Headers {
  const allowedOrigin = env.APP_ORIGIN || DEFAULT_APP_ORIGIN;
  const allowedOrigins = new Set([
    allowedOrigin,
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ]);
  const responseOrigin = allowedOrigins.has(origin) ? origin : allowedOrigin;

  return new Headers({
    "Access-Control-Allow-Origin": responseOrigin,
    "Access-Control-Allow-Methods": "OPTIONS, POST, DELETE",
    "Access-Control-Allow-Headers": "Content-Type, x-upload-secret",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  });
}

function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Headers
): Response {
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), { status, headers });
}

function extractExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.trim().toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }

  const mime = file.type.toLowerCase();
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";

  return "bin";
}

function buildKey(listingId: string, file: File): string {
  const safeListingId = listingId.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(safeListingId)) {
    throw new Error("listingId invalido. Use apenas letras, numeros, _ e -");
  }

  const timestamp = Date.now();
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  const ext = extractExtension(file);

  return `listings/${safeListingId}/${timestamp}-${random}.${ext}`;
}

function urlToKey(url: string): string {
  const parsed = new URL(url);
  return parsed.pathname.replace(/^\/+/, "");
}

function getDeleteKey(payload: { url?: string; key?: string }): string {
  if (typeof payload.key === "string" && payload.key.trim()) {
    return payload.key.trim();
  }

  if (typeof payload.url === "string" && payload.url.trim()) {
    return urlToKey(payload.url.trim());
  }

  throw new Error("Informe 'key' ou 'url' para deletar");
}

function isAuthorized(request: Request, env: Env): boolean {
  const received = request.headers.get(SECRET_HEADER);
  return Boolean(env.UPLOAD_SECRET) && received === env.UPLOAD_SECRET;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";
    const corsHeaders = buildCorsHeaders(origin, env);
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "POST" && pathname === "/upload") {
      if (!isAuthorized(request, env)) {
        return jsonResponse({ error: "Nao autorizado" }, 401, corsHeaders);
      }

      try {
        const formData = await request.formData();
        const fileEntry = formData.get("file");
        const listingIdEntry = formData.get("listingId");

        if (!(fileEntry instanceof File)) {
          return jsonResponse(
            { error: "Campo 'file' obrigatorio" },
            400,
            corsHeaders
          );
        }

        if (typeof listingIdEntry !== "string" || !listingIdEntry.trim()) {
          return jsonResponse(
            { error: "Campo 'listingId' obrigatorio" },
            400,
            corsHeaders
          );
        }

        const key = buildKey(listingIdEntry, fileEntry);
        const contentType = fileEntry.type || "application/octet-stream";

        await env.MAAYAN_LISTINGS_BUCKET.put(key, fileEntry.stream(), {
          httpMetadata: {
            contentType
          }
        });

        const cdnBase = (env.CDN_PUBLIC_URL || DEFAULT_CDN_URL).replace(
          /\/$/,
          ""
        );
        const url = `${cdnBase}/${key}`;

        return jsonResponse({ url, key }, 200, corsHeaders);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro ao processar upload";
        return jsonResponse({ error: message }, 400, corsHeaders);
      }
    }

    if (request.method === "DELETE" && pathname === "/delete") {
      if (!isAuthorized(request, env)) {
        return jsonResponse({ error: "Nao autorizado" }, 401, corsHeaders);
      }

      try {
        const payload = (await request.json()) as {
          url?: string;
          key?: string;
        };
        const key = getDeleteKey(payload);

        if (!key.startsWith("listings/")) {
          return jsonResponse(
            {
              error:
                "Somente paths iniciando com 'listings/' podem ser deletados"
            },
            400,
            corsHeaders
          );
        }

        await env.MAAYAN_LISTINGS_BUCKET.delete(key);
        return jsonResponse({ ok: true, key }, 200, corsHeaders);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro ao deletar arquivo";
        return jsonResponse({ error: message }, 400, corsHeaders);
      }
    }

    return jsonResponse({ error: "Rota nao encontrada" }, 404, corsHeaders);
  }
};
