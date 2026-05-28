import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

interface GuestWallProps {
  /** Texto explicativo contextual */
  message?: string;
}

/**
 * Locked state elegante exibido para visitantes não autenticados.
 * Não redireciona — apenas exibe um CTA para fazer login.
 */
export default function GuestWall({
  message = "Entre para acessar os anúncios da comunidade."
}: GuestWallProps) {
  return (
    <div className="relative flex items-center justify-center py-24 px-4">
      {/* Mock de cards desfocados */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <div className="flex gap-6 opacity-60">
          <div className="w-56 h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-700/40 blur-sm shadow-xl border border-white/30" />
          <div className="w-56 h-40 rounded-2xl bg-slate-200/70 dark:bg-slate-700/50 blur-md shadow-xl border border-white/30 scale-110" />
          <div className="w-56 h-28 rounded-2xl bg-slate-200/50 dark:bg-slate-700/30 blur-sm shadow-xl border border-white/30" />
        </div>
      </div>
      {/* Card principal glass */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-14 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 shadow-2xl">
        {/* Ícone maior */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0C5A86]/10 to-[#1DAFD9]/10 dark:from-[#0C5A86]/20 dark:to-[#1DAFD9]/20 flex items-center justify-center mx-auto mb-6 border border-[#0C5A86]/15 dark:border-[#1DAFD9]/20 shadow">
          <Lock
            className="w-10 h-10 text-[#0C5A86] dark:text-sky-400"
            strokeWidth={1.5}
          />
        </div>
        {/* Título */}
        <h3 className="font-['Cormorant_Garamond'] text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-wide">
          Exclusivo para moradores
        </h3>
        {/* Mensagem */}
        <p className="text-slate-600 dark:text-slate-300 text-base mb-8 max-w-xs leading-relaxed">
          {message}
        </p>
        {/* CTAs */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            to="/entrar"
            className="bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white px-7 py-3 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity shadow">
            Entrar
          </Link>
          <Link
            to="/solicitar-acesso"
            className="text-[#0C5A86] dark:text-sky-400 text-base font-semibold px-5 py-3 rounded-xl border border-[#0C5A86]/25 dark:border-sky-400/20 hover:bg-[#0C5A86]/10 dark:hover:bg-sky-400/10 transition-all">
            Solicitar acesso
          </Link>
        </div>
      </div>
    </div>
  );
}
