export type Category = 'venda' | 'servicos' | 'indicacoes' | 'doacao' | 'imoveis';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: Category;
  price?: number;
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
    value: 'venda',
    label: 'Venda',
    icon: '🏷️',
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200',
    pillActiveClass: 'bg-sky-500 text-white border-sky-500',
  },
  {
    value: 'servicos',
    label: 'Serviços',
    icon: '🔧',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    pillActiveClass: 'bg-purple-600 text-white border-purple-600',
  },
  {
    value: 'indicacoes',
    label: 'Indicações',
    icon: '⭐',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    pillActiveClass: 'bg-amber-500 text-white border-amber-500',
  },
  {
    value: 'doacao',
    label: 'Doação',
    icon: '🎁',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    pillActiveClass: 'bg-emerald-600 text-white border-emerald-600',
  },
  {
    value: 'imoveis',
    label: 'Imóveis',
    icon: '🏠',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
    pillActiveClass: 'bg-rose-500 text-white border-rose-500',
  },
];
