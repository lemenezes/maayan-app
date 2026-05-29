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
    <section className="relative flex items-center justify-center py-20 px-2 sm:py-24 bg-gradient-to-br from-white via-[#F3F8FC] to-[#E6F2FA] overflow-hidden">
      {/* Ilustração sutil (prédio) */}
      <svg
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 w-[340px] h-[180px] opacity-10 z-0 pointer-events-none select-none hidden sm:block"
        viewBox="0 0 340 180"
        fill="none">
        <rect
          x="60"
          y="60"
          width="60"
          height="80"
          rx="12"
          fill="#0C5A86"
          fillOpacity="0.12"
        />
        <rect
          x="140"
          y="40"
          width="60"
          height="100"
          rx="12"
          fill="#1DAFD9"
          fillOpacity="0.10"
        />
        <rect
          x="220"
          y="70"
          width="60"
          height="70"
          rx="12"
          fill="#0C5A86"
          fillOpacity="0.09"
        />
      </svg>
      {/* Mock de cards desfocados, responsivo e simétrico */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <div className="flex gap-2 sm:gap-6 opacity-60 w-full justify-center">
          {/* Esquerda */}
          <div className="hidden sm:block w-24 h-16 rounded-2xl bg-slate-300/70 dark:bg-slate-800/50 blur-[2px] shadow-xl border border-white/30" />
          <div className="w-20 h-14 sm:w-28 sm:h-20 rounded-2xl bg-slate-400/80 dark:bg-slate-800/60 blur-[3px] shadow-xl border border-white/30" />
          {/* Centro */}
          <div className="w-32 h-24 sm:w-56 sm:h-40 rounded-2xl bg-slate-500/90 dark:bg-slate-900/70 blur-md shadow-xl border border-white/30 scale-105 sm:scale-110" />
          {/* Direita */}
          <div className="w-20 h-14 sm:w-28 sm:h-20 rounded-2xl bg-slate-400/80 dark:bg-slate-800/60 blur-[3px] shadow-xl border border-white/30" />
          <div className="hidden sm:block w-24 h-16 rounded-2xl bg-slate-300/70 dark:bg-slate-800/50 blur-[2px] shadow-xl border border-white/30" />
        </div>
      </div>
      {/* Card principal glass mais forte, borda dupla e sombra */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-10 sm:px-8 sm:py-14 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-2 border-white/60 dark:border-slate-700/60 shadow-2xl ring-1 ring-[#0C5A86]/10">
        {/* Borda glass extra */}
        <div
          className="absolute inset-0 rounded-3xl border-2 border-[#1DAFD9]/20 pointer-events-none"
          style={{ filter: "blur(2.5px)" }}
        />
        {/* Ícone maior */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0C5A86]/10 to-[#1DAFD9]/10 dark:from-[#0C5A86]/20 dark:to-[#1DAFD9]/20 flex items-center justify-center mx-auto mb-6 border border-[#0C5A86]/15 dark:border-[#1DAFD9]/20 shadow">
          <Lock
            className="w-10 h-10 text-[#0C5A86] dark:text-sky-400"
            strokeWidth={1.5}
          />
        </div>
        {/* Título */}
        <h3 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-wide">
          Exclusivo para moradores
        </h3>
        {/* Mensagem */}
        <p className="text-slate-600 dark:text-slate-300 text-base mb-8 max-w-xs leading-relaxed">
          {message}
        </p>
        {/* CTAs */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          <Link
            to="/entrar"
            className="bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white px-6 sm:px-7 py-3 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity shadow">
            Entrar
          </Link>
          <Link
            to="/solicitar-acesso"
            className="text-[#0C5A86] dark:text-sky-400 text-base font-semibold px-4 sm:px-5 py-3 rounded-xl border border-[#0C5A86]/25 dark:border-sky-400/20 hover:bg-[#0C5A86]/10 dark:hover:bg-sky-400/10 transition-all">
            Solicitar acesso
          </Link>
        </div>
      </div>
    </section>
  );
}
