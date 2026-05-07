import { CATEGORIES } from '../types';
import type { Category } from '../types';

interface CategoryFilterProps {
  active: Category | null;
  onChange: (category: Category | null) => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
          active === null
            ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        Todos
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(active === cat.value ? null : cat.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
            active === cat.value
              ? cat.pillActiveClass + ' shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
