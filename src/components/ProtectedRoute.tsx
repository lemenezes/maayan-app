import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    loading,
    profile,
    profileLoading,
    profileError,
    refreshProfile
  } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-4">
          <Loader2 className="w-6 h-6 text-[#0C5A86] animate-spin mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-200 font-semibold">
            Verificando seu cadastro...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/acesso-restrito"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (!profile && profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-4">
          <Loader2 className="w-6 h-6 text-[#0C5A86] animate-spin mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-200 font-semibold">
            Verificando seu cadastro...
          </p>
        </div>
      </div>
    );
  }

  if (profileError && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md text-center">
          <p className="text-slate-700 dark:text-slate-200 font-semibold mb-2">
            Não foi possível verificar seu cadastro agora.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Tente novamente em instantes.
          </p>
          <button
            type="button"
            onClick={() => void refreshProfile()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#0C5A86] hover:bg-[#09476B] text-white text-sm font-semibold transition-colors">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md text-center">
          <Loader2 className="w-6 h-6 text-[#0C5A86] animate-spin mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-200 font-semibold">
            Verificando seu cadastro...
          </p>
        </div>
      </div>
    );
  }

  const status = String(profile.status);

  if (status === "pending") {
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  if (status === "suspended") {
    return <Navigate to="/acesso-suspenso" replace />;
  }

  if (status === "rejected") {
    return <Navigate to="/acesso-nao-aprovado" replace />;
  }

  if (status !== "approved") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md text-center">
          <p className="text-slate-700 dark:text-slate-200 font-semibold mb-2">
            Seu acesso ainda não foi liberado.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Se o problema persistir, fale com a administração.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
