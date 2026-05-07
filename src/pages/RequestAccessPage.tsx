import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Loader2, Mail, User, Home, Building } from 'lucide-react';
import { submitAccessRequest } from '../services/accessRequestsService';

const inputBase =
  'w-full px-4 py-3 rounded-xl border border-[#EEF2F7] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none transition-all focus:border-[#0C5A86] dark:focus:border-sky-500 focus:ring-2 focus:ring-[#0C5A86]/10 dark:focus:ring-sky-500/10';

export default function RequestAccessPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    block: '',
    apartment: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.full_name.trim() || !form.email.trim() || !form.block.trim() || !form.apartment.trim()) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Informe um e-mail válido.');
      return;
    }

    setSubmitting(true);
    try {
      await submitAccessRequest({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        block: form.block.trim().toUpperCase(),
        apartment: form.apartment.trim(),
        message: form.message.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar solicitação.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        </div>
        <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Solicitação enviada!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-2">
          Sua solicitação foi recebida e será analisada pelo administrador do condomínio.
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          Você receberá um e-mail em <strong className="text-slate-700 dark:text-slate-300">{form.email}</strong> com o link de acesso quando for aprovado.
        </p>
        <Link
          to="/"
          className="text-[#0C5A86] dark:text-sky-400 font-semibold text-sm hover:underline"
        >
          ← Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-14 sm:py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0C5A86]/10 to-[#1DAFD9]/10 dark:from-[#0C5A86]/20 dark:to-[#1DAFD9]/20 flex items-center justify-center mx-auto mb-5 border border-[#0C5A86]/15 dark:border-sky-400/20">
          <Home className="w-6 h-6 text-[#0C5A86] dark:text-sky-400" strokeWidth={1.5} />
        </div>
        <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
          Solicitar acesso
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
          O Maayan é exclusivo para moradores do condomínio. Preencha o formulário e aguarde a aprovação.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Nome completo *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={form.full_name}
              onChange={set('full_name')}
              placeholder="Seu nome completo"
              className={`${inputBase} pl-10`}
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            E-mail *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
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
              Bloco *
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={form.block}
                onChange={set('block')}
                placeholder="Ex: A"
                maxLength={10}
                className={`${inputBase} pl-10`}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Apartamento *
            </label>
            <input
              type="text"
              value={form.apartment}
              onChange={set('apartment')}
              placeholder="Ex: 301"
              maxLength={10}
              className={inputBase}
            />
          </div>
        </div>

        {/* Mensagem opcional */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
            Mensagem <span className="font-normal text-slate-400 normal-case">(opcional)</span>
          </label>
          <textarea
            value={form.message}
            onChange={set('message')}
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
          className="w-full bg-gradient-to-r from-[#0A3558] via-[#0F5C88] to-[#38B6D9] text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2 mt-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando…
            </>
          ) : (
            'Enviar solicitação'
          )}
        </button>
      </form>

      <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-6">
        Já tem acesso?{' '}
        <Link to="/entrar" className="text-[#0C5A86] dark:text-sky-400 font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
