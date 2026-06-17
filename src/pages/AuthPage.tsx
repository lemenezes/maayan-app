import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";

export default function AuthPage({ mode }: { mode: Mode }) {
  // Sempre rola para o topo ao abrir a tela de login
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Suporta parâmetro de query string "from" ou state.from
  const from =
    new URLSearchParams(location.search).get("from") ??
    (location.state as { from?: string })?.from ??
    "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValue = email.trim();
    if (!emailValue) {
      setError("Informe seu e-mail.");
      return;
    }
    // Regex simples para validar formato de e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError("Informe um e-mail válido (ex: nome@exemplo.com.br).");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    setError(null);

    if (mode === "login") {
      const { error: err } = await signIn(email.trim(), password);
      if (err) {
        setError(translateAuthError(err));
        setSubmitting(false);
      } else {
        navigate(from, { replace: true });
      }
    } else {
      const { error: err } = await signUp(email.trim(), password);
      if (err) {
        setError(translateAuthError(err));
        setSubmitting(false);
      } else {
        setSuccess(true);
        setSubmitting(false);
      }
    }
  };

  const inputBase =
    "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none transition-all";

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">📧</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          Confirme seu e-mail
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Enviamos um link de confirmação para <strong>{email}</strong>.
          <br />
          Verifique sua caixa de entrada e clique no link para ativar sua conta.
        </p>
        <Link
          to="/entrar"
          className="text-[#0C5A86] font-semibold hover:text-[#0C5A86] transition-colors">
          Ir para o login →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-start justify-center px-4 pt-6 pb-1 sm:pt-28 sm:pb-2 bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9]">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl shadow-lg dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700/50 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center overflow-hidden">
              <img
                src="/favicon.svg"
                alt="Maayan"
                className="w-full h-full object-contain scale-[1.35]"
              />
            </div>
            <p className="text-center text-base font-semibold text-slate-700 dark:text-slate-200 -mt-5">
              {mode === "login"
                ? "Acesse o portal dos moradores"
                : "Solicite acesso ao portal do Maayan"}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="nome@exemplo.com.br"
                className={`${inputBase} border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40`}
              />
              {(error === "Informe seu e-mail." ||
                (typeof error === "string" &&
                  error.startsWith("Informe um e-mail válido"))) && (
                <div className="mt-2 text-red-600 dark:text-red-400 text-xs animate-fade-in">
                  {error}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder={
                    mode === "register" ? "Mínimo 6 caracteres" : "••••••••"
                  }
                  className={`${inputBase} pr-11 border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40`}
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
              {error === "A senha precisa ter pelo menos 6 caracteres." && (
                <div className="mt-2 text-red-600 dark:text-red-400 text-xs animate-fade-in">
                  {error}
                </div>
              )}
            </div>

            {/* Error geral (exceto e-mail e senha) */}
            {error &&
              error !== "Informe seu e-mail." &&
              error !== "Informe um e-mail válido." &&
              // error !== "Informe um e-mail válido (ex: nome@exemplo.com.br)." &&
              error !== "A senha precisa ter pelo menos 6 caracteres." && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl animate-fade-in">
                  {error}
                </div>
              )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white font-semibold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting && mode === "login"
                ? "Entrando..."
                : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            {mode === "login" ? (
              <>
                Ainda não possui acesso?{" "}
                <Link
                  to="/cadastro"
                  className="text-[#0C5A86] font-semibold hover:text-[#0C5A86] transition-colors">
                  Solicitar acesso
                </Link>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <Link
                  to="/entrar"
                  className="text-[#0C5A86] font-semibold hover:text-[#0C5A86] transition-colors">
                  Entrar
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Back link */}
        <p className="text-center text-sm mt-3">
          <Link
            to="/"
            className="text-white font-semibold hover:text-[#0C5A86] transition-colors drop-shadow-sm">
            ← Voltar para a página inicial
          </Link>
        </p>
      </div>
    </div>
  );
}

function translateAuthError(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (msg.includes("Email not confirmed"))
    return "Confirme seu e-mail antes de entrar.";
  if (msg.includes("User already registered"))
    return "Este e-mail já está cadastrado.";
  if (msg.includes("Password should be at least"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("Unable to validate email")) return "E-mail inválido.";
  return msg;
}
