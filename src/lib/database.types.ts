// Auto-generated types for the Supabase schema.
// Re-run `supabase gen types typescript` after schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ListingStatus = "active" | "sold" | "archived";
export type ProfileRole = "user" | "resident" | "admin";
export type ProfileStatus = "pending" | "approved" | "rejected" | "suspended";
export type AccessRequestStatus = "pending" | "approved" | "rejected";
export type ListingPriceMode =
  | "fixed"
  | "hour"
  | "day"
  | "project"
  | "quote"
  | "sale"
  | "monthly"
  | "season"
  | "free";

export type Database = {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: "venda" | "servicos" | "indicacoes" | "doacao" | "imoveis";
          price: number | null;
          price_mode: ListingPriceMode | null;
          whatsapp: string;
          referral_name: string | null;
          referral_whatsapp: string | null;
          referral_notes: string | null;
          image_url: string | null;
          image_urls: string[] | null;
          user_id: string;
          author_name: string;
          status: ListingStatus;
          sold_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: "venda" | "servicos" | "indicacoes" | "doacao" | "imoveis";
          price?: number | null;
          price_mode?: ListingPriceMode | null;
          whatsapp: string;
          referral_name?: string | null;
          referral_whatsapp?: string | null;
          referral_notes?: string | null;
          image_url?: string | null;
          image_urls?: string[] | null;
          user_id: string;
          author_name: string;
          status?: ListingStatus;
          sold_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: "venda" | "servicos" | "indicacoes" | "doacao" | "imoveis";
          price?: number | null;
          price_mode?: ListingPriceMode | null;
          whatsapp?: string;
          referral_name?: string | null;
          referral_whatsapp?: string | null;
          referral_notes?: string | null;
          image_url?: string | null;
          image_urls?: string[] | null;
          user_id?: string;
          author_name?: string;
          status?: ListingStatus;
          sold_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          whatsapp: string | null;
          block: string | null;
          apartment: string | null;
          role: ProfileRole;
          status: ProfileStatus;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          block?: string | null;
          apartment?: string | null;
          role?: ProfileRole;
          status?: ProfileStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          block?: string | null;
          apartment?: string | null;
          role?: ProfileRole;
          status?: ProfileStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      access_requests: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string;
          email: string;
          whatsapp: string | null;
          block: string;
          apartment: string;
          message: string | null;
          status: AccessRequestStatus;
          created_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          rejection_reason: string | null;
          terms_accepted_at: string | null;
          privacy_accepted_at: string | null;
          terms_version: string | null;
          privacy_version: string | null;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          full_name: string;
          email: string;
          whatsapp?: string | null;
          block: string;
          apartment: string;
          message?: string | null;
          status?: AccessRequestStatus;
          created_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          terms_accepted_at?: string | null;
          privacy_accepted_at?: string | null;
          terms_version?: string | null;
          privacy_version?: string | null;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          full_name?: string;
          email?: string;
          whatsapp?: string | null;
          block?: string;
          apartment?: string;
          message?: string | null;
          status?: AccessRequestStatus;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          terms_accepted_at?: string | null;
          privacy_accepted_at?: string | null;
          terms_version?: string | null;
          privacy_version?: string | null;
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

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
export type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type AccessRequestRow =
  Database["public"]["Tables"]["access_requests"]["Row"];
