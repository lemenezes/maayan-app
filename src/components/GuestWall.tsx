import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface GuestWallProps {
  /** Texto explicativo contextual */
  message?: string;
}

/**
 * Locked state elegante exibido para visitantes não autenticados.
 * Não redireciona — apenas exibe um CTA para fazer login.
 */
export default function GuestWall({
  message = 'Entre para acessar os anúncios da comunidade.',
}: GuestWallProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      {/* Ícone */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0C5A86]/10 to-[#1DAFD9]/10 dark:from-[#0C5A86]/20 dark:to-[#1DAFD9]/20 flex items-center justify-center mx-auto mb-5 border border-[#0C5A86]/15 dark:border-[#1DAFD9]/20">
        <Lock className="w-7 h-7 text-[#0C5A86] dark:text-sky-400" strokeWidth={1.5} />
      </div>

      {/* Título */}
      <h3 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
        Exclusivo para moradores
      </h3>

      {/* Mensagem */}
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-7 max-w-xs leading-relaxed">
        {message}
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Link
          to="/entrar"
          className="bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          Entrar
        </Link>
        <Link
          to="/solicitar-acesso"
          className="text-[#0C5A86] dark:text-sky-400 text-sm font-medium px-4 py-2.5 rounded-xl border border-[#0C5A86]/25 dark:border-sky-400/20 hover:bg-[#0C5A86]/6 dark:hover:bg-sky-400/8 transition-all"
        >
          Solicitar acesso
        </Link>
      </div>
    </div>
  );
}
