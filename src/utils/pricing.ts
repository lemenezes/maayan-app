import type { Category, Listing, ListingPriceMode } from "../types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

export interface PriceModeOption {
  value: ListingPriceMode;
  label: string;
}

export function defaultPriceModeForCategory(
  category: Category
): ListingPriceMode {
  switch (category) {
    case "servicos":
      return "hour";
    case "imoveis":
      return "sale";
    case "doacao":
      return "free";
    default:
      return "fixed";
  }
}

export function getPriceModeOptions(category: Category): PriceModeOption[] {
  if (category === "servicos") {
    return [
      { value: "hour", label: "Por hora" },
      { value: "day", label: "Por diária" },
      { value: "project", label: "Por projeto" },
      { value: "quote", label: "Sob consulta" }
    ];
  }

  if (category === "imoveis") {
    return [
      { value: "sale", label: "Venda" },
      { value: "monthly", label: "Aluguel mensal" },
      { value: "season", label: "Temporada" }
    ];
  }

  return [];
}

export function shouldShowPriceInput(category: Category): boolean {
  return category !== "doacao";
}

export function shouldRequirePriceValue(
  category: Category,
  priceMode: ListingPriceMode
): boolean {
  if (category === "doacao") return false;
  if (category === "indicacoes") return false;
  if (category === "servicos" && priceMode === "quote") return false;
  return true;
}

export function formatListingPrice(
  listing: Pick<Listing, "category" | "price" | "priceMode">
): string | null {
  const priceMode =
    listing.priceMode ?? defaultPriceModeForCategory(listing.category);

  if (priceMode === "free") return "Gratuito";
  if (priceMode === "quote") return "Sob consulta";
  if (listing.price === undefined) return null;

  const amount = currencyFormatter.format(listing.price);

  switch (priceMode) {
    case "hour":
      return `${amount}/h`;
    case "day":
      return `${amount}/dia`;
    case "project":
      return `${amount}/projeto`;
    case "monthly":
      return `${amount}/mês`;
    case "season":
      return `${amount}/noite`;
    case "sale":
    case "fixed":
    default:
      return amount;
  }
}
