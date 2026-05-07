// Auto-generated types for the Supabase schema.
// Re-run `supabase gen types typescript` after schema changes.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: 'venda' | 'servicos' | 'indicacoes' | 'doacao';
          price: number | null;
          whatsapp: string;
          image_url: string | null;
          image_urls: string[] | null;
          user_id: string;
          author_name: string;
          apartment: string | null;
          status: 'active' | 'inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: 'venda' | 'servicos' | 'indicacoes' | 'doacao';
          price?: number | null;
          whatsapp: string;
          image_url?: string | null;
          image_urls?: string[] | null;
          user_id: string;
          author_name: string;
          apartment?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: 'venda' | 'servicos' | 'indicacoes' | 'doacao';
          price?: number | null;
          whatsapp?: string;
          image_url?: string | null;
          image_urls?: string[] | null;
          user_id?: string;
          author_name?: string;
          apartment?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ListingRow = Database['public']['Tables']['listings']['Row'];
export type ListingInsert = Database['public']['Tables']['listings']['Insert'];
