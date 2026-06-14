import { CATEGORIES } from "../types";
import type { Category } from "../types";

interface CategoryFilterProps {
  active: Category | null;
  onChange: (category: Category | null) => void;
}

export default function CategoryFilter({
  active,
  onChange
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center lg:flex-nowrap lg:items-center lg:justify-start gap-2 pb-0.5 lg:pb-0 lg:overflow-x-auto">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all flex-shrink-0 ${
          active === null
            ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
            : "bg-white/80 backdrop-blur-md dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-slate-700"
        }`}>
        Todos
      </button>
      {CATEGORIES.map(cat => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onChange(active === cat.value ? null : cat.value)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all flex items-center gap-1 flex-shrink-0 ${
            active === cat.value
              ? cat.pillActiveClass + " shadow-[0_1px_3px_rgba(15,23,42,0.12)]"
              : "bg-white/80 backdrop-blur-md dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-slate-700"
          }`}>
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
