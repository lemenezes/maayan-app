const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

const FRIENDLY_SITE_NAMES: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /mercadolivre|mercadolibre|ml\.com/i, label: "Mercado Livre" },
  { pattern: /olx/i, label: "OLX" },
  { pattern: /amazon/i, label: "Amazon" }
];

function splitTrailingPunctuation(rawUrl: string): {
  cleanUrl: string;
  trailing: string;
} {
  const match = rawUrl.match(/[).,!?;:]+$/);
  if (!match) {
    return { cleanUrl: rawUrl, trailing: "" };
  }

  const trailing = match[0];
  const cleanUrl = rawUrl.slice(0, -trailing.length);
  return { cleanUrl, trailing };
}

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `https://${url}`;
}

function getFriendlySiteName(href: string): string | null {
  try {
    const hostname = new URL(href).hostname.replace(/^www\./i, "");
    const mapped = FRIENDLY_SITE_NAMES.find(item =>
      item.pattern.test(hostname)
    );
    return mapped?.label ?? null;
  } catch {
    return null;
  }
}

function normalizeTextWithoutUrls(text: string): string {
  return text
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .trim();
}

export interface ExtractedExternalLink {
  href: string;
  siteName: string | null;
}

export function extractExternalLinksFromText(text: string): {
  descriptionText: string;
  links: ExtractedExternalLink[];
} {
  const links: ExtractedExternalLink[] = [];
  let textWithoutUrls = text;
  const seen = new Set<string>();

  for (const match of text.matchAll(URL_REGEX)) {
    const rawUrl = match[0];
    if (!rawUrl) continue;

    const { cleanUrl, trailing } = splitTrailingPunctuation(rawUrl);
    const href = toAbsoluteUrl(cleanUrl);
    if (!seen.has(href)) {
      links.push({ href, siteName: getFriendlySiteName(href) });
      seen.add(href);
    }

    textWithoutUrls = textWithoutUrls.replace(rawUrl, trailing ? trailing : "");
  }

  return {
    descriptionText: normalizeTextWithoutUrls(textWithoutUrls),
    links
  };
}
