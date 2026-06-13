export type Category =
  | "venda"
  | "servicos"
  | "indicacoes"
  | "doacao"
  | "imoveis";

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

export type ProfileRole = "resident" | "admin" | "user";
export type ProfileStatus = "pending" | "approved" | "rejected" | "suspended";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  block: string | null;
  apartment: string | null;
  role: ProfileRole;
  status: ProfileStatus;
  created_at: string;
}

export interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string | null;
  block: string;
  apartment: string;
  message: string | null;
  status: RequestStatus;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: Category;
  price?: number;
  priceMode?: ListingPriceMode;
  whatsapp: string;
  images: string[];
  authorName: string;
  apartment?: string;
  createdAt: string;
}

export interface CategoryConfig {
  value: Category;
  label: string;
  icon: string;
  badgeClass: string;
  pillActiveClass: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    value: "venda",
    label: "Venda",
    icon: "🏷️",
    badgeClass: "bg-sky-50 text-[#0C5A86] border border-sky-200",
    pillActiveClass: "bg-[#0C5A86] text-white border-[#0C5A86]"
  },
  {
    value: "servicos",
    label: "Serviços",
    icon: "🔧",
    badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    pillActiveClass: "bg-indigo-600 text-white border-indigo-600"
  },
  {
    value: "indicacoes",
    label: "Indicações",
    icon: "⭐",
    badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
    pillActiveClass: "bg-amber-500 text-white border-amber-500"
  },
  {
    value: "doacao",
    label: "Doação",
    icon: "🎁",
    badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    pillActiveClass: "bg-emerald-600 text-white border-emerald-600"
  },
  {
    value: "imoveis",
    label: "Imóveis",
    icon: "🏠",
    badgeClass: "bg-rose-50 text-rose-700 border border-rose-200",
    pillActiveClass: "bg-rose-500 text-white border-rose-500"
  }
];
