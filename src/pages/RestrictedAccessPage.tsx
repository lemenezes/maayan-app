import { Lock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function RestrictedAccessPage() {
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/anuncios";

  // Construir URLs com redirecionamento pós-login
  const loginUrl = `/entrar?from=${encodeURIComponent(from)}`;
  const requestAccessUrl = `/solicitar-acesso?from=${encodeURIComponent(from)}`;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-16 text-center sm:min-h-[calc(100vh-12rem)] flex flex-col justify-center">
      {/* Icon */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-center justify-center mx-auto mb-4 sm:mb-5">
        <Lock
          className="w-8 h-8 text-[#0C5A86] dark:text-sky-400"
          strokeWidth={1.5}
        />
      </div>

      {/* Título */}
      <h1 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3">
        Acesso restrito
      </h1>

      {/* Mensagem principal */}
      <p className="text-center max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-2 md:whitespace-nowrap">
        Você tentou acessar um anúncio exclusivo para moradores.
      </p>

      {/* Texto complementar */}
      <p className="text-center max-w-2xl mx-auto text-slate-500 dark:text-slate-500 text-sm mb-6 sm:mb-8 leading-relaxed">
        Este conteúdo é exclusivo para moradores cadastrados no Portal Maayan.
        Faça login para visualizar e entrar em contato com o anunciante.
      </p>

      {/* Botões */}
      <div className="flex flex-col gap-2.5 sm:gap-3 mb-5 sm:mb-6">
        <Link
          to={loginUrl}
          className="inline-flex items-center justify-center bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white font-semibold py-2.5 sm:py-3 px-6 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all">
          Entrar
        </Link>

        <Link
          to={requestAccessUrl}
          className="inline-flex items-center justify-center border-2 border-[#0C5A86] text-[#0C5A86] dark:text-sky-400 dark:border-sky-400 font-semibold py-2.5 sm:py-3 px-6 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all">
          Solicitar acesso
        </Link>
      </div>

      {/* Info box */}
      <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-2xl px-4 py-3 text-left md:text-center mb-5 sm:mb-6">
        <p className="text-center max-w-2xl mx-auto text-sky-800 dark:text-sky-300 text-sm leading-relaxed">
          <strong>Já possui acesso aprovado?</strong> Entre com o mesmo e-mail
          utilizado no cadastro.
        </p>
      </div>

      {/* Redirect message */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-2xl px-4 py-3 text-left md:text-center">
        <p className="text-center max-w-2xl mx-auto text-green-800 dark:text-green-300 text-sm leading-relaxed">
          Após o login você será redirecionado automaticamente para o anúncio.
        </p>
      </div>

      {/* Back link */}
      <p className="mt-6 sm:mt-8">
        <Link
          to="/"
          className="text-slate-500 dark:text-slate-400 text-sm hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          ← Voltar para a página inicial
        </Link>
      </p>
    </div>
  );
}
