const SOLD_LISTINGS_STORAGE_KEY = "maayan:listings:sold-ids";

export interface SoldListingEntry {
  id: string;
  soldAt: string;
}

function parseSoldEntries(raw: string | null): SoldListingEntry[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    if (parsed.every(item => typeof item === "string")) {
      return parsed.map(id => ({ id, soldAt: new Date().toISOString() }));
    }

    return parsed.filter(
      (item): item is SoldListingEntry =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.soldAt === "string"
    );
  } catch {
    return [];
  }
}

export function readSoldListingEntries(): SoldListingEntry[] {
  if (typeof window === "undefined") return [];
  return parseSoldEntries(localStorage.getItem(SOLD_LISTINGS_STORAGE_KEY));
}

export function writeSoldListingEntries(entries: SoldListingEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOLD_LISTINGS_STORAGE_KEY, JSON.stringify(entries));
}
