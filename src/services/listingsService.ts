import { supabase } from "../lib/supabase";
import type { ListingInsert, ListingStatus } from "../lib/database.types";
import type { Listing } from "../types";
import type { ListingWithStatus } from "../types";
import type { Category } from "../types";
import type { ListingPriceMode } from "../types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

// Map DB row → frontend Listing shape
function rowToListing(row: {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  price_mode: string | null;
  whatsapp: string;
  image_url: string | null;
  image_urls: string[] | null;
  user_id: string;
  author_name: string;
  status: string;
  sold_at: string | null;
  created_at: string;
}): ListingWithStatus {
  const images =
    row.image_urls && row.image_urls.length > 0
      ? row.image_urls
      : row.image_url
        ? [row.image_url]
        : [];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as Category,
    price: row.price ?? undefined,
    priceMode: row.price_mode
      ? (row.price_mode as ListingPriceMode)
      : undefined,
    whatsapp: row.whatsapp,
    images,
    authorName: row.author_name,
    createdAt: row.created_at,
    status: row.status as ListingStatus,
    soldAt: row.sold_at
  };
}

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToListing);
}

export async function fetchUserListings(
  userId: string
): Promise<ListingWithStatus[]> {
  // In mock auth mode, user id may not be a UUID accepted by Postgres.
  if (!isUuid(userId)) return [];

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "sold"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToListing);
}

export async function fetchListingById(
  id: string
): Promise<ListingWithStatus | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(error.message);
  }
  return data ? rowToListing(data) : null;
}

export interface CreateListingInput {
  title: string;
  description: string;
  category: Category;
  price?: number;
  priceMode: ListingPriceMode;
  whatsapp: string;
  imageFiles?: File[];
  authorName: string;
  userId: string;
}

const MAX_IMAGES = 4;

export async function createListing(
  input: CreateListingInput
): Promise<Listing> {
  const imageUrls: string[] = [];

  if (input.imageFiles && input.imageFiles.length > 0) {
    const files = input.imageFiles.slice(0, MAX_IMAGES);
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${input.userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("listings")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        if (
          uploadError.message.toLowerCase().includes("bucket") ||
          uploadError.message.toLowerCase().includes("not found")
        ) {
          throw new Error(
            'O bucket de imagens não existe. Crie o bucket "listings" no painel do Supabase em Storage → New Bucket (nome: listings, public: true).'
          );
        }
        throw new Error(`Falha no upload: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from("listings")
        .getPublicUrl(path);
      imageUrls.push(urlData.publicUrl);
    }
  }

  const insert: ListingInsert = {
    title: input.title,
    description: input.description,
    category: input.category,
    price: input.price ?? null,
    price_mode: input.priceMode,
    whatsapp: input.whatsapp,
    image_url: imageUrls[0] ?? null,
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    user_id: input.userId,
    author_name: input.authorName,
    status: "active",
    sold_at: null
  };

  const { data, error } = await supabase
    .from("listings")
    .insert(insert)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToListing(data);
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deactivateListing(id: string): Promise<void> {
  const { error } = await supabase
    .from("listings")
    .update({ status: "archived", sold_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reactivateListing(id: string): Promise<void> {
  const { error } = await supabase
    .from("listings")
    .update({ status: "active", sold_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markListingAsSold(id: string): Promise<void> {
  const { error } = await supabase
    .from("listings")
    .update({ status: "sold", sold_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export interface UpdateListingInput {
  title: string;
  description: string;
  category: Category;
  price?: number;
  priceMode: ListingPriceMode;
  /** URLs that were already saved and should be kept */
  keptImageUrls: string[];
  /** New files to upload */
  newImageFiles: File[];
  userId: string;
}

/** Extract storage path from a Supabase Storage public URL */
function storagePathFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // /storage/v1/object/public/listings/<path>
    const match = u.pathname.match(
      /\/storage\/v1\/object\/public\/listings\/(.+)/
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function updateListing(
  id: string,
  input: UpdateListingInput
): Promise<Listing> {
  // 1. Fetch current image_urls to detect removed ones
  const { data: current, error: fetchErr } = await supabase
    .from("listings")
    .select("image_urls, image_url")
    .eq("id", id)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);

  const prevUrls: string[] =
    current.image_urls && current.image_urls.length > 0
      ? current.image_urls
      : current.image_url
        ? [current.image_url]
        : [];

  // 2. Delete removed images from storage (best effort)
  const removedUrls = prevUrls.filter(u => !input.keptImageUrls.includes(u));
  for (const url of removedUrls) {
    const path = storagePathFromUrl(url);
    if (path) {
      await supabase.storage.from("listings").remove([path]);
    }
  }

  // 3. Upload new images
  const uploadedUrls: string[] = [];
  for (const file of input.newImageFiles) {
    const ext = file.name.split(".").pop();
    const path = `${input.userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("listings")
      .upload(path, file, { upsert: false });
    if (upErr) throw new Error(`Falha no upload: ${upErr.message}`);
    const { data: urlData } = supabase.storage
      .from("listings")
      .getPublicUrl(path);
    uploadedUrls.push(urlData.publicUrl);
  }

  // 4. Final image list (kept + new), capped at MAX_IMAGES
  const finalUrls = [...input.keptImageUrls, ...uploadedUrls].slice(
    0,
    MAX_IMAGES
  );

  // 5. Update DB
  const { data, error } = await supabase
    .from("listings")
    .update({
      title: input.title,
      description: input.description,
      category: input.category,
      price: input.price ?? null,
      price_mode: input.priceMode,
      image_url: finalUrls[0] ?? null,
      image_urls: finalUrls.length > 0 ? finalUrls : null
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToListing(data);
}

// ─── Admin functions ─────────────────────────────────────────────────────────
// These require the caller to have admin role in RLS policies.

export async function fetchAllListingsAdmin(): Promise<
  (ListingWithStatus & { userId: string })[]
> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({
    ...rowToListing(row),
    userId: row.user_id
  }));
}

export async function setListingStatus(
  id: string,
  status: ListingStatus
): Promise<void> {
  const payload =
    status === "sold"
      ? { status, sold_at: new Date().toISOString() }
      : { status, sold_at: null };

  const { error } = await supabase
    .from("listings")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function fetchUserRole(userId: string): Promise<"admin" | "user"> {
  if (!isUuid(userId)) return "user";

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) return "user";
  return data.role as "admin" | "user";
}
