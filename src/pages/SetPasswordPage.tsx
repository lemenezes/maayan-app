import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = window.setTimeout(() => {
      navigate("/entrar", { replace: true });
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [navigate, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!session) {
      setError("Link inválido ou expirado. Solicite um novo convite ao administrador.");
      return;
    }

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A confirmação da senha não confere.");
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password
    });

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSuccess(true);
  };

  const inputBase =
    "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none transition-all border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40";

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-20 bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9]">
        <div className="bg-white/80 dark:bg-slate-800/90 rounded-3xl p-8 text-center max-w-md w-full">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#0C5A86]" />
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            Validando seu link de acesso...
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-start justify-center px-4 pt-8 pb-10 sm:pt-20 bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9]">
        <div className="w-full max-w-md bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700/50 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Senha definida com sucesso
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
            Redirecionando para a tela de login...
          </p>
          <Link
            to="/entrar"
            className="text-[#0C5A86] font-semibold hover:text-[#1DAFD9] transition-colors">
            Ir para login agora →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-start justify-center px-4 pt-6 pb-1 sm:pt-28 sm:pb-2 bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9]">
      <div className="w-full max-w-md">
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl shadow-lg dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700/50 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center overflow-hidden">
              <img
                src="/favicon.svg"
                alt="Maayan"
                className="w-full h-full object-contain scale-[1.35]"
              />
            </div>
            <p className="text-center text-base font-semibold text-slate-700 dark:text-slate-200 -mt-5">
              Defina sua senha de acesso
            </p>
          </div>

          {!session && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm px-4 py-3 rounded-xl mb-4">
              Link inválido ou expirado. Solicite um novo convite ao administrador.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nova senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Mínimo 6 caracteres"
                  className={`${inputBase} pr-11`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Repita sua senha"
                  className={`${inputBase} pr-11`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  aria-label={
                    showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"
                  }>
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !session}
              className="w-full bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white font-semibold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Definir minha senha
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-3">
          <Link
            to="/entrar"
            className="text-white font-semibold hover:text-[#0C5A86] transition-colors drop-shadow-sm">
            ← Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
