import type { Listing } from "../types";

/** Returns the canonical URL for a listing detail page */
export function buildListingUrl(listing: Listing): string {
  return `${window.location.origin}/anuncios/${listing.id}`;
}

/**
 * Builds a wa.me URL with a pre-filled message.
 * For "indicacoes", uses the indicated contact and avoids portal links.
 * For other categories, includes listing title and direct link.
 */
export function buildWhatsAppUrl(listing: Listing): string {
  const contactPhone =
    listing.category === "indicacoes"
      ? (listing.referralWhatsapp ?? listing.whatsapp)
      : listing.whatsapp;

  const phone = `55${contactPhone.replace(/\D/g, "")}`;
  const base = `https://wa.me/${phone}`;

  if (listing.category === "indicacoes") {
    const message =
      "Olá! Seu contato foi compartilhado no Portal Maayan como uma indicação. Gostaria de mais informações sobre o seu serviço.";

    return `${base}?text=${encodeURIComponent(message)}`;
  }

  if (listing.category === "venda" || listing.category === "imoveis") {
    const message = [
      "Olá! Tenho interesse no anúncio:",
      "",
      `"${listing.title}"`,
      "",
      `Link:\n${buildListingUrl(listing)}`,
      "",
      "Ainda está disponível?"
    ].join("\n");

    return `${base}?text=${encodeURIComponent(message)}`;
  }

  // Other categories: message with listing link
  const message = [
    `Olá! Vi seu anúncio "${listing.title}" no Maayan e gostaria de mais informações.`,
    "",
    `Link:\n${buildListingUrl(listing)}`
  ].join("\n");
  return `${base}?text=${encodeURIComponent(message)}`;
}
