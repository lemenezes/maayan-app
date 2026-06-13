import { AlertTriangle, LogOut, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AccessNotApprovedPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center justify-center mx-auto mb-5">
        <AlertTriangle
          className="w-8 h-8 text-red-500 dark:text-red-400"
          strokeWidth={1.5}
        />
      </div>

      <h1 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
        Acesso não aprovado
      </h1>

      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2">
        Seu cadastro nao foi aprovado pela administracao do condominio.
      </p>

      {user?.email && (
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Caso precise de mais informacoes, entre em contato usando o e-mail{" "}
          <strong className="text-slate-700 dark:text-slate-300">
            {user.email}
          </strong>
          .
        </p>
      )}

      <div className="bg-[#FDF2F2] dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl px-5 py-4 mb-8 text-left">
        <div className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300 text-xs leading-relaxed">
            Se houve algum erro no cadastro, solicite uma nova analise com a
            administracao.
          </p>
        </div>
      </div>

      <button
        onClick={signOut}
        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
        <LogOut className="w-4 h-4" />
        Sair da conta
      </button>
    </div>
  );
}
