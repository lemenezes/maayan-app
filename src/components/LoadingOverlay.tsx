import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  visible: boolean;
  title: string;
  subtitle: string;
  showLogo?: boolean;
}

export default function LoadingOverlay({
  visible,
  title,
  subtitle,
  showLogo = true
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-950/62 backdrop-blur-[2.5px] flex items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-label={`${title} ${subtitle}`.trim()}>
      <div className="relative w-full max-w-[350px] overflow-hidden rounded-[30px] bg-white dark:bg-slate-900 shadow-[0_30px_90px_rgba(12,90,134,0.24)] px-8 py-10 text-center">
        <div className="relative z-10 flex flex-col items-center">
          {showLogo && (
            <div className="relative mb-6 w-24 h-24 flex items-center justify-center">
              <div className="absolute -inset-4 rounded-full bg-sky-200/60 dark:bg-sky-500/25 blur-xl animate-pulse [animation-duration:2200ms]" />
              <div className="absolute inset-0 rounded-full ring-1 ring-sky-200/70 dark:ring-sky-400/25" />
              <img
                src="/web-app-manifest-512x512.png"
                alt="Logo Maayan"
                className="relative w-full h-full object-contain"
              />
            </div>
          )}

          <h2 className="font-['Cormorant_Garamond'] text-[30px] leading-none font-semibold text-[#11385B] dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
            {subtitle}
          </p>
          <Loader2 className="h-5 w-5 animate-spin text-[#0C5A86] dark:text-sky-400" />
        </div>
      </div>
    </div>
  );
}
