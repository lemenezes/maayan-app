import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, User, Mail, Building, CheckCircle } from "lucide-react";
// Importe ou defina inputBase e submitAccessRequest conforme seu projeto

const inputBase =
  "w-full bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#38B6D9]/40 transition-all duration-150 shadow-sm";

async function submitAccessRequest(_data: {
  full_name: string;
  email: string;
  block: string;
  apartment: string;
  message?: string;
}) {
  // Simulação de requisição (substitua pelo fetch real depois)
  return new Promise<void>(resolve => setTimeout(resolve, 1200));
}

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
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm(f => ({ ...f, [field]: value }));
      setFieldErrors(prev => {
        if (!prev[field]) return prev;
        let isValid = true;
        if (field === "full_name") isValid = value.trim().length > 0;
        if (field === "email")
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (field === "block") isValid = value.trim().length > 0;
        if (field === "apartment") isValid = value.trim().length > 0;
        if (isValid) {
          const { [field]: _, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors: { [k: string]: string } = {};
    if (!form.full_name.trim()) errors.full_name = "Informe seu nome completo.";
    if (!form.email.trim()) errors.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.email = "Informe um e-mail válido (ex: seu@email.com).";
    if (!form.block.trim()) errors.block = "Informe o bloco.";
    if (!form.apartment.trim()) errors.apartment = "Informe o apartamento.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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
        <div className="w-full max-w-xl min-h-[420px] text-center flex flex-col justify-center mx-auto">
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
          <div className="flex justify-center">
            <Link
              to="/"
              className="inline-block max-w-xs w-auto bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-[#0C5A86] dark:text-sky-400 font-semibold text-sm px-4 py-2 rounded-xl shadow hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#38B6D9]/40">
              ← Voltar ao início
            </Link>
          </div>
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
            {fieldErrors.full_name && (
              <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                {fieldErrors.full_name}
              </div>
            )}
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
                placeholder="ex: maria@email.com"
                className={`${inputBase} pl-10`}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                {fieldErrors.email}
              </div>
            )}
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
              {fieldErrors.block && (
                <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                  {fieldErrors.block}
                </div>
              )}
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
              {fieldErrors.apartment && (
                <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                  {fieldErrors.apartment}
                </div>
              )}
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
              placeholder="Alguma informação adicional para o admininistrador."
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
            {submitting ? "Enviando..." : "Enviar solicitação"}
          </button>
        </form>
      </div>
    </div>
  );
}
