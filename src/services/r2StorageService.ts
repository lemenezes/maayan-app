const DEFAULT_WORKER_URL =
  "https://maayan-r2-images.consudes-upload.workers.dev";
const DEFAULT_CDN_BASE_URL = "https://cdn.maayan.leandrom.com.br";

interface UploadResult {
  url: string;
  key: string;
}

function getWorkerBaseUrl(): string {
  const value =
    (import.meta.env.VITE_R2_IMAGES_WORKER_URL as string | undefined) ??
    DEFAULT_WORKER_URL;
  return value.replace(/\/$/, "");
}

function getUploadSecret(): string {
  const secret =
    (import.meta.env.VITE_R2_UPLOAD_SECRET as string | undefined) ?? "";
  if (!secret) {
    throw new Error("VITE_R2_UPLOAD_SECRET não configurado.");
  }
  return secret;
}

function normalizeBase(url: string): string {
  return url.replace(/\/$/, "").toLowerCase();
}

export function isR2CdnUrl(url: string): boolean {
  try {
    const cdnBase = normalizeBase(
      (import.meta.env.VITE_R2_CDN_URL as string | undefined) ??
        DEFAULT_CDN_BASE_URL
    );
    return normalizeBase(url).startsWith(cdnBase + "/");
  } catch {
    return false;
  }
}

export async function uploadListingImageToR2(
  file: File,
  listingId: string
): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("listingId", listingId);

  const response = await fetch(`${getWorkerBaseUrl()}/upload`, {
    method: "POST",
    headers: {
      "x-upload-secret": getUploadSecret()
    },
    body: form
  });

  const payload = (await response.json().catch(() => ({}))) as {
    url?: string;
    key?: string;
    error?: string;
  };

  if (!response.ok || !payload.url || !payload.key) {
    throw new Error(
      payload.error ?? `Falha no upload de imagem (${response.status}).`
    );
  }

  return { url: payload.url, key: payload.key };
}

export async function deleteListingImageFromR2(urlOrKey: {
  url?: string;
  key?: string;
}): Promise<void> {
  const response = await fetch(`${getWorkerBaseUrl()}/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-upload-secret": getUploadSecret()
    },
    body: JSON.stringify(urlOrKey)
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(
      payload.error ?? `Falha ao remover imagem (${response.status}).`
    );
  }
}
