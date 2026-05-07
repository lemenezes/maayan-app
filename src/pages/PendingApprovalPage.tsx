import { Clock, LogOut, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PendingApprovalPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {/* Ícone animado */}
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-5">
        <Clock className="w-8 h-8 text-amber-500 dark:text-amber-400" strokeWidth={1.5} />
      </div>

      <h1 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
        Acesso em análise
      </h1>

      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2">
        Sua solicitação foi recebida e está aguardando aprovação do administrador do condomínio.
      </p>

      {user?.email && (
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Você receberá um e-mail em{' '}
          <strong className="text-slate-700 dark:text-slate-300">{user.email}</strong> quando for aprovado.
        </p>
      )}

      {/* Dica */}
      <div className="bg-[#F0F7FF] dark:bg-[#0a1f2e]/60 border border-[#0C5A86]/15 dark:border-sky-400/15 rounded-2xl px-5 py-4 mb-8 text-left">
        <div className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-[#0C5A86] dark:text-sky-400 mt-0.5 flex-shrink-0" />
          <p className="text-[#0C5A86] dark:text-sky-300 text-xs leading-relaxed">
            Verifique sua caixa de entrada e a pasta de spam. O link de acesso chegará por e-mail após a aprovação.
          </p>
        </div>
      </div>

      <button
        onClick={signOut}
        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sair da conta
      </button>
    </div>
  );
}
