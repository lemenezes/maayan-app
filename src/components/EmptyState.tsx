import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, actions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      {icon && (
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-7 max-w-xs">{description}</p>
      )}
      {actions && <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>}
    </div>
  );
}

export function EmptyListings() {
  return (
    <EmptyState
      icon={<Tag className="w-7 h-7 text-slate-300 dark:text-slate-500" />}
      title="Nenhum anúncio ainda"
      description="Seja a primeira pessoa a publicar! Venda, doe ou ofereça serviços para a comunidade."
      actions={
        <Link
          to="/publicar"
          className="bg-gradient-to-r from-sky-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Publicar primeiro anúncio
        </Link>
      }
    />
  );
}
