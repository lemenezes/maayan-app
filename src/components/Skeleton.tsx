export function SkeletonCard() {
  return (
    <div className="bg-white/80 backdrop-blur-md dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100/60 dark:border-slate-700/40 shadow-sm">
      <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-4/5" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-full" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-3/5" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-1/3 mt-1" />
        <div className="flex justify-between items-center mt-1">
          <div className="flex flex-col gap-1.5">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-24" />
            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16" />
          </div>
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonCategories() {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-1.5 sm:gap-3 p-3 sm:p-6 w-[30%] sm:w-36 lg:flex-1 bg-white/80 backdrop-blur-md dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700/50 animate-pulse">
          <div className="w-7 h-7 sm:w-10 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-3 w-14 sm:h-3.5 sm:w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="hidden sm:block h-2.5 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}
