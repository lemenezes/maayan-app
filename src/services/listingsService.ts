import { supabase } from '../lib/supabase';
import type { ListingInsert } from '../lib/database.types';
import type { Listing } from '../types';
import type { Category } from '../types';

// Map DB row → frontend Listing shape
function rowToListing(row: {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  whatsapp: string;
  image_url: string | null;
  image_urls: string[] | null;
  user_id: string;
  author_name: string;
  apartment: string | null;
  status: string;
  created_at: string;
}): Listing {
  // prefer image_urls array, fall back to legacy image_url
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
    whatsapp: row.whatsapp,
    images,
    authorName: row.author_name,
    apartment: row.apartment ?? undefined,
    createdAt: row.created_at,
  };
}

export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToListing);
}

export interface CreateListingInput {
  title: string;
  description: string;
  category: Category;
  price?: number;
  whatsapp: string;
  imageFiles?: File[];
  authorName: string;
  apartment?: string;
  userId: string;
}

const MAX_IMAGES = 4;

export async function createListing(input: CreateListingInput): Promise<Listing> {
  const imageUrls: string[] = [];

  if (input.imageFiles && input.imageFiles.length > 0) {
    const files = input.imageFiles.slice(0, MAX_IMAGES);
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${input.userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(path, file, { upsert: false });

      if (uploadError) {
        if (
          uploadError.message.toLowerCase().includes('bucket') ||
          uploadError.message.toLowerCase().includes('not found')
        ) {
          throw new Error(
            'O bucket de imagens não existe. Crie o bucket "listings" no painel do Supabase em Storage → New Bucket (nome: listings, public: true).',
          );
        }
        throw new Error(`Falha no upload: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage.from('listings').getPublicUrl(path);
      imageUrls.push(urlData.publicUrl);
    }
  }

  const insert: ListingInsert = {
    title: input.title,
    description: input.description,
    category: input.category,
    price: input.price ?? null,
    whatsapp: input.whatsapp,
    image_url: imageUrls[0] ?? null,
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    user_id: input.userId,
    author_name: input.authorName,
    apartment: input.apartment ?? null,
    status: 'active',
  };

  const { data, error } = await supabase
    .from('listings')
    .insert(insert)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToListing(data);
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deactivateListing(id: string): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .update({ status: 'inactive' })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
