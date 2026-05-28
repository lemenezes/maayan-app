import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Loader2, Mail, User, Home, Building } from "lucide-react";
import { submitAccessRequest } from "../services/accessRequestsService";

const inputBase =
  "w-full px-4 py-3 rounded-xl border border-[#EEF2F7] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none transition-all focus:border-[#0C5A86] dark:focus:border-sky-500 focus:ring-2 focus:ring-[#0C5A86]/10 dark:focus:ring-sky-500/10";

export default function RequestAccessPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    block: "",
    apartment: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.block.trim() ||
      !form.apartment.trim()
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Informe um e-mail válido.");
      return;
    }

    setSubmitting(true);
    try {
      await submitAccessRequest({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        block: form.block.trim().toUpperCase(),
        apartment: form.apartment.trim(),
        message: form.message.trim() || undefined
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar solicitação."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-20 bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9]">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle
              className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
              strokeWidth={1.5}
            />
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-white mb-3">
            Solicitação enviada!
          </h2>
          <p className="text-white text-sm leading-relaxed mb-2">
            Sua solicitação foi recebida e será analisada pelo administrador do
            condomínio.
          </p>
          <p className="text-white text-sm mb-8">
            Você receberá um e-mail em{" "}
            <strong className="text-white">{form.email}</strong> com o link de
            acesso quando for aprovado.
          </p>
          <Link
            to="/"
            className="text-[#0C5A86] dark:text-sky-400 font-semibold text-sm hover:underline">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-14 sm:py-20 bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9]">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0C5A86]/10 to-[#1DAFD9]/10 dark:from-[#0C5A86]/20 dark:to-[#1DAFD9]/20 flex items-center justify-center mx-auto mb-5 border-1 border-[#0C5A86]/50 dark:border-sky-400/50">
            <Home
              className="w-6 h-6 text-white dark:text-sky-400"
              strokeWidth={1.5}
            />
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-semibold text-white mb-2">
            <span className="text-white">Solicitar acesso</span>
          </h1>
          <p className="text-white text-sm leading-relaxed max-w-sm mx-auto">
            <span className="text-white">
              O Maayan é exclusivo para moradores do condomínio. Preencha o
              formulário e aguarde a aprovação.
            </span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              <span className="text-white">Nome completo *</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={form.full_name}
                onChange={set("full_name")}
                placeholder="Seu nome completo"
                className={`${inputBase} pl-10`}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              <span className="text-white">E-mail *</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="seu@email.com"
                className={`${inputBase} pl-10`}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Bloco + Apartamento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                <span className="text-white">Bloco *</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.block}
                  onChange={set("block")}
                  placeholder="Ex: 3"
                  maxLength={10}
                  className={`${inputBase} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                <span className="text-white">Apartamento *</span>
              </label>
              <input
                type="text"
                value={form.apartment}
                onChange={set("apartment")}
                placeholder="Ex: 301"
                maxLength={10}
                className={inputBase}
              />
            </div>
          </div>

          {/* Mensagem opcional */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              <span className="text-white">Mensagem (opcional)</span>
            </label>
            <textarea
              value={form.message}
              onChange={set("message")}
              placeholder="Alguma informação adicional para o admin..."
              rows={3}
              className={`${inputBase} resize-none`}
            />
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0C5A86] text-white py-3 rounded-xl font-semibold text-sm shadow-lg hover:bg-[#1DAFD9] focus:bg-[#1DAFD9] hover:text-[#0C5A86] focus:text-[#0C5A86] hover:shadow-xl focus:shadow-xl hover:scale-[1.03] focus:scale-[1.03] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 mt-2 outline-none ring-2 ring-transparent focus:ring-[#38B6D9]/40">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando…
              </>
            ) : (
              "Enviar solicitação"
            )}
          </button>
        </form>

        <p className="text-center text-xs mt-6">
          <span className="text-white">Já tem acesso?</span>{" "}
          <Link
            to="/entrar"
            className="text-white font-semibold hover:underline drop-shadow-sm">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
